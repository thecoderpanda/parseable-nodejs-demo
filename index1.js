const http = require('http');
const { diag } = require('@opentelemetry/api');

const server = http.createServer((req, res) => {
  diag.info('Received a request');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log(`Server running at http://localhost:3000/`);
});
