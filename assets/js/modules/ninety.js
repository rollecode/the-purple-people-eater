import { ASSETS_URL, $, getJson, reducedMotion } from 'theme/lib';

/**
 * The 90s theme's extras: marquee, fire, construction sign, buttons, a visit
 * counter and a rope that hangs from the cursor. Loaded by theme-switch only while it is chosen.
 */

const GIFS = `${ASSETS_URL}images/90s/`;
const COUNTER_DIGITS = 7;
const SNAKE_COLOURS = [ '#F00', '#F80', '#FF0', '#0F0', '#0FF', '#00F', '#F0F' ];
const SNAKE_LENGTH = 26;
const SNAKE_HEAD_PX = 16;
const SNAKE_TAIL_PX = 4;
const SNAKE_LINK_PX = 7;
const SNAKE_GRAVITY = 0.35;
const SNAKE_DAMPING = 0.92;
const SNAKE_STIFFNESS = 3;
const SNAKE_STEP_MS = 16;
// The head trails just below the pointer, so the arrow stays visible
const SNAKE_OFFSET_PX = 14;
const SNAKE_IDLE_MS = 2500;

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

// A snake of dots: the head is the mouse, each dot keeps its distance to the one before and droops under gravity
const keepLink = (leader, follower) => {
  const dx = follower.x - leader.x;
  const dy = follower.y - leader.y;
  const length = Math.hypot(dx, dy) || 1;
  follower.x = leader.x + (dx / length * SNAKE_LINK_PX);
  follower.y = leader.y + (dy / length * SNAKE_LINK_PX);
};

const startSnake = () => {
  const links = Array.from({ length: SNAKE_LENGTH }, (_, index) => {
    const size = Math.round(SNAKE_HEAD_PX - ((SNAKE_HEAD_PX - SNAKE_TAIL_PX) * index / (SNAKE_LENGTH - 1)));
    const element = document.createElement('i');
    element.className = 'nn-seg';
    element.ariaHidden = 'true';
    element.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;color:${SNAKE_COLOURS[index % SNAKE_COLOURS.length]};z-index:${10000 - index}`;
    document.body.append(element);
    return { element, x: 0, y: 0, oldX: 0, oldY: 0 };
  });
  const [ head ] = links;
  let lastMove = 0;
  let lastFrame = 0;
  let pending = 0;

  const move = (event) => {
    if ('mouse' !== event.pointerType) {
      return;
    }
    const x = event.clientX + SNAKE_OFFSET_PX;
    const y = event.clientY + SNAKE_OFFSET_PX;
    if (!lastMove) {
      links.forEach((link) => Object.assign(link, { x, y, oldX: x, oldY: y }));
    }
    Object.assign(head, { x, y });
    lastMove = event.timeStamp;
    document.documentElement.classList.remove('nn-snake-resting');
  };

  const physics = () => {
    links.forEach((link, index) => {
      if (!index) {
        return;
      }
      const speedX = (link.x - link.oldX) * SNAKE_DAMPING;
      const speedY = (link.y - link.oldY) * SNAKE_DAMPING;
      Object.assign(link, { oldX: link.x, oldY: link.y, x: link.x + speedX, y: link.y + speedY + SNAKE_GRAVITY });
    });
    for (let round = 0; round < SNAKE_STIFFNESS; round++) {
      for (let index = 1; index < links.length; index++) {
        keepLink(links[index - 1], links[index]);
      }
    }
  };

  // Fixed steps, so a 120 Hz screen gets the same snake as a 60 Hz one
  const frame = (now) => {
    snake.frame = requestAnimationFrame(frame);
    if (!lastMove) {
      lastFrame = now;
      return;
    }
    pending = Math.min(pending + now - (lastFrame || now), SNAKE_STEP_MS * 5);
    lastFrame = now;
    for (; pending >= SNAKE_STEP_MS; pending -= SNAKE_STEP_MS) {
      physics();
    }
    links.forEach(({ element, x, y }) => {
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    document.documentElement.classList.toggle('nn-snake-resting', now - lastMove > SNAKE_IDLE_MS);
  };

  document.addEventListener('pointermove', move, { passive: true });
  snake = { links, move, frame: requestAnimationFrame(frame) };
};

const stopSnake = () => {
  if (!snake) {
    return;
  }
  cancelAnimationFrame(snake.frame);
  document.removeEventListener('pointermove', snake.move);
  snake.links.forEach(({ element }) => element.remove());
  document.documentElement.classList.remove('nn-snake-resting');
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
