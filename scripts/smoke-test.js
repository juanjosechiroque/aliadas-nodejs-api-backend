#!/usr/bin/env node
const http = require('http');
const app = require('../src/app');

const server = http.createServer(app);
server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  http
    .get(`http://127.0.0.1:${port}/api/health`, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        server.close(() => {
          if (res.statusCode !== 200) {
            console.error('smoke fail status', res.statusCode, body);
            process.exit(1);
          }
          try {
            const j = JSON.parse(body);
            if (j.status !== 'ok') {
              throw new Error('unexpected health body');
            }
          } catch (e) {
            console.error('smoke fail parse', e.message, body);
            process.exit(1);
          }
          console.log('smoke ok: /api/health');
          process.exit(0);
        });
      });
    })
    .on('error', (e) => {
      console.error(e);
      server.close();
      process.exit(1);
    });
});
