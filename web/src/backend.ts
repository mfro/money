import { assert } from '@mfro/ts-common/assert';
import { Octokit } from '@octokit/rest';

const clientId = '70e7cbe421d5790c41b0';

interface GithubAuthorization {
  access_token: string;
  token_type: string;
  scope: string;
}

interface Context {
  api: Octokit;
  user: string;
  filePath: string;
  fileHash: string | null;
}

function authStrategy(context: GithubAuthorization) {
  return {
    hook: (request: Function, options: any) => {
      options.headers['authorization'] = `Bearer ${context.access_token}`;
      return request(options);
    },
  };
}

let context: Context | undefined;

export async function load(filePath: string) {
  assert(context === undefined, 're-init');

  const currentUrl = new URL(location.href);
  const code = currentUrl.searchParams.get('code');

  if (code != null) {
    currentUrl.searchParams.delete('code');
    currentUrl.pathname = '/';
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
      user: user.login,
      filePath,
      fileHash,
    };

    return content;
  } else {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('scope', 'repo');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', `http://localhost:8080/oauth-callback`);

    location.assign(url.toString());
    assert(false, 'location.assign');
  }
}

export async function save(content: Buffer) {
  assert(context !== undefined, 'not init');
  const { api, user, filePath, fileHash } = context;

  const options = {
    owner: user,
    repo: 'mfro-backend',
    path: filePath,
    message: 'test message',
    content: content.toString('base64'),
  };

  if (fileHash != null) {
    Object.assign(options, { sha: fileHash });
  }

  await api.repos.createOrUpdateFileContents(options);
}

// export async function getFile(path: string) {

//   const existing = await api.repos.getContent({
//     owner: user.login,
//     repo: 'mfro-backend',
//     path: 'test file',
//   });

//   console.log(existing);
//   debugger;

//   if (existing.status == 200) {
//     assert(typeof existing.data == 'object', 'test');
//     assert('content' in existing.data, 'test');
//     Object.assign(options, {
//       sha: existing.data.sha,
//     });
//   }

//   // const treeRsp = await api.git.createTree({
//   //   repo: 'mfro-backend',
//   //   owner: user.login,
//   //   tree: [{
//   //     path: 'test',
//   //     mode: '100644',
//   //     type: 'blob',
//   //     content: 'test',
//   //   }],
//   // });
//   // console.log(treeRsp);

//   // const commitRsp = await api.git.createCommit({
//   //   repo: 'mfro-backend',
//   //   owner: user.login,
//   //   message: 'test commit',
//   //   tree: treeRsp.data.sha,
//   // });
//   // console.log(commitRsp);

//   // const updateRsp = await api.git.updateRef({
//   //   repo: 'mfro-backend',
//   //   owner: user.login,
//   //   ref: 'main',
//   //   sha: commitRsp.data.sha,
//   // });
//   // console.log(updateRsp);
// }

//   // create repo

//   // get ref
//   // get commit
//   // get tree
//   // get blob

//   // create blob
//   // create tree
//   // create commit
//   // update ref
