yarn build
scp main.js 10.8.1.3:server/github-auth-proxy/main.js
ssh 10.8.1.3 startup/github-auth-proxy.sh
