import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const publicFiles = new Set(['index.html', 'style.css', 'app.js', 'god-mode.js', 'simulation.js', 'city-mode.js', 'city-simulation.js', 'city.css', 'world-mode.js', 'world-simulation.js', 'world.css', 'earth-data.js', 'earth-geography.js', 'earth-renderer.js', 'data/earth-blue-marble.jpg', 'preview.png', 'favicon.svg']);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const resource = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!publicFiles.has(resource)) { res.writeHead(404).end('Not found'); return; }
    const file = path.resolve(root, resource);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1', () => console.log('Little World is running at http://localhost:' + server.address().port));
