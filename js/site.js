const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.body.insertAdjacentHTML('beforeend', '<a class="whatsapp-float" href="https://wa.me/919625279733" target="_blank" rel="noopener noreferrer" aria-label="Chat with Pathika on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5a12 12 0 0 0-10.2 18.3L4.2 28l6.4-1.7A12 12 0 1 0 16 3.5Zm0 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.3-.4A9.8 9.8 0 1 1 16 25.3Zm5.4-7.3c-.3-.2-1.7-.9-2-.9s-.5-.2-.7.2-.8.9-1 1.1-.4.3-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6s0-.4 0-.6l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.9 5.1.8.4 1.4.6 1.9.7.8.3 1.5.2 2 .1.6-.1 1.7-.7 1.9-1.4s.2-1.3.2-1.4-.3-.3-.6-.5Z"/></svg></a>');
const header = $('.header'), menu = $('.menu-toggle'), nav = $('.nav');

function closeMenu(restoreFocus = false) {
  nav?.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
  menu?.setAttribute('aria-label', 'Open navigation');
  header?.classList.remove('menu-open');
  document.body.classList.remove('menu-visible');
  if (restoreFocus) menu?.focus();
}
menu?.addEventListener('click', () => {
  if (nav.classList.contains('open')) return closeMenu(true);
  nav.classList.add('open');
  menu.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-label', 'Close navigation');
  header.classList.add('menu-open');
  document.body.classList.add('menu-visible');
  $('a', nav)?.focus();
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => {
  if (nav?.classList.contains('open') && !header.contains(event.target)) closeMenu(true);
});
document.addEventListener('keydown', event => {
  if (!nav?.classList.contains('open')) return;
  if (event.key === 'Escape') closeMenu(true);
  if (event.key !== 'Tab') return;
  const links = $$('a[href], button', header).filter(el => el.getClientRects().length);
  const first = links[0], last = links.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
matchMedia('(min-width: 921px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 30);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Decode the next photograph before crossfading, keeping the current one visible.
const slides = $$('.hero-slide'), hero = $('.hero'), heroImage = $('[data-hero-image]');
const video = $('.hero-bg video');
let current = 0, timer, changing = false, paused = reducedMotion.matches || !!navigator.connection?.saveData;
let heroVisible = true, focusPaused = false;
async function showSlide(index) {
  if (changing || !heroImage) return;
  const next = (index + slides.length) % slides.length, slide = slides[next];
  if (!slide) return;
  changing = true;
  const incoming = heroImage.cloneNode();
  incoming.removeAttribute('data-hero-image');
  incoming.removeAttribute('fetchpriority');
  incoming.setAttribute('aria-hidden', 'true');
  incoming.alt = '';
  incoming.srcset = slide.dataset.srcset;
  incoming.src = slide.dataset.image;
  const animations = [];
  try {
    await incoming.decode();
    if (paused || document.hidden || !heroVisible || focusPaused) return;
    heroImage.after(incoming);
    const fade = incoming.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1400, easing: 'ease-in-out', fill: 'both' });
    animations.push(fade);
    const copy = $$('[data-hero-kicker], [data-hero-title], [data-hero-copy]');
    const fadeOut = copy.map(el => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'ease-in', fill: 'forwards' }));
    animations.push(...fadeOut);
    await Promise.all(fadeOut.map(animation => animation.finished));
    $('[data-hero-title]').textContent = slide.dataset.title;
    $('[data-hero-copy]').textContent = slide.dataset.copy;
    $('[data-hero-kicker]').textContent = slide.dataset.kicker;
    fadeOut.forEach(animation => animation.cancel());
    const fadeIn = copy.map(el => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: 'ease-out' }));
    animations.push(...fadeIn);
    await Promise.all([fade.finished, ...fadeIn.map(animation => animation.finished)]);
    heroImage.srcset = slide.dataset.srcset;
    heroImage.src = slide.dataset.image;
    heroImage.alt = slide.dataset.alt;
    await heroImage.decode();
    current = next;
    slides.forEach((el, i) => el.setAttribute('aria-current', String(i === current)));
  } catch {
    // Keep the existing photograph if the next image cannot load.
  } finally {
    animations.forEach(animation => animation.cancel());
    incoming.remove();
    changing = false;
  }
}
function syncMotion() {
  clearInterval(timer);
  const stop = paused || document.hidden || !heroVisible || focusPaused;
  hero?.classList.toggle('motion-paused', stop);
  if (!stop && slides.length) timer = setInterval(() => showSlide(current + 1), 6500);
  if (video) {
    if (stop) {
      video.pause();
      if (reducedMotion.matches) video.classList.remove('is-playing');
    }
    else if (video.dataset.src) {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play().catch(() => video.classList.remove('is-playing'));
    }
  }
}
reducedMotion.addEventListener('change', event => { paused = event.matches || !!navigator.connection?.saveData; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
video?.addEventListener('playing', () => video.classList.add('is-playing'));
video?.addEventListener('error', () => video.classList.remove('is-playing'));
if (hero) {
  hero.addEventListener('focusin', () => { focusPaused = true; syncMotion(); });
  hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { focusPaused = false; syncMotion(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting; syncMotion();
  }, { threshold: 0 }).observe(hero);
}
syncMotion();

// Content remains visible without JavaScript or IntersectionObserver.
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('reveal-pending');
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  }), { threshold: 0.08 });
  $$('.section-top, .card, .experience, .editorial-copy, .editorial>img, .value, .payment-step, .contact-office, .quote-cta .section-inner').forEach(el => {
    el.classList.add('reveal');
    if (el.getBoundingClientRect().top >= innerHeight) el.classList.add('reveal-pending');
    if (el.parentElement.matches('.cards, .values')) {
      el.style.setProperty('--reveal-delay', `${[...el.parentElement.children].indexOf(el) % 3 * 70}ms`);
    }
    observer.observe(el);
  });
}

const filters = $$('[data-filter]'), collectionCards = $$('[data-category-card]');
filters.forEach(button => {
  button.setAttribute('aria-pressed', String(button.classList.contains('active')));
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    collectionCards.forEach(card => { card.hidden = category !== 'all' && card.dataset.category !== category; });
    $('.collections-grid')?.classList.toggle('is-filtered', category !== 'all');
    $('[data-filter-status]').textContent = `${collectionCards.filter(card => !card.hidden).length} collections to explore`;
  });
});
const search = $('[data-destination-search]');
if (search) {
  $('.discovery-tools').hidden = false;
  const cards = $$('.card', $('[data-destinations]'));
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    cards.forEach(card => { card.hidden = !card.textContent.toLocaleLowerCase().includes(query); });
    const count = cards.filter(card => !card.hidden).length;
    $('[data-search-status]').textContent = count ? `${count} ${count === 1 ? 'match' : 'matches'} to explore` : 'No match yet. Try another place, or tell us your idea when you enquire.';
  });
}

const form = $('[data-enquiry]');
if (form) {
  const params = new URLSearchParams(location.search), journey = params.get('journey');
  if (journey) $('#destination', form).value = journey.slice(0, 180);
  if (['Domestic', 'International'].includes(params.get('region'))) $('#region', form).value = params.get('region');
  const date = $('#date', form), today = new Date();
  date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const body = ['Hello Pathika, I would like to plan a trip.', '', ...[...new FormData(form)].map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value || 'Not specified'}`)].join('\n');
    $('[data-form-notice]').textContent = 'Your email app should open with a draft. Review it and press Send there. If no app opens, email info@pathikatravels.com directly.';
    location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Trip enquiry' + (journey ? ' — ' + journey : ''))}&body=${encodeURIComponent(body)}`;
  });
}
