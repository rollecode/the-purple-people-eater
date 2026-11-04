import { ASSETS_URL, $, getJson, reducedMotion } from 'theme/lib';

/**
 * The 90s theme's extras: marquee, fire, construction sign, buttons, a visit
 * counter and cursor sparkles. Loaded by theme-switch only while it is chosen.
 */

const GIFS = `${ASSETS_URL}images/90s/`;
const COUNTER_DIGITS = 7;
const SPARK_COLOURS = [ '#FF0', '#0FF', '#F0F', '#FFF', '#0F0' ];
const SPARK_EVERY_MS = 40;

const gif = (name, alt, width, height) => `<img src="${GIFS}${name}.gif" alt="${alt}" width="${width}" height="${height}">`;

const topHtml = () => `<div class="nn-fire" aria-hidden="true"></div>
<marquee class="nn-marquee" scrollamount="6">★ Tervetuloa Rollemaan kotisivulle!!! ★ Lisää sivu suosikkeihin! ★ Tämä sivu on päivitetty ${new Date().toLocaleDateString('fi-FI')} ★ Kiitos käynnistä! ★</marquee>
<p class="nn-construction">${gif('construction-guy', 'Rakenteilla', 100, 113)}<span class="nn-blink">Sivu on aina rakenteilla!!!</span></p>`;

const counterHtml = (visitors) => String(visitors).padStart(COUNTER_DIGITS, '0').split('').map((digit) => `<span>${digit}</span>`).join('');

const footHtml = () => `<p class="nn-foot-line">Sivulla on käynyt <span class="nn-counter" role="img" aria-label="Kävijämäärä">${counterHtml(0)}</span> kävijää</p>
<a href="mailto:rolle@dude.fi">${gif('mail-letter', '', 45, 52)} Lähetä sähköpostia!</a>
<p class="nn-foot-line">${gif('best-800x600', 'Best viewed 800 × 600', 88, 31)} ${gif('netscape-now', 'Netscape Now!', 88, 31)} ${gif('notepad', 'Built with Microsoft Notepad', 88, 31)} ${gif('valid-html32', 'W3C HTML 3.2', 88, 31)}</p>`;

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

  add($('.site-main'), 'beforebegin', 'nn-top', topHtml());
  add($('.foot-base'), 'beforebegin', 'nn-foot', footHtml());
  getJson('visitors').then(({ visitors }) => {
    const counter = $('.nn-counter');
    if (!visitors || !counter) {
      return;
    }
    counter.innerHTML = counterHtml(visitors);
    counter.setAttribute('aria-label', `${visitors} kävijää`);
  }).catch(() => {});

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
