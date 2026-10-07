const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const domain = process.env.CUSTOM_DOMAIN?.trim().toLowerCase();
if (domain && !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
  throw new Error('CUSTOM_DOMAIN must be a bare DNS name such as www.example.com.');
}
const [owner, repository] = (process.env.GITHUB_REPOSITORY || 'lab-self/pathikatravels').split('/');
const siteUrl = new URL(process.env.SITE_URL || (domain ? `https://${domain}/` : `https://${owner}.github.io/${repository.toLowerCase()}/`));
if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) {
  throw new Error('SITE_URL must be an HTTPS origin or directory URL.');
}
if (!siteUrl.pathname.endsWith('/')) siteUrl.pathname += '/';
if (domain && siteUrl.hostname !== domain) throw new Error('SITE_URL host must match CUSTOM_DOMAIN.');
execFileSync(process.execPath, [path.join(__dirname, 'check.cjs')], { stdio: 'inherit' });
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Unsafe build output path.');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
for (const item of ['index.html', '404.html', 'domestic', 'international', 'category', 'about', 'contact', 'booking-policies', 'assets', 'css', 'js', 'robots.txt', 'sitemap.xml', 'site.webmanifest']) {
  fs.cpSync(path.join(root, item), path.join(dist, item), { recursive: true });
}
for (const page of ['index.html', 'domestic/index.html', 'international/index.html', 'category/index.html', 'about/index.html', 'contact/index.html', 'booking-policies/index.html']) {
  const file = path.join(dist, page);
  const canonicalPath = page === 'index.html' ? '' : `${page.replace(/\/index\.html$/, '')}/`;
  const canonical = new URL(canonicalPath, siteUrl).href;
  let html = fs.readFileSync(file, 'utf8').replace(/(<link rel="canonical" href=")[^"]*(">)/, `$1${canonical}$2`);
  html = html.replace('</head>', `<meta property="og:url" content="${canonical}"><meta property="og:type" content="website"></head>`);
  fs.writeFileSync(file, html);
}
const notFound = path.join(dist, '404.html');
fs.writeFileSync(notFound, fs.readFileSync(notFound, 'utf8').replace('<head>', `<head><base href="${siteUrl.href}">`));
const sitemap = ['','domestic/','international/','category/','about/','contact/','booking-policies/'];
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(route=>`  <url><loc>${new URL(route,siteUrl).href}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml',siteUrl).href}\n`);
const manifestFile = path.join(dist, 'site.webmanifest');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
manifest.start_url = siteUrl.pathname;
fs.writeFileSync(manifestFile, `${JSON.stringify(manifest)}\n`);
// Only emit a video URL after its local file exists. A failed download leaves the image intact.
for (const [route, poster] of [['domestic', 'kashmir-lake'], ['international', 'maldives-lagoon']]) {
  const media = `assets/videos/${route}-journey.mp4`;
  if (!fs.existsSync(path.join(root, media))) continue;
  const page = path.join(dist, route, 'index.html');
  const video = `<video data-src="../${media}" poster="../assets/images/${poster}.jpg" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1"></video>`;
  fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace('<div class="hero-bg">', `<div class="hero-bg">${video}`));
}
execFileSync(process.execPath, [path.join(__dirname, 'check.cjs'), dist], { stdio: 'inherit' });
console.log('Static site built in dist/. Serve this folder with any static web server.');
