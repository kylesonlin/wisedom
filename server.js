const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Set timeout values
const SOCKET_TIMEOUT = 30000; // 30 seconds
const SERVER_TIMEOUT = 120000; // 2 minutes

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    
    // Set server timeout
    res.setTimeout(SERVER_TIMEOUT, () => {
      console.error('Server timeout');
      res.writeHead(408);
      res.end('Request timeout');
    });

    // Handle WebSocket upgrade requests
    if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
      req.socket.setTimeout(SOCKET_TIMEOUT);
      req.socket.on('timeout', () => {
        console.error('WebSocket timeout');
        req.socket.end();
      });
    }

    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 