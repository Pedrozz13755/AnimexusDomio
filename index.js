const http = require('http');

const targetUrl = 'http://speedhosting.cloud:2040';

function handleProxyError(err, res) {
  console.error(`Proxy error: ${err.message}`);
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.end('Bad gateway');
}

// Criação do servidor HTTP
const server = http.createServer((req, res) => {
  if (!['GET', 'POST'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  req.setTimeout(30000, () => {
    res.writeHead(504, { 'Content-Type': 'text/plain' });
    res.end('Gateway Timeout');
  });

  const options = {
    hostname: 'speedhosting.cloud',
    port: 2040,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => handleProxyError(err, res));
  req.pipe(proxyReq);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Inicia o servidor na porta 80
server.listen(80, () => {
  console.log('Proxy server listening on port 80');
});