import { $, config, getJson, reducedMotion } from 'theme/lib';

/**
 * Vieraskirja: entries on the pages of an open book, two to a page, and a
 * blank page where the visitor writes and signs. Everything a visitor wrote goes on the page as
 * text nodes and SVG numbers, never as markup.
 */
const PAD_WIDTH = 600;
const PAD_HEIGHT = 200;
const PAD_MIN_STEP = 3;
const PAD_POINTS_MAX = 3000;
const ENTRIES_PER_PAGE = 2;
const SVG = 'http://www.w3.org/2000/svg';
const singlePage = window.matchMedia('(max-width: 760px)');

const book = $('[data-guestbook]');
const spread = $('[data-gb-spread]', book);
const prev = $('[data-gb-prev]', book);
const next = $('[data-gb-next]', book);
const position = $('[data-gb-pos]', book);
const form = $('[data-gb-form]', book);
const pad = $('[data-gb-pad]', book);
const status = $('[data-gb-status]', book);

let entries = [];
let loadedPages = 0;
let totalPages = 1;
let spreadIndex = 0;

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text) {
    node.textContent = text;
  }
  return node;
};

const signature = (strokes) => {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`);
  svg.setAttribute('class', 'gb-sign');
  svg.setAttribute('aria-hidden', 'true');
  strokes.forEach((stroke) => {
    const line = document.createElementNS(SVG, 'polyline');
    const points = [];
    for (let index = 0; index < stroke.length - 1; index += 2) {
      points.push(`${Number(stroke[index])},${Number(stroke[index + 1])}`);
    }
    line.setAttribute('points', points.join(' '));
    svg.append(line);
  });
  return svg;
};

const entryNode = ({ name, message, date, strokes }) => {
  const entry = element('article', 'gb-entry');
  entry.append(element('p', 'gb-date', date));
  if (message) {
    entry.append(element('p', 'gb-message', message));
  }
  if (strokes.length) {
    entry.append(signature(strokes));
  }
  entry.append(element('p', 'gb-name', `– ${name}`));
  return entry;
};

const WRITE_PAGE = 'write';
const pagesPerSpread = () => (singlePage.matches ? 1 : 2);

// The book opens at the newest page with the blank page beside it, on a phone the blank page comes first
const pageList = () => {
  const pages = [];
  for (let start = 0; start < entries.length; start += ENTRIES_PER_PAGE) {
    pages.push(entries.slice(start, start + ENTRIES_PER_PAGE));
  }
  if (!pages.length) {
    pages.push([]);
  }
  pages.splice(singlePage.matches ? 0 : 1, 0, WRITE_PAGE);
  return pages;
};
const spreadCount = () => Math.ceil(pageList().length / pagesPerSpread());

const loadMore = () => getJson(`guestbook?page=${loadedPages + 1}`).then((answer) => {
  loadedPages += 1;
  totalPages = answer.pages || 1;
  entries = entries.concat(answer.entries);
});

const render = () => {
  spread.replaceChildren();
  const pages = pageList().slice(spreadIndex * pagesPerSpread(), (spreadIndex + 1) * pagesPerSpread());

  pages.forEach((page) => {
    if (WRITE_PAGE === page) {
      spread.append(form);
      return;
    }
    const sheet = element('div', 'gb-page');
    page.forEach((entry) => sheet.append(entryNode(entry)));
    if (!entries.length) {
      sheet.append(element('p', 'gb-empty', 'Ensimmäinen sivu odottaa vielä kirjoittajaansa.'));
    }
    spread.append(sheet);
  });

  const more = loadedPages < totalPages;
  position.textContent = `Aukeama ${spreadIndex + 1} / ${spreadCount()}${more ? '+' : ''}`;
  prev.disabled = !spreadIndex;
  next.disabled = spreadIndex >= spreadCount() - 1 && !more;
};

const turn = (step) => {
  const target = spreadIndex + step;
  const ready = (target + 1) * pagesPerSpread() >= pageList().length && loadedPages < totalPages ? loadMore() : Promise.resolve();
  ready.then(() => {
    spreadIndex = Math.max(0, Math.min(target, spreadCount() - 1));
    spread.classList.remove('is-turning');
    if (!reducedMotion.matches) {
      void spread.offsetWidth;
      spread.classList.add('is-turning');
    }
    render();
  });
};

prev.addEventListener('click', () => turn(-1));
next.addEventListener('click', () => turn(1));
singlePage.addEventListener('change', () => {
  spreadIndex = 0;
  render();
});

// The signature pad keeps strokes in its own 600 × 200 space, whatever size it is drawn at
const context = pad.getContext('2d');
let strokes = [];
let drawing = null;

const padPoint = (event) => {
  const rect = pad.getBoundingClientRect();
  return [
    Math.round((event.clientX - rect.left) / rect.width * PAD_WIDTH),
    Math.round((event.clientY - rect.top) / rect.height * PAD_HEIGHT),
  ];
};

const pointCount = () => strokes.reduce((sum, stroke) => sum + (stroke.length / 2), 0);

pad.addEventListener('pointerdown', (event) => {
  if (pointCount() >= PAD_POINTS_MAX) {
    return;
  }
  if (!strokes.length) {
    context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
  }
  pad.setPointerCapture(event.pointerId);
  drawing = padPoint(event);
  strokes.push([ ...drawing ]);
  context.beginPath();
  context.moveTo(...drawing);
});

pad.addEventListener('pointermove', (event) => {
  if (!drawing || pointCount() >= PAD_POINTS_MAX) {
    return;
  }
  const point = padPoint(event);
  if (Math.hypot(point[0] - drawing[0], point[1] - drawing[1]) < PAD_MIN_STEP) {
    return;
  }
  strokes[strokes.length - 1].push(...point);
  context.lineTo(...point);
  context.stroke();
  drawing = point;
});

[ 'pointerup', 'pointercancel' ].forEach((type) => pad.addEventListener(type, () => {
  drawing = null;
}));

const PAD_HINT = 'piirrä nimikirjoituksesi tähän';

const clearPad = () => {
  strokes = [];
  context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
  context.save();
  context.fillStyle = getComputedStyle(form).getPropertyValue('--pencil');
  context.globalAlpha = .55;
  context.font = '34px Caveat, cursive';
  context.fillText(PAD_HINT, 20, PAD_HEIGHT - 40);
  context.restore();
};

const setupPad = () => {
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.strokeStyle = getComputedStyle(pad).color;
};

$('[data-gb-clear]', book).addEventListener('click', clearPad);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const button = $('button[type="submit"]', form);
  button.disabled = true;
  status.textContent = '';

  fetch(`${config.rest}guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.get('name'),
      message: data.get('message'),
      website: data.get('website'),
      strokes: strokes.filter((stroke) => stroke.length >= 4),
    }),
  }).then((response) => response.json().then((answer) => {
    if (!response.ok) {
      throw new Error(answer.message || 'Merkintää ei saatu tallennettua.');
    }
    entries.unshift(answer);
    spreadIndex = 0;
    render();
    form.reset();
    clearPad();
    status.textContent = 'Kiitos! Merkintäsi on nyt kirjassa.';
    spread.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
  })).catch((error) => {
    status.textContent = error.message;
  }).finally(() => {
    button.disabled = false;
  });
});

form.hidden = false;
document.fonts.load('34px Caveat').then(clearPad);
$('[data-gb-today]', form).textContent = new Date().toLocaleDateString('fi-FI');
setupPad();
loadMore().then(render).catch(render);
