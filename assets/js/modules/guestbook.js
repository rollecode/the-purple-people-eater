import { $, config, getJson, reducedMotion } from 'theme/lib';

/**
 * Vieraskirja: entries on the pages of an open book, two to a page, and a
 * form with a signature pad. Everything a visitor wrote goes on the page as
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

const pagesPerSpread = () => (singlePage.matches ? 1 : 2);
const entriesPerSpread = () => pagesPerSpread() * ENTRIES_PER_PAGE;
const spreadCount = () => Math.max(1, Math.ceil(entries.length / entriesPerSpread()));

const loadMore = () => getJson(`guestbook?page=${loadedPages + 1}`).then((answer) => {
  loadedPages += 1;
  totalPages = answer.pages || 1;
  entries = entries.concat(answer.entries);
});

const render = () => {
  spread.replaceChildren();
  const first = spreadIndex * entriesPerSpread();

  for (let page = 0; page < pagesPerSpread(); page++) {
    const sheet = element('div', 'gb-page');
    const start = first + (page * ENTRIES_PER_PAGE);
    entries.slice(start, start + ENTRIES_PER_PAGE).forEach((entry) => sheet.append(entryNode(entry)));
    if (!entries.length && !page) {
      sheet.append(element('p', 'gb-empty', 'Ensimmäinen sivu odottaa vielä kirjoittajaansa.'));
    }
    spread.append(sheet);
  }

  const more = loadedPages < totalPages;
  position.textContent = `Aukeama ${spreadIndex + 1} / ${spreadCount()}${more ? '+' : ''}`;
  prev.disabled = !spreadIndex;
  next.disabled = spreadIndex >= spreadCount() - 1 && !more;
};

const turn = (step) => {
  const target = spreadIndex + step;
  const ready = (target + 1) * entriesPerSpread() > entries.length && loadedPages < totalPages ? loadMore() : Promise.resolve();
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

const clearPad = () => {
  strokes = [];
  context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
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

setupPad();
loadMore().then(render).catch(render);
