import { readFileSync } from 'fs';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { request } from 'https';

import { assert } from '@mfro/ts-common/assert';

interface Config {
  port: number;
  client_secret: string;
}

const config: Config = JSON.parse(readFileSync('config.json', 'utf8'));

const server = new Server((incomingReq: IncomingMessage, outgoingRsp: ServerResponse) => {
  assert(incomingReq.url != null, 'url');
  const incomingUrl = new URL(`url:test${incomingReq.url}`);

  const code = incomingUrl.searchParams.get('code');
  assert(code != null, 'code');

  const client_id = incomingUrl.searchParams.get('client_id');
  assert(client_id != null, 'client_id');

  const outgoingUrl = new URL('https://github.com/login/oauth/access_token');
  outgoingUrl.searchParams.set('code', code);
  outgoingUrl.searchParams.set('client_id', client_id);
  outgoingUrl.searchParams.set('client_secret', config.client_secret);

  const outgoingReq = request({
    method: 'POST',
    protocol: outgoingUrl.protocol,
    host: outgoingUrl.host,
    path: outgoingUrl.pathname + outgoingUrl.search,
  }, (incomingRsp) => {
    outgoingRsp.setHeader('access-control-allow-origin', '*');
    outgoingRsp.setHeader('access-control-allow-method', 'POST');
    outgoingRsp.statusCode = incomingRsp.statusCode!;
    incomingRsp.pipe(outgoingRsp);
  });

  outgoingReq.setHeader('accept', 'application/json');
  outgoingReq.end();
});

server.on('listening', () => {
  console.log(`listening on port: ${config.port}`);
});

server.listen(config.port);
