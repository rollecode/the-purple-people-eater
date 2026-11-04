import { ASSETS_URL, $, getJson, reducedMotion } from 'theme/lib';

/**
 * The 90s theme's extras: marquee, fire, construction sign, buttons, a visit
 * counter and a rope that hangs from the cursor. Loaded by theme-switch only while it is chosen.
 */

const GIFS = `${ASSETS_URL}images/90s/`;
const COUNTER_DIGITS = 7;
const SNAKE_COLOURS = [ '#F00', '#F80', '#FF0', '#0F0', '#0FF', '#00F', '#F0F' ];
const SNAKE_LENGTH = 28;
const SNAKE_LINK_PX = 9;
const SNAKE_GRAVITY = 0.5;
const SNAKE_DAMPING = 0.97;
const SNAKE_STIFFNESS = 4;

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
let snake = null;
let hoverRules = [];

let renamed = [];

// A blog was still a homepage then, and it all started earlier
const RENAMES = [
  [ 'Rollen blogi', 'Rollen kotisivut' ],
  [ 'Kirjoituksia vuodesta 2005', 'Kirjoituksia vuodesta 1998' ],
  [ 'päiväkirja vuodesta 2021', 'päiväkirja vuodesta 1999' ],
];
const rename = () => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = RENAMES.reduce((result, [ from, to ]) => result.replaceAll(from, to), node.data);
    if (text !== node.data) {
      renamed.push([ node, node.data ]);
      node.data = text;
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

// A rope of pixels: the head follows the mouse, the rest swings and hangs under gravity
const pull = (from, to, pinned) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const stretch = (Math.hypot(dx, dy) - SNAKE_LINK_PX) / (Math.hypot(dx, dy) || 1);
  const share = pinned ? 1 : 0.5;
  to.x -= dx * stretch * share;
  to.y -= dy * stretch * share;
  if (!pinned) {
    from.x += dx * stretch * share;
    from.y += dy * stretch * share;
  }
};

const startSnake = () => {
  const mouse = { x: 0, y: 0, seen: false };
  const links = Array.from({ length: SNAKE_LENGTH }, (_, index) => {
    const element = document.createElement('i');
    element.className = 'nn-seg';
    element.ariaHidden = 'true';
    element.style.color = SNAKE_COLOURS[index % SNAKE_COLOURS.length];
    document.body.append(element);
    return { element, x: 0, y: 0, oldX: 0, oldY: 0 };
  });

  const move = (event) => {
    if ('mouse' !== event.pointerType) {
      return;
    }
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    if (!mouse.seen) {
      mouse.seen = true;
      links.forEach((link) => Object.assign(link, { x: mouse.x, y: mouse.y, oldX: mouse.x, oldY: mouse.y }));
    }
  };

  const step = () => {
    snake.frame = requestAnimationFrame(step);
    if (!mouse.seen) {
      return;
    }

    links.forEach((link) => {
      const speedX = (link.x - link.oldX) * SNAKE_DAMPING;
      const speedY = (link.y - link.oldY) * SNAKE_DAMPING;
      Object.assign(link, { oldX: link.x, oldY: link.y, x: link.x + speedX, y: link.y + speedY + SNAKE_GRAVITY });
    });
    Object.assign(links[0], { x: mouse.x, y: mouse.y });

    for (let round = 0; round < SNAKE_STIFFNESS; round++) {
      for (let index = 1; index < links.length; index++) {
        pull(links[index - 1], links[index], 1 === index);
      }
    }

    links.forEach(({ element, x, y }) => {
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
  };

  document.addEventListener('pointermove', move, { passive: true });
  snake = { links, move, frame: requestAnimationFrame(step) };
};

const stopSnake = () => {
  if (!snake) {
    return;
  }
  cancelAnimationFrame(snake.frame);
  document.removeEventListener('pointermove', snake.move);
  snake.links.forEach(({ element }) => element.remove());
  snake = null;
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
    startSnake();
  }
};

const off = () => {
  added.forEach((element) => element.remove());
  added = [];
  stopSnake();
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
