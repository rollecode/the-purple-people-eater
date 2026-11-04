import { ASSETS_URL, $, store, reducedMotion } from 'theme/lib';

/**
 * The 90s theme's extras: marquee, fire, construction sign, buttons, a visit
 * counter and cursor sparkles. Loaded by theme-switch only while it is chosen.
 */

const GIFS = `${ASSETS_URL}images/90s/`;
const VISITS_KEY = 'nn-visits';
const COUNTER_DIGITS = 6;
const SPARK_COLOURS = [ '#FF0', '#0FF', '#F0F', '#FFF', '#0F0' ];
const SPARK_EVERY_MS = 40;

const gif = (name, alt, width, height) => `<img src="${GIFS}${name}.gif" alt="${alt}" width="${width}" height="${height}">`;

const topHtml = () => `<div class="nn-fire" aria-hidden="true"></div>
<marquee class="nn-marquee" scrollamount="6">★ Tervetuloa Rollemaan kotisivulle!!! ★ Lisää sivu suosikkeihin! ★ Tämä sivu on päivitetty ${new Date().toLocaleDateString('fi-FI')} ★ Kiitos käynnistä! ★</marquee>
<p class="nn-construction">${gif('construction', 'Rakenteilla', 150, 46)}<span class="nn-blink">Sivu on aina rakenteilla!!!</span></p>`;

const footHtml = (visits) => `<p class="nn-foot-line">Olet käynyt täällä <span class="nn-counter" role="img" aria-label="${visits} kertaa">${String(visits).padStart(COUNTER_DIGITS, '0').split('').map((digit) => `<span>${digit}</span>`).join('')}</span> kertaa</p>
<a href="https://mementomori.social/@rolle">${gif('mail', '', 34, 24)} Lähetä sähköpostia! (eli Mastodonissa)</a>
<p class="nn-foot-line">${gif('badge-800', 'Paras 800 × 600', 88, 31)} ${gif('badge-netscape', 'Netscape now!', 88, 31)} ${gif('badge-notepad', 'Tehty Notepadilla', 88, 31)} ${gif('badge-html', 'HTML 3.2', 88, 31)}</p>`;

let added = [];
let lastSpark = 0;

const spark = (event) => {
  if ('mouse' !== event.pointerType || event.timeStamp - lastSpark < SPARK_EVERY_MS) {
    return;
  }
  lastSpark = event.timeStamp;

  const star = document.createElement('i');
  star.className = 'nn-spark';
  star.style.cssText = `left:${event.clientX + 6}px;top:${event.clientY + 6}px;color:${SPARK_COLOURS[Math.floor(Math.random() * SPARK_COLOURS.length)]}`;
  star.addEventListener('animationend', () => star.remove());
  document.body.append(star);
};

const add = (where, position, className, html) => {
  if (!where) {
    return;
  }
  const element = document.createElement('div');
  element.className = className;
  element.innerHTML = html;
  where.insertAdjacentElement(position, element);
  added.push(element);
};

const on = () => {
  if (added.length) {
    return;
  }

  const visits = (store.get(VISITS_KEY) || 0) + 1;
  store.set(VISITS_KEY, visits);

  add($('.site-main'), 'beforebegin', 'nn-top', topHtml());
  add($('.foot-base'), 'beforebegin', 'nn-foot', footHtml(visits));

  if (!reducedMotion.matches) {
    document.addEventListener('pointermove', spark, { passive: true });
  }
};

const off = () => {
  added.forEach((element) => element.remove());
  added = [];
  document.removeEventListener('pointermove', spark);
};

export { on, off };
