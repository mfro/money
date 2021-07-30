import { assert } from '@mfro/ts-common/assert';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

const clientId = '70e7cbe421d5790c41b0';

type User = RestEndpointMethodTypes["users"]["getAuthenticated"]["response"]["data"];

interface GithubAuthorization {
  access_token: string;
  token_type: string;
  scope: string;
}

interface Context {
  api: Octokit;
  auth: GithubAuthorization;
  user: User;
  filePath: string;
  fileHash: string | null;
}

let context: Context | undefined;

function authStrategy(auth: GithubAuthorization) {
  return {
    hook: (request: Function, options: any) => {
      options.headers['authorization'] = `Bearer ${auth.access_token}`;
      return request(options);
    },
  };
}

export async function load(filePath: string) {
  assert(context === undefined, 're-init');

  const currentUrl = new URL(location.href);
  const code = currentUrl.searchParams.get('code');

  if (code != null) {
    const redirect = localStorage.getItem('mfro:debug-redirect');
    if (redirect) {
      const url = new URL(redirect);
      url.searchParams.set('code', code);
      location.assign(url.toString());
      assert(false, 'location.assign');
    }

    currentUrl.searchParams.delete('code');
    history.replaceState(null, document.title, currentUrl.toString());

    const url = new URL('https://api.mfro.me/github-auth-proxy/login/oauth/access_token');
    url.searchParams.set('code', code);
    url.searchParams.set('client_id', clientId);

    const authRsp = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'accept': 'application/vnd.github.v3+json' },
    });

    const auth: GithubAuthorization = await authRsp.json();

    const api = new Octokit({ auth, authStrategy });

    const { data: user } = await api.users.getAuthenticated();

    let content, fileHash;
    try {
      const existing = await api.repos.getContent({
        owner: user.login,
        repo: 'mfro-backend',
        path: filePath,
      });

      assert(typeof existing.data == 'object', 'test');
      assert('content' in existing.data, 'test');
      content = Buffer.from(existing.data.content, 'base64');
      fileHash = existing.data.sha;
    } catch (e) {
      content = null;
      fileHash = null;
    }

    context = {
      api,
      auth,
      user,
      filePath,
      fileHash,
    };

    return content;
  } else {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('scope', 'repo read:user user:email');
    url.searchParams.set('client_id', clientId);

    location.assign(url.toString());
    assert(false, 'location.assign');
  }
}

export async function save(content: Buffer) {
  assert(context !== undefined, 'not init');
  const { api, user, filePath, fileHash } = context;

  const { data: result } = await api.repos.createOrUpdateFileContents({
    owner: user.login,
    repo: 'mfro-backend',
    path: filePath,
    message: `update ${filePath}`,
    content: content.toString('base64'),
    sha: fileHash ?? undefined,
    author: {
      name: 'mfro github backend',
      email: 'backend@mfro.me',
    },
    committer: {
      name: user.name!,
      email: user.email!,
    },
  });

  context.fileHash = result.content?.sha ?? null;
}
