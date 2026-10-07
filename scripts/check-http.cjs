const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..', 'dist');
const basePath = new URL(process.env.SITE_URL || 'https://lab-self.github.io/pathikatravels/').pathname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((request, response) => {
  let requestPath;
  try { requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  if (!requestPath.startsWith(basePath)) { response.writeHead(404).end(); return; }
  let file = path.resolve(root, requestPath.slice(basePath.length) || '.');
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) { response.writeHead(404).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  let status = 200;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { file = path.join(root, '404.html'); status = 404; }
  response.writeHead(status, { 'Content-Type': `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(file).pipe(response);
});

server.listen(0, '127.0.0.1', async () => {
  try {
    const address = server.address();
    const paths = ['', 'domestic/', 'international/', 'category/', 'about/', 'contact/', 'booking-policies/'];
    for (const route of paths) {
      const pageUrl = `http://127.0.0.1:${address.port}${basePath}${route}?refresh-check=1`;
      const response = await fetch(pageUrl);
      assert.equal(response.status, 200, `${route || '/'} direct refresh status`);
      const html = await response.text();
      assert.match(html, /<main\b/, `${route || '/'} page content`);
      for (const [, href] of html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)) {
        const asset = await fetch(new URL(href, pageUrl));
        assert.equal(asset.status, 200, `${route || '/'} stylesheet ${href}`);
      }
      for (const [, src] of html.matchAll(/<script defer src="([^"]+)"/g)) {
        const asset = await fetch(new URL(src, pageUrl));
        assert.equal(asset.status, 200, `${route || '/'} script ${src}`);
      }
    }
    const missing = await fetch(`http://127.0.0.1:${address.port}${basePath}missing/nested/page/`);
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /<base href=/, 'Nested 404 asset base');
    console.log(`Direct-route refresh smoke passed for ${paths.length} pages and a nested 404.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally { server.close(); }
});
