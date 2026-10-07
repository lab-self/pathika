const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, '..');
const routes = ['domestic', 'international', 'category', 'about', 'contact', 'booking-policies'];
const pages = ['index.html', '404.html', ...routes.map(route => path.join(route, 'index.html'))];
assert.equal(pages.length, 8, 'Expected seven content pages and a 404 page');
const pageImageSets = new Map();
for (const page of pages) {
  const pagePath = path.join(root, page);
  const html = fs.readFileSync(pagePath, 'utf8');
  assert.match(html, /<title>[^<]+<\/title>/, `${page}: title missing`);
  assert.doesNotMatch(html, /href="[^"]+\.html(?:#[^"]*)?"/, `${page}: internal link still exposes .html`);
  for (const [, image] of html.matchAll(/<img\b([^>]*)>/g)) {
    assert.match(image, /\balt="[^"]*"/, `${page}: image alt missing`);
    assert.match(image, /\bwidth="\d+"/, `${page}: image width missing`);
    assert.match(image, /\bheight="\d+"/, `${page}: image height missing`);
  }
  for (const [, video] of html.matchAll(/<video\b([^>]*)>/g)) {
    for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline', 'poster=', 'preload="metadata"']) {
      assert.ok(video.includes(attribute), `${page}: video missing ${attribute}`);
    }
    const media = video.match(/data-src="([^"]+)"/);
    assert.ok(media && fs.existsSync(path.resolve(path.dirname(pagePath), media[1])), `${page}: video file missing`);
  }
  if (page !== '404.html') {
    assert.match(html, /name="description"/, `${page}: meta description missing`);
    assert.match(html, /rel="canonical"/, `${page}: canonical missing`);
  }
  for (const [, ref] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/)/i.test(ref)) continue;
    const [url, fragment] = ref.split('#');
    const target = url.split('?')[0];
    let targetPath = path.resolve(path.dirname(pagePath), target || path.basename(pagePath));
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) targetPath = path.join(targetPath, 'index.html');
    assert.ok(fs.existsSync(targetPath), `${page}: missing ${ref}`);
    if (fragment) {
      const targetHtml = fs.readFileSync(targetPath, 'utf8');
      assert.ok(new RegExp(`(?:id|name)="${fragment}"`).test(targetHtml), `${page}: missing anchor #${fragment}`);
    }
  }
  if (['domestic', 'international'].some(route => page === path.join(route, 'index.html'))) {
    assert.match(html, /data-destination-search/, `${page}: destination search missing`);
    assert.match(html, /id="journeys"/, `${page}: journey section missing`);
  }
  if (page === path.join('category', 'index.html')) {
    assert.equal((html.match(/data-category-card/g) || []).length, 16);
    assert.equal((html.match(/class="text-link card-enquiry"/g) || []).length, 16);
  }
  for (const [, candidates] of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of candidates.split(',')) {
      const image = candidate.trim().split(/\s+/)[0];
      assert.ok(fs.existsSync(path.resolve(path.dirname(pagePath), image)), `${page}: missing responsive image ${image}`);
    }
  }
  if (['index.html', path.join('domestic', 'index.html'), path.join('international', 'index.html')].includes(page)) {
    const images = new Set([...html.matchAll(/(?:src|srcset|data-image)="([^"]+)"/g)]
      .flatMap(([, value]) => value.split(',').map(item => item.trim().split(/\s+/)[0]))
      .filter(value => /assets\/images\//.test(value))
      .map(value => value.replace(/(?:-480|-768)(?=\.jpg)/, '').replace(/\.jpg$/, '')));
    pageImageSets.set(page, images);
  }
}
const homeImages = pageImageSets.get('index.html');
for (const page of [path.join('domestic', 'index.html'), path.join('international', 'index.html')]) {
  const overlap = [...homeImages].filter(image => pageImageSets.get(page).has(image));
  assert.deepEqual(overlap, [], `${page}: shares travel imagery with Home (${overlap.join(', ')})`);
}
const domesticImages = pageImageSets.get(path.join('domestic', 'index.html'));
const internationalImages = pageImageSets.get(path.join('international', 'index.html'));
assert.deepEqual([...domesticImages].filter(image => internationalImages.has(image)), [], 'Domestic and International must use separate imagery');
for (const image of fs.readdirSync(path.join(root, 'assets', 'images')).filter(name => name.endsWith('.jpg'))) {
  const bytes = fs.readFileSync(path.join(root, 'assets', 'images', image));
  assert.ok(bytes.length > 10_000 && bytes[0] === 0xff && bytes[1] === 0xd8, `${image}: invalid JPEG`);
}
console.log(`Checked ${pages.length} pages, clean routes, and local assets.`);
