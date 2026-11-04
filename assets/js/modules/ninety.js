import { ASSETS_URL, $, getJson, reducedMotion } from 'theme/lib';

/**
 * The 90s theme's extras: marquee, fire, construction sign, buttons, a visit
 * counter and cursor sparkles. Loaded by theme-switch only while it is chosen.
 */

const GIFS = `${ASSETS_URL}images/90s/`;
const COUNTER_DIGITS = 7;
const SPARK_COLOURS = [ '#FF0', '#0FF', '#F0F', '#FFF', '#0F0', '#F80', '#F00' ];
const SPARK_EVERY_MS = 25;

const WIKI = 'https://fi.wikipedia.org/wiki/';
const BADGES = [
  [ 'best-800x600', 'Best viewed 800 × 600', 'Super_VGA' ],
  [ 'netscape-now', 'Netscape Now!', 'Netscape' ],
  [ 'notepad', 'Built with Microsoft Notepad', 'Muistio_(ohjelma)' ],
  [ 'valid-html32', 'W3C HTML 3.2', 'HTML' ],
];

const gif = (name, alt, width, height) => `<img src="${GIFS}${name}.gif" alt="${alt}" width="${width}" height="${height}">`;

const topHtml = () => `<div class="nn-fire" aria-hidden="true"></div>
<marquee class="nn-marquee" scrollamount="6">★ Tervetuloa Rollen kotisivuille!!! ★ Lisää sivu suosikkeihin! ★ Tämä sivu on päivitetty ${new Date().toLocaleDateString('fi-FI')} ★ Kiitos käynnistä! ★</marquee>
<p class="nn-construction">${gif('construction-guy', 'Rakenteilla', 100, 113)}<span class="nn-sign"><b>Under construction</b><span class="nn-blink">Sivu on aina rakenteilla!!!</span></span></p>`;

const counterHtml = (visitors) => String(visitors).padStart(COUNTER_DIGITS, '0').split('').map((digit) => `<span>${digit}</span>`).join('');

const footHtml = () => `<p class="nn-foot-line">Sivulla on käynyt <span class="nn-counter" role="img" aria-label="Kävijämäärä">${counterHtml(0)}</span> kävijää</p>
<a href="mailto:rolle@dude.fi">${gif('mail-letter', '', 45, 52)} Lähetä sähköpostia!</a>
<p class="nn-foot-line">${BADGES.map(([ name, alt, article ]) => `<a href="${WIKI}${article}">${gif(name, alt, 88, 31)}</a>`).join(' ')}</p>`;

let added = [];
let lastSpark = 0;
let hoverRules = [];

let renamed = [];

// A blog was still a homepage then
const BLOG_NAME = 'Rollen blogi';
const HOMEPAGE_NAME = 'Rollen kotisivut';
const rename = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.data.includes(BLOG_NAME)) {
      renamed.push([ node, node.data ]);
      node.data = node.data.replaceAll(BLOG_NAME, HOMEPAGE_NAME);
    }
  }
};

// The 90s had no hovers: every :hover selector is switched off while the theme is on
const eachHoverRule = (rules, callback) => [...rules].forEach((rule) => {
  if (rule.cssRules) {
    eachHoverRule(rule.cssRules, callback);
  }
  if (rule.selectorText?.includes(':hover')) {
    callback(rule);
  }
});

const unhover = () => [...document.styleSheets].forEach((sheet) => {
  try {
    eachHoverRule(sheet.cssRules, (rule) => {
      hoverRules.push([ rule, rule.selectorText ]);
      rule.selectorText = rule.selectorText.replaceAll(':hover', ':not(*)');
    });
  } catch {
    // Another origin's stylesheet
  }
});

// Stylesheets that load later
const unhoverLate = (event) => {
  if ('LINK' === event.target.tagName) {
    unhover();
  }
};

const SPARK_GLYPHS = [ '★', '✦', '✧', '✶', '❋', '✺' ];
const SPARKS_PER_MOVE = 3;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + (Math.random() * (max - min));

const spark = (event) => {
  if ('mouse' !== event.pointerType || event.timeStamp - lastSpark < SPARK_EVERY_MS) {
    return;
  }
  lastSpark = event.timeStamp;

  for (let i = 0; i < SPARKS_PER_MOVE; i++) {
    const star = document.createElement('i');
    star.className = 'nn-spark';
    star.ariaHidden = 'true';
    star.textContent = pick(SPARK_GLYPHS);
    star.style.cssText = `left:${event.clientX}px;top:${event.clientY}px;color:${pick(SPARK_COLOURS)};--size:${between(10, 28)}px;--dx:${between(-50, 50)}px;--dy:${between(20, 110)}px;--spin:${between(-360, 360)}deg`;
    star.addEventListener('animationend', () => star.remove());
    document.body.append(star);
  }
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

  unhover();
  rename();
  document.addEventListener('load', unhoverLate, true);

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
  document.removeEventListener('load', unhoverLate, true);
  hoverRules.forEach(([ rule, selector ]) => {
    rule.selectorText = selector;
  });
  hoverRules = [];
  renamed.forEach(([ node, text ]) => {
    node.data = text;
  });
  renamed = [];
};

export { on, off };
