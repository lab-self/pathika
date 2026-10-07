// DOM interaction smoke checks, not browser layout tests. Uses an installed LinkeDOM.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require(process.env.PATHIKA_DOM_MODULE || 'linkedom');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/site.js'), 'utf8');
function page(route, query = '', reduce = false) {
  const { window, document } = parseHTML(fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'));
  const intervals = new Map(), media = new Map(); let nextId = 0;
  Object.defineProperty(document, 'hidden', { value: false, writable: true });
  window.HTMLElement.prototype.getClientRects = () => [{}];
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1000 });
  window.HTMLElement.prototype.focus = function () { document.activeElement = this; };
  // LinkeDOM does not implement the browser's select.value setter or form validation.
  for (const select of document.querySelectorAll('select')) {
    Object.defineProperty(select, 'value', { value: select.firstElementChild.textContent, writable: true });
  }
  const form = document.querySelector('form');
  if (form) form.reportValidity = () => true;
  const matchMedia = query => {
    if (!media.has(query)) media.set(query, { matches: query.includes('reduced-motion') && reduce, addEventListener(type, callback) { this.callback = callback; } });
    return media.get(query);
  };
  class IntersectionObserver { constructor(callback) { this.callback = callback; } observe(target) { this.callback([{ target, isIntersecting: true }]); } unobserve() {} }
  window.IntersectionObserver = IntersectionObserver;
  const location = { search: query, href: '' };
  const context = { window, document, location, navigator: {}, matchMedia, IntersectionObserver, innerHeight: 800, URLSearchParams, Date,
    setInterval(fn) { intervals.set(++nextId, fn); return nextId; }, clearInterval(id) { intervals.delete(id); },
    setTimeout(fn) { fn(); return ++nextId; }, clearTimeout() {},
    FormData: class { constructor(form) { this.entries = [...form.querySelectorAll('[name]')].map(el => [el.name, el.value || '']); } [Symbol.iterator]() { return this.entries[Symbol.iterator](); } }
  };
  vm.runInNewContext(source, context);
  const $ = selector => document.querySelector(selector);
  const fire = (target, type, properties = {}) => { const event = new window.Event(type, { bubbles: true, cancelable: true }); Object.assign(event, properties); target.dispatchEvent(event); return event; };
  return { $, document, location, intervals, media, fire };
}

for (const route of ['', 'domestic', 'international', 'category', 'about', 'contact', 'booking-policies']) page(route);
const home = page('');
assert.equal(home.intervals.size, 1, 'Homepage rotation starts');
home.fire(home.$('.menu-toggle'), 'click');
assert.ok(home.$('.nav').classList.contains('open'));
home.$('.menu-toggle').focus();
assert.ok(home.fire(home.document, 'keydown', { key: 'Tab' }).defaultPrevented, 'Focus wraps within navigation');
assert.equal(home.document.activeElement, home.$('.brand'));
home.fire(home.document, 'keydown', { key: 'Escape' });
assert.equal(home.$('.menu-toggle').getAttribute('aria-expanded'), 'false');
assert.ok(!home.document.body.classList.contains('menu-visible'));
assert.equal(page('', '', true).intervals.size, 0, 'Reduced motion prevents automatic rotation');
home.document.hidden = true; home.fire(home.document, 'visibilitychange');
assert.equal(home.intervals.size, 0, 'Hidden tabs stop rotation');

for (const [route, term] of [['domestic', 'Kerala'], ['international', 'Bali']]) {
  const view = page(route), search = view.$('[data-destination-search]');
  search.value = term; view.fire(search, 'input');
  assert.equal([...view.document.querySelectorAll('[data-destinations] .card')].filter(card => !card.hidden).length, 1);
  search.value = 'no-such-destination'; view.fire(search, 'input');
  assert.match(view.$('[data-search-status]').textContent, /No match/);
  search.value = ''; view.fire(search, 'input');
  assert.equal([...view.document.querySelectorAll('[data-destinations] .card')].filter(card => !card.hidden).length, 6);
}
const collections = page('category');
for (const category of ['together', 'outdoors', 'culture', 'retreat']) {
  collections.fire(collections.$(`[data-filter="${category}"]`), 'click');
  for (const card of collections.document.querySelectorAll('[data-category-card]')) assert.equal(card.hidden, card.dataset.category !== category);
}
collections.fire(collections.$('[data-filter="all"]'), 'click');
assert.equal([...collections.document.querySelectorAll('[data-category-card]')].filter(card => !card.hidden).length, 16);

const contact = page('contact', '?journey=Bali+island+journey&region=International');
assert.equal(contact.$('#destination').value, 'Bali island journey');
assert.equal(contact.$('#region').value, 'International');
contact.$('#name').value = 'Test Traveller';
contact.$('#email').value = 'test@example.com';
contact.fire(contact.$('form'), 'submit');
assert.match(contact.location.href, /^mailto:info@pathikatravels\.com\?/);
assert.match(decodeURIComponent(contact.location.href), /Bali island journey/);
assert.match(contact.$('[data-form-notice]').textContent, /press Send/);
const invalid = page('contact', '?journey=' + 'x'.repeat(200) + '&region=Unknown');
assert.equal(invalid.$('#destination').value.length, 180);
assert.equal(invalid.$('#region').value, 'Still deciding');
console.log('DOM checks passed: seven-page startup, navigation focus/Escape, hero startup, reduced motion, hidden tabs, destination search, collection filters and enquiry prefill/email.');
