const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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

// One pause control governs continuous hero motion, including local video when present.
const slides = $$('.hero-slide'), hero = $('.hero'), heroImage = $('[data-hero-image]');
const motionButton = $('[data-motion]'), video = $('.hero-bg video');
let current = 0, timer, changeTimer, paused = reducedMotion.matches || !!navigator.connection?.saveData;
let heroVisible = true, hoverPaused = false, focusPaused = false;
function showSlide(index) {
  current = (index + slides.length) % slides.length;
  const slide = slides[current];
  if (!slide) return;
  clearTimeout(changeTimer);
  heroImage.style.opacity = reducedMotion.matches ? '1' : '0';
  changeTimer = setTimeout(() => {
    $('[data-hero-title]').textContent = slide.dataset.title;
    $('[data-hero-copy]').textContent = slide.dataset.copy;
    $('[data-hero-kicker]').textContent = slide.dataset.kicker;
    heroImage.srcset = slide.dataset.srcset;
    heroImage.src = slide.dataset.image;
    heroImage.alt = slide.dataset.alt;
    heroImage.style.opacity = '1';
    $('[data-hero-count]').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    slides.forEach((el, i) => el.setAttribute('aria-current', String(i === current)));
  }, reducedMotion.matches ? 0 : 250);
}
function syncMotion() {
  clearInterval(timer);
  const stop = paused || document.hidden || !heroVisible || hoverPaused || focusPaused;
  document.body.classList.toggle('motion-paused', stop);
  if (motionButton) {
    motionButton.hidden = false;
    motionButton.textContent = paused ? '▶' : 'Ⅱ';
    motionButton.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
    motionButton.setAttribute('title', paused ? 'Play background motion' : 'Pause background motion');
    motionButton.setAttribute('aria-pressed', String(paused));
  }
  if (!stop && slides.length) timer = setInterval(() => showSlide(current + 1), 3000);
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
motionButton?.addEventListener('click', () => { paused = !paused; hoverPaused = false; syncMotion(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
document.addEventListener('visibilitychange', syncMotion);
video?.addEventListener('playing', () => video.classList.add('is-playing'));
video?.addEventListener('error', () => video.classList.remove('is-playing'));
if (hero) {
  hero.addEventListener('mouseenter', () => { hoverPaused = !!slides.length; syncMotion(); });
  hero.addEventListener('mouseleave', () => { hoverPaused = false; syncMotion(); });
  hero.addEventListener('focusin', event => { focusPaused = event.target !== motionButton; syncMotion(); });
  hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { focusPaused = false; syncMotion(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting; syncMotion();
  }, { threshold: 0 }).observe(hero);
}
if (slides.length) {
  $$('[data-slide]').forEach((button, i) => button.addEventListener('click', () => { showSlide(i); syncMotion(); }));
  $('[data-next]')?.addEventListener('click', () => { showSlide(current + 1); syncMotion(); });
  $('[data-prev]')?.addEventListener('click', () => { showSlide(current - 1); syncMotion(); });
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
