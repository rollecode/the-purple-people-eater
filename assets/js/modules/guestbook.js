import { $, $$, config, getJson, reducedMotion } from 'theme/lib';

/**
 * Vieraskirja: entries written one after another down the pages of an open
 * book, as many as fit, and a blank page where the visitor writes or draws a
 * greeting and signs. Everything a visitor sent goes on the page as text
 * nodes and SVG numbers, never as markup.
 */
const PAD_WIDTH = 600;
const PAD_HEIGHT = 360;
const PAD_MIN_STEP = 3;
const PAD_POINTS_MAX = 3000;
const SVG = 'http://www.w3.org/2000/svg';
const WRITE_PAGE = 'write';
const RELAYOUT_MS = 200;
const singlePage = window.matchMedia('(max-width: 760px)');

const book = $('[data-guestbook]');
const spread = $('[data-gb-spread]', book);
const prev = $('[data-gb-prev]', book);
const next = $('[data-gb-next]', book);
const position = $('[data-gb-pos]', book);
const form = $('[data-gb-form]', book);
const status = $('[data-gb-status]', book);

let entries = [];
let pages = [];
let loadedPages = 0;
let totalPages = 1;
let spreadIndex = 0;
let loaded = false;

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  if (text) {
    node.textContent = text;
  }
  return node;
};

const drawingSvg = (strokes, className) => {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${PAD_WIDTH} ${PAD_HEIGHT}`);
  svg.setAttribute('class', className);
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

const entryNode = ({ name, message, date, picture, strokes }) => {
  const entry = element('article', 'gb-entry');
  entry.append(element('p', 'gb-date', date));
  if (message) {
    entry.append(element('p', 'gb-message', message));
  }
  if (picture?.length) {
    entry.append(drawingSvg(picture, 'gb-picture'));
  }
  if (strokes?.length) {
    entry.append(drawingSvg(strokes, 'gb-sign'));
  }
  entry.append(element('p', 'gb-name', `– ${name}`));
  return entry;
};

const pagesPerSpread = () => (singlePage.matches ? 1 : 2);

// Entries run down a page until the next one no longer fits, then carry on to the next page
const layOut = () => {
  const gaps = getComputedStyle(spread);
  const probe = element('div', 'gb-page gb-probe');
  probe.style.width = `${(spread.clientWidth - parseFloat(gaps.paddingLeft) - parseFloat(gaps.paddingRight)) / pagesPerSpread()}px`;
  spread.append(probe);

  pages = [];
  let page = [];
  entries.forEach((entry) => {
    probe.append(entryNode(entry));
    if (page.length && probe.scrollHeight > probe.clientHeight) {
      pages.push(page);
      page = [];
      probe.replaceChildren(entryNode(entry));
    }
    page.push(entry);
  });
  pages.push(page);
  probe.remove();
};

// The book opens at the newest page with the blank page beside it, on a phone the blank page comes first
const pageList = () => {
  const list = [ ...pages ];
  list.splice(singlePage.matches ? 0 : 1, 0, WRITE_PAGE);
  return list;
};
const spreadCount = () => Math.ceil(pageList().length / pagesPerSpread());

const loadMore = () => getJson(`guestbook?page=${loadedPages + 1}`).then((answer) => {
  loadedPages += 1;
  totalPages = answer.pages || 1;
  entries = entries.concat(answer.entries);
});

const render = () => {
  if (!loaded) {
    return;
  }
  spread.removeAttribute('aria-busy');
  layOut();
  spreadIndex = Math.min(spreadIndex, spreadCount() - 1);
  spread.replaceChildren();

  pageList().slice(spreadIndex * pagesPerSpread(), (spreadIndex + 1) * pagesPerSpread()).forEach((page) => {
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
    spreadIndex = Math.max(0, target);
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

let relayoutTimer;
let lastWidth = 0;
new ResizeObserver(() => {
  if (spread.clientWidth === lastWidth) {
    return;
  }
  lastWidth = spread.clientWidth;
  window.clearTimeout(relayoutTimer);
  relayoutTimer = window.setTimeout(render, RELAYOUT_MS);
}).observe(spread);

/**
 * A drawing pad: strokes in its own 600 × 360 space, whatever size it shows at.
 * The page holds still under the pen.
 */
const makePad = (canvas, hint) => {
  const context = canvas.getContext('2d');
  let strokes = [];
  let pen = null;

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    return [
      Math.round((event.clientX - rect.left) / rect.width * PAD_WIDTH),
      Math.round((event.clientY - rect.top) / rect.height * PAD_HEIGHT),
    ];
  };
  const count = () => strokes.reduce((sum, stroke) => sum + (stroke.length / 2), 0);

  const clear = () => {
    strokes = [];
    context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
    context.save();
    context.fillStyle = getComputedStyle(form).getPropertyValue('--pencil');
    context.globalAlpha = .55;
    context.font = '40px Caveat, cursive';
    context.textAlign = 'center';
    context.fillText(hint, PAD_WIDTH / 2, PAD_HEIGHT / 2);
    context.restore();
  };

  [ 'touchstart', 'touchmove' ].forEach((type) => canvas.addEventListener(type, (event) => event.preventDefault(), { passive: false }));

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    if (count() >= PAD_POINTS_MAX) {
      return;
    }
    if (!strokes.length) {
      context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
    }
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = getComputedStyle(canvas).color;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-drawing');
    pen = point(event);
    strokes.push([ ...pen ]);
    context.beginPath();
    context.moveTo(...pen);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!pen || count() >= PAD_POINTS_MAX) {
      return;
    }
    event.preventDefault();
    const at = point(event);
    if (Math.hypot(at[0] - pen[0], at[1] - pen[1]) < PAD_MIN_STEP) {
      return;
    }
    strokes[strokes.length - 1].push(...at);
    context.lineTo(...at);
    context.stroke();
    pen = at;
  });

  [ 'pointerup', 'pointercancel' ].forEach((type) => canvas.addEventListener(type, () => {
    pen = null;
    canvas.classList.remove('is-drawing');
  }));

  return { clear, strokes: () => strokes.filter((stroke) => stroke.length >= 4) };
};

// Each part, the greeting and the signature, is typed or drawn
const parts = $$('[data-gb-part]', form).map((part) => {
  const pad = makePad($('canvas', part), part.dataset.hint);
  const setMode = (mode) => {
    part.dataset.mode = mode;
    $$('[data-gb-mode]', part).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.gbMode === mode)));
  };
  $$('[data-gb-mode]', part).forEach((button) => button.addEventListener('click', () => setMode(button.dataset.gbMode)));
  $('[data-gb-clear]', part).addEventListener('click', pad.clear);
  setMode('type');
  return { name: part.dataset.gbPart, part, pad, setMode };
});
const drawn = (name) => {
  const found = parts.find((part) => part.name === name);
  return 'draw' === found.part.dataset.mode ? found.pad.strokes() : [];
};

const refuse = (field, message) => {
  status.classList.remove('is-done');
  status.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.focus();
};

form.addEventListener('input', (event) => event.target.removeAttribute('aria-invalid'));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = $('[name="name"]', form);
  const message = $('[name="message"]', form);
  if (!String(data.get('name')).trim()) {
    refuse(name, 'Kirjoita vielä nimesi viivan perään.');
    return;
  }
  if (!String(data.get('message')).trim() && !drawn('picture').length && !drawn('signature').length) {
    refuse(message, 'Kirjoita tai piirrä vielä terveisesi.');
    return;
  }
  const button = $('button[type="submit"]', form);
  button.disabled = true;
  status.textContent = '';
  status.classList.remove('is-done');

  fetch(`${config.rest}guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.get('name'),
      message: data.get('message'),
      website: data.get('website'),
      picture: drawn('picture'),
      strokes: drawn('signature'),
    }),
  }).then((response) => response.json().then((answer) => {
    if (!response.ok) {
      throw new Error(answer.message || 'Merkintää ei saatu tallennettua.');
    }
    entries.unshift(answer);
    spreadIndex = 0;
    form.reset();
    parts.forEach(({ pad, setMode }) => {
      pad.clear();
      setMode('type');
    });
    render();
    status.textContent = 'Kiitos! Merkintäsi on nyt kirjassa.';
    status.classList.add('is-done');
    spread.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
  })).catch((error) => {
    status.textContent = error.message;
  }).finally(() => {
    button.disabled = false;
  });
});

form.hidden = false;
$('[data-gb-today]', form).textContent = new Date().toLocaleDateString('fi-FI');
document.fonts.load('40px Caveat').then(() => {
  parts.forEach(({ pad }) => pad.clear());
  render();
});
loadMore().catch(() => {}).finally(() => {
  loaded = true;
  render();
});
