import { $, articleId, store, getJson, icon, fiNumber, fiCount, reactionsHtml, responsesFor, postJson } from 'theme/lib';

// Selections are compared as the server compares them (rollemaa-site readers.php)
const QUOTES = { '”': '"', '“': '"', '’': "'", '‘': "'", '–': '-', '—': '-', '…': '...' };
const evenOut = (char) => (/\s/.test(char) ? ' ' : QUOTES[char] ?? char);
const evenText = (text) => [ ...text ].map(evenOut).join('').replace(/ +/g, ' ').trim();

// Claps: the count moves at once, the server gets them in batches
const CLAP_BATCH_MS = 700;
const CLAP_BATCH_MAX = 50;
const CLAP_HOLD_MS = 350;
const CLAP_REPEAT_MS = 140;
const CLAP_STREAK_MS = 1100;
const CLAP_BITS = 8;
const CLAP_COLORS = [ 'var(--accent)', 'var(--lavender)', 'var(--deep)' ];
const clap = articleId && $('[data-clap]');
let showClaps = () => {};

if (clap) {
  const button = $('.clap-btn', clap);
  const count = $('.clap-count', clap);
  const plus = $('.clap-plus', clap);
  const mineKey = `rollemaa:claps:${articleId}`;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let total = 0;
  let mine = Number(store.get(mineKey)) || 0;
  let pending = 0;
  let streak = 0;
  let flushTimer;
  let streakTimer;
  let holdTimer;
  let repeatTimer;

  const render = () => {
    count.textContent = total ? `${fiCount(total, 'taputus', 'taputusta')}${mine ? ` · sinulta ${fiNumber(mine)}` : ''}` : 'Taputa, jos tykkäsit';
    clap.classList.toggle('has-clapped', mine > 0);
  };

  const flush = () => {
    clearTimeout(flushTimer);
    if (!pending) {
      return;
    }
    const sent = pending;
    pending = 0;
    postJson(`claps/${articleId}`, { count: sent }).then((data) => {
      if (data && data.claps > total) {
        total = data.claps;
        render();
      }
    });
  };

  const burst = () => {
    for (let index = 0; index < CLAP_BITS; index++) {
      const bit = document.createElement('span');
      const angle = ((index / CLAP_BITS) * 2 + Math.random() * 0.2) * Math.PI;
      const distance = 36 + Math.random() * 18;
      const turn = `${angle + Math.PI / 2}rad`;

      bit.className = index % 2 ? 'clap-bit' : 'clap-bit is-ray';
      bit.style.background = CLAP_COLORS[index % CLAP_COLORS.length];
      button.append(bit);
      bit.animate([
        { transform: `rotate(${turn}) scale(.3)`, opacity: 1 },
        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${turn}) scale(1)`, opacity: 0 },
      ], { duration: 520 + Math.random() * 180, easing: 'cubic-bezier(.2, .8, .3, 1)' }).finished.then(() => bit.remove());
    }
  };

  const give = () => {
    total += 1;
    mine += 1;
    pending += 1;
    streak += 1;
    store.set(mineKey, mine);
    render();

    plus.textContent = `+${streak}`;
    clap.classList.add('is-streaking');
    clap.classList.remove('is-clapping');
    void clap.offsetWidth;
    clap.classList.add('is-clapping');
    setTimeout(() => clap.classList.remove('is-clapping'), 150);
    if (!still.matches) {
      burst();
    }
    navigator.vibrate?.(8);

    clearTimeout(streakTimer);
    streakTimer = setTimeout(() => {
      streak = 0;
      clap.classList.remove('is-streaking');
    }, CLAP_STREAK_MS);

    clearTimeout(flushTimer);
    if (pending >= CLAP_BATCH_MAX) {
      flush();
    } else {
      flushTimer = setTimeout(flush, CLAP_BATCH_MS);
    }
  };

  // Holding the button keeps clapping, like a round of applause
  const stopHold = () => {
    clearTimeout(holdTimer);
    clearInterval(repeatTimer);
  };

  button.addEventListener('click', give);
  button.addEventListener('pointerdown', () => {
    stopHold();
    holdTimer = setTimeout(() => {
      repeatTimer = setInterval(give, CLAP_REPEAT_MS);
    }, CLAP_HOLD_MS);
  });
  [ 'pointerup', 'pointerleave', 'pointercancel' ].forEach((type) => button.addEventListener(type, stopHold));
  button.addEventListener('contextmenu', (event) => event.preventDefault());
  window.addEventListener('pagehide', flush);

  showClaps = (claps) => {
    total = Math.max(total, claps);
    render();
  };
  render();
}

// Highlights: what a reader selects in the text counts once for that reader
const HIGHLIGHT_MIN = 15;
const HIGHLIGHT_MAX = 400;
const HIGHLIGHT_SETTLE_MS = 1500;
const HIGHLIGHTS_REMEMBERED = 50;
const highlightProse = responsesFor && $('.prose');

if (highlightProse) {
  const savedKey = `rollemaa:highlights:${responsesFor}`;
  let settleTimer;

  document.addEventListener('selectionchange', () => {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed || !highlightProse.contains(selection.anchorNode) || !highlightProse.contains(selection.focusNode)) {
        return;
      }

      const text = evenText(selection.toString());
      const saved = store.get(savedKey) || [];
      if (text.length < HIGHLIGHT_MIN || text.length > HIGHLIGHT_MAX || saved.includes(text)) {
        return;
      }

      store.set(savedKey, [ ...saved, text ].slice(-HIGHLIGHTS_REMEMBERED));
      postJson(`highlight/${responsesFor}`, { text });
    }, HIGHLIGHT_SETTLE_MS);
  });
}

// The most highlighted passage, found in the text nodes as evened-out text
const showTopHighlight = ({ text, count }) => {
  const walker = document.createTreeWalker(highlightProse, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement.closest('.mnote, .hl-label') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const positions = [];
  let flat = '';

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    [ ...node.data ].forEach((char, offset) => {
      const even = evenOut(char);
      if (' ' === even && (!flat || flat.endsWith(' '))) {
        return;
      }
      flat += even;
      [ ...even ].forEach(() => positions.push([ node, offset ]));
    });
  }

  const start = flat.indexOf(evenText(text));
  if (start < 0) {
    return;
  }

  const [ startNode, startOffset ] = positions[start];
  const [ endNode, endOffset ] = positions[start + evenText(text).length - 1];
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset + 1);

  if (window.CSS?.highlights && window.Highlight) {
    CSS.highlights.set('top-highlight', new Highlight(range));
  } else {
    try {
      const mark = document.createElement('mark');
      mark.className = 'top-highlight';
      range.surroundContents(mark);
    } catch (error) {
      return;
    }
  }

  startNode.parentElement.closest('.prose > *')?.insertAdjacentHTML('beforebegin', `<div class="hl-label">Eniten korostettu · ${fiCount(count, 'lukija', 'lukijaa')}</div>`);
};

if (responsesFor) {
  getJson(`responses/${responsesFor}`).then(({ comments, fediverse, bluesky, threads, likes, boosts, people, claps, highlight }) => {
    showClaps(claps);
    if (highlight && highlightProse) {
      showTopHighlight(highlight);
    }

    const reactions = likes + boosts;
    const line = $('.count-line');
    const meta = $('.byline .meta, .diary-head .meta-line');

    if (reactions && meta) {
      meta.insertAdjacentHTML('beforeend', `<span>${icon('heart', 'ic-sm')}${fiCount(reactions, 'reaktio', 'reaktiota')}</span>`);
    }

    const faces = $('[data-reactions]');
    if (faces) {
      faces.innerHTML = reactionsHtml(people);
    }

    if (line) {
      const sources = [ [ fediverse, 'fedi', 'fediversumista' ], [ bluesky, 'bluesky', 'Blueskystä' ], [ threads, 'threads', 'Threadsista' ] ]
        .filter(([ count ]) => count)
        .map(([ count, name, from ]) => ` · ${icon(name, 'ic-sm')}${fiNumber(count)} ${from}`)
        .join('');
      line.innerHTML = comments ? `${fiCount(comments, 'kommentti', 'kommenttia')}${sources}` : 'Ei vielä kommentteja';
    }
  });
}
