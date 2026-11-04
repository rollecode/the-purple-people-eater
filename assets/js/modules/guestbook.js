import { $, $$, config, getJson, store, reducedMotion } from 'theme/lib';
import { attachCorner } from 'theme/page-curl';

/**
 * Vieraskirja: entries written one after another down the pages of an open
 * book, as many as fit, and a blank page where the visitor writes or draws a
 * greeting and signs. One entry per visitor, which its writer can edit for
 * 30 days with the key their browser keeps. Everything a visitor sent goes on
 * the page as text nodes and SVG numbers, never as markup.
 */
const PAD_WIDTH = 600;
const PAD_HEIGHT = 360;
const PAD_MIN_STEP = 3;
const PAD_POINTS_MAX = 3000;
const SVG = 'http://www.w3.org/2000/svg';
const WRITE_PAGE = 'write';
const RELAYOUT_MS = 200;
const OWN_KEY = 'rollemaa:guestbook';
const singlePage = window.matchMedia('(max-width: 760px)');

const book = $('[data-guestbook]');
const spread = $('[data-gb-spread]', book);
const SWIPE_PX = 60;
const form = $('[data-gb-form]', book);
const status = $('[data-gb-status]', book);

let entries = [];
let pages = [];
let loadedPages = 0;
let totalPages = 1;
let spreadIndex = 0;
let loaded = false;
let own = store.get(OWN_KEY);
const turns = { next: null, prev: null };
let tallest = 0;

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
  entry.append(element('p', 'gb-name', name));
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
  form.style.clipPath = '';
  // The spread may have grown since, a drawing pad opened on the writing page
  tallest = Math.max(tallest, spread.offsetHeight);
  spread.style.minHeight = `${tallest}px`;
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

  // Page numbers at the foot, and curled outer corners to turn the page
  $$('.gb-folio', spread).forEach((node) => node.remove());
  const sheets = [ ...spread.children ];
  const first = spreadIndex * pagesPerSpread();
  sheets.forEach((sheet, index) => sheet.append(element('span', 'gb-folio', String(first + index + 1))));

  const more = loadedPages < totalPages;
  const before = spreadIndex;
  const curled = (side, page, label, step) => attachCorner({
    host: spread,
    page,
    side,
    label,
    prepare: () => moveTo(before + step),
    restore: () => {
      spreadIndex = before;
      render();
    },
  }).turn;
  // The book keeps the tallest height it has had, so turning a page never moves the page around it
  tallest = Math.max(tallest, spread.offsetHeight);
  spread.style.minHeight = `${tallest}px`;

  turns.prev = spreadIndex ? curled('prev', sheets[0], 'Edellinen sivu', -1) : null;
  turns.next = spreadIndex < spreadCount() - 1 || more ? curled('next', sheets[sheets.length - 1], 'Seuraava sivu', 1) : null;
};

// Lays the spread being turned to under the turning page, loading more entries first when needed
const moveTo = async (target) => {
  if ((target + 1) * pagesPerSpread() >= pageList().length && loadedPages < totalPages) {
    await loadMore();
  }
  spreadIndex = Math.max(0, target);
  render();
};

// A swipe on a touch screen turns the page too, except while drawing
let swipeFrom = null;
spread.addEventListener('pointerdown', (event) => {
  swipeFrom = 'touch' === event.pointerType && !event.target.closest('canvas, textarea, input') ? event.clientX : null;
});
spread.addEventListener('pointerup', (event) => {
  if (null === swipeFrom) {
    return;
  }
  const distance = event.clientX - swipeFrom;
  swipeFrom = null;
  if (Math.abs(distance) > SWIPE_PX) {
    turns[distance < 0 ? 'next' : 'prev']?.();
  }
});

let relayoutTimer;
let lastWidth = 0;
new ResizeObserver(() => {
  if (spread.clientWidth === lastWidth) {
    return;
  }
  lastWidth = spread.clientWidth;
  tallest = 0;
  window.clearTimeout(relayoutTimer);
  relayoutTimer = window.setTimeout(() => {
    spread.style.minHeight = '';
    render();
  }, RELAYOUT_MS);
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

  const load = (saved) => {
    clear();
    if (!saved.length) {
      return;
    }
    context.clearRect(0, 0, PAD_WIDTH, PAD_HEIGHT);
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = getComputedStyle(canvas).color;
    strokes = saved.map((stroke) => [ ...stroke ]);
    strokes.forEach((stroke) => {
      context.beginPath();
      context.moveTo(stroke[0], stroke[1]);
      for (let index = 2; index < stroke.length - 1; index += 2) {
        context.lineTo(stroke[index], stroke[index + 1]);
      }
      context.stroke();
    });
  };

  return { clear, load, strokes: () => strokes.filter((stroke) => stroke.length >= 4) };
};

// Each part, the greeting and the signature, is typed or drawn
const parts = $$('[data-gb-part]', form).map((part) => {
  const pad = makePad($('canvas', part), part.dataset.hint);
  const setMode = (mode) => {
    part.dataset.mode = mode;
    $$('[data-gb-mode]', part).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.gbMode === mode)));
  };
  // The chosen way of writing takes the focus at once
  $$('[data-gb-mode]', part).forEach((button) => button.addEventListener('click', () => {
    setMode(button.dataset.gbMode);
    $('draw' === button.dataset.gbMode ? 'canvas' : 'textarea, input', part).focus();
  }));
  $('[data-gb-clear]', part).addEventListener('click', pad.clear);
  setMode('type');
  return { name: part.dataset.gbPart, part, pad, setMode };
});
const drawn = (name) => {
  const found = parts.find((part) => part.name === name);
  return 'draw' === found.part.dataset.mode ? found.pad.strokes() : [];
};

// After writing, the blank page holds the visitor's own entry: editable for 30 days, then closed
const ownEditable = () => own && Date.now() < own.until;
const showOwn = () => {
  if (!own) {
    return;
  }
  if (!ownEditable()) {
    form.dataset.state = 'closed';
    return;
  }
  form.dataset.state = 'editing';
  $('[name="message"]', form).value = own.entry.message || '';
  $('[name="name"]', form).value = own.entry.name || '';
  [ [ 'picture', own.entry.picture ], [ 'signature', own.entry.strokes ] ].forEach(([ name, strokes ]) => {
    const part = parts.find((found) => found.name === name);
    part.setMode(strokes?.length ? 'draw' : 'type');
    part.pad.load(strokes || []);
  });
  $('[data-gb-today]', form).textContent = `Merkintäsi, muokattavissa ${new Date(own.until).toLocaleDateString('fi-FI')} asti`;
  $('.gb-submit', form).textContent = 'Tallenna muutokset';
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
    refuse(name, 'Kirjoita vielä nimesi.');
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

  const editing = ownEditable();
  fetch(`${config.rest}guestbook${editing ? `/${own.id}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: editing ? own.key : undefined,
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
    const { key, until, ...entry } = answer;
    own = { id: entry.id, key, until, entry };
    store.set(OWN_KEY, own);
    entries = [ entry, ...entries.filter((other) => other.id !== entry.id) ];
    spreadIndex = 0;
    showOwn();
    render();
    status.textContent = editing ? 'Muutokset tallennettu.' : 'Kiitos! Merkintäsi on nyt kirjassa.';
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
  showOwn();
  render();
});
loadMore().catch(() => {}).finally(() => {
  loaded = true;
  render();
});
