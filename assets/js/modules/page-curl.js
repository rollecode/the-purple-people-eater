import { reducedMotion } from 'theme/lib';

/**
 * A page that curls like paper: the corner follows the pointer, the page folds
 * along the line halfway between corner and pointer, its back shows as plain
 * paper and the page underneath shows in the cut-away part, shaded under the
 * fold. Idle corners curl a little and lift when pointed at.
 *
 * The host is the positioned element the pages sit in. prepare() swaps the
 * pages underneath to the ones being turned to, restore() swaps them back.
 */
const SVG = 'http://www.w3.org/2000/svg';
const IDLE_PX = 22;
const PEEK_PX = 72;
const PEEK_MS = 180;
const TURN_MS = 850;
const BACK_MS = 320;
const CLICK_PX = 6;
const COMMIT_SHARE = 0.55;
const SHADE_MAX_PX = 90;
const PAPER_UNDER = '#F1EAD7';

let layers = 0;

const box = (element) => ({ x: element.offsetLeft, y: element.offsetTop, w: element.offsetWidth, h: element.offsetHeight });
const cornerOf = (rect, side) => ({ x: 'next' === side ? rect.x + rect.w : rect.x, y: rect.y + rect.h });
const spineOf = (rect, side) => ({ x: 'next' === side ? rect.x : rect.x + rect.w, y: rect.y + rect.h });
const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - (((-2 * t) + 2) ** 3 / 2));

// The part of a polygon on one side of a line through m with normal n
const clipHalf = (points, m, n, sign) => {
  const side = (point) => sign * (((point.x - m.x) * n.x) + ((point.y - m.y) * n.y));
  const out = [];
  points.forEach((a, index) => {
    const b = points[(index + 1) % points.length];
    const sideA = side(a);
    const sideB = side(b);
    if (sideA >= 0) {
      out.push(a);
    }
    if ((sideA >= 0) !== (sideB >= 0)) {
      const t = sideA / (sideA - sideB);
      out.push({ x: a.x + ((b.x - a.x) * t), y: a.y + ((b.y - a.y) * t) });
    }
  });
  return out;
};

const mirror = (point, m, n) => {
  const distance = 2 * (((point.x - m.x) * n.x) + ((point.y - m.y) * n.y));
  return { x: point.x - (distance * n.x), y: point.y - (distance * n.y) };
};

// The fold for a corner pulled to the pointer: what stays, what is cut away and where the flap lands
const fold = (rect, corner, pointer) => {
  const length = Math.hypot(pointer.x - corner.x, pointer.y - corner.y);
  if (length < 1) {
    return null;
  }
  const n = { x: (pointer.x - corner.x) / length, y: (pointer.y - corner.y) / length };
  const m = { x: (pointer.x + corner.x) / 2, y: (pointer.y + corner.y) / 2 };
  const page = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h },
  ];
  const cut = clipHalf(page, m, n, -1);
  return { m, n, length, cut, keep: clipHalf(page, m, n, 1), flap: cut.map((point) => mirror(point, m, n)) };
};

const points = (list) => list.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

const layer = (host, kind) => {
  const id = `gb-curl-${layers++}`;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', `gb-curl is-${kind}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs>
    <linearGradient id="${id}-shade" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}-flap" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D8CDB1"/><stop offset=".14" stop-color="#F8F3E6"/><stop offset=".7" stop-color="#EEE6CF"/><stop offset="1" stop-color="#E2D7BB"/></linearGradient>
    <filter id="${id}-drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity=".28"/></filter>
  </defs><polygon class="under" fill="${PAPER_UNDER}"/><polygon class="shade" fill="url(#${id}-shade)"/><polygon class="flap" fill="url(#${id}-flap)" filter="url(#${id}-drop)"/>`;
  host.append(svg);

  const [ under, shade, flap ] = [ 'under', 'shade', 'flap' ].map((name) => svg.querySelector(`.${name}`));
  const [ shadeFill, flapFill ] = [ 'shade', 'flap' ].map((name) => svg.querySelector(`#${id}-${name}`));
  const line = (gradient, from, to) => [ [ 'x1', from.x ], [ 'y1', from.y ], [ 'x2', to.x ], [ 'y2', to.y ] ].forEach(([ key, value ]) => gradient.setAttribute(key, value));

  const draw = (rect, corner, pointer, page, paperUnder) => {
    const shape = fold(rect, corner, pointer);
    if (!shape) {
      [ under, shade, flap ].forEach((polygon) => polygon.setAttribute('points', ''));
      page.style.clipPath = '';
      return;
    }
    const { m, n, length, cut, keep } = shape;
    const reach = Math.min(SHADE_MAX_PX, length * .6);
    under.setAttribute('points', paperUnder ? points(cut) : '');
    shade.setAttribute('points', points(cut));
    flap.setAttribute('points', points(shape.flap));
    line(shadeFill, m, { x: m.x - (n.x * reach), y: m.y - (n.y * reach) });
    line(flapFill, m, { x: m.x + (n.x * length / 2), y: m.y + (n.y * length / 2) });
    page.style.clipPath = keep.length > 2 ? `polygon(${keep.map(({ x, y }) => `${(x - rect.x).toFixed(1)}px ${(y - rect.y).toFixed(1)}px`).join(', ')})` : 'inset(50%)';
  };

  return { svg, draw, remove: () => svg.remove() };
};

const tween = (from, to, ms, lift, step) => new Promise((resolve) => {
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const k = ease(t);
    step({ x: from.x + ((to.x - from.x) * k), y: from.y + ((to.y - from.y) * k) - (Math.sin(Math.PI * k) * lift) });
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      resolve();
    }
  };
  requestAnimationFrame(frame);
});

const copyOf = (page, className) => {
  const copy = page.cloneNode(true);
  copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  copy.removeAttribute('data-gb-form');
  copy.classList.add(className);
  copy.style.clipPath = '';
  Object.assign(copy.style, { left: `${page.offsetLeft}px`, top: `${page.offsetTop}px`, width: `${page.offsetWidth}px`, height: `${page.offsetHeight}px` });
  return copy;
};

/**
 * Turn a page: copies of the old pages lie over the new ones until the turning page has curled away.
 *
 * @return {{ drag: (pointer: object) => void, finish: (from?: object) => Promise<void>, cancel: () => Promise<void> }}
 */
const startTurn = async ({ host, page, side, prepare, restore }) => {
  const rect = box(page);
  const corner = cornerOf(rect, side);
  const spine = spineOf(rect, side);
  const end = { x: (2 * spine.x) - corner.x, y: corner.y };
  const still = [ ...host.querySelectorAll('.gb-page') ].find((other) => other !== page && !other.classList.contains('gb-probe'));
  const copies = [ still && copyOf(still, 'gb-still'), copyOf(page, 'gb-turning') ].filter(Boolean);

  await prepare();
  host.append(...copies);
  const turning = copies[copies.length - 1];
  const curl = layer(host, 'turning');
  let at = { x: corner.x - IDLE_PX, y: corner.y - IDLE_PX };
  const draw = (pointer) => {
    at = pointer;
    curl.draw(rect, corner, pointer, turning, false);
  };
  const cleanUp = () => {
    copies.forEach((copy) => copy.remove());
    curl.remove();
  };
  draw(at);

  return {
    rect,
    spine,
    corner,
    drag: (pointer) => {
      // The page stays attached at the spine: the corner reaches at most a page width from it
      const dx = pointer.x - spine.x;
      const dy = pointer.y - spine.y;
      const reach = Math.hypot(dx, dy);
      draw(reach > rect.w ? { x: spine.x + (dx * rect.w / reach), y: spine.y + (dy * rect.w / reach) } : pointer);
    },
    committed: () => ('next' === side ? at.x < spine.x + (rect.w * COMMIT_SHARE) : at.x > spine.x - (rect.w * COMMIT_SHARE)),
    finish: () => tween(at, end, TURN_MS * Math.max(.4, Math.abs(end.x - at.x) / (2 * rect.w)), rect.h * .12, draw).then(cleanUp),
    cancel: () => tween(at, corner, BACK_MS, 0, draw).then(() => {
      cleanUp();
      restore();
    }),
  };
};

/**
 * A curled corner on a page that turns it: click or press to turn, drag to curl by hand.
 */
export const attachCorner = ({ host, page, side, label, prepare, restore }) => {
  const rect = box(page);
  const corner = cornerOf(rect, side);
  const toward = { x: 'next' === side ? -1 : 1, y: -1.1 };
  const norm = Math.hypot(toward.x, toward.y);
  const peel = (amount) => ({ x: corner.x + (toward.x / norm * amount), y: corner.y + (toward.y / norm * amount) });
  const idle = layer(host, 'idle');
  let amount = IDLE_PX;
  let busy = false;
  const show = (value) => {
    amount = value;
    idle.draw(rect, corner, peel(value), page, true);
  };
  show(IDLE_PX);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `gb-corner is-${side}`;
  button.ariaLabel = label;
  Object.assign(button.style, { left: `${'next' === side ? corner.x - 96 : corner.x}px`, top: `${corner.y - 96}px` });
  host.append(button);

  const lift = (to) => {
    if (busy || reducedMotion.matches) {
      return;
    }
    const from = amount;
    tween({ x: from, y: 0 }, { x: to, y: 0 }, PEEK_MS, 0, ({ x }) => !busy && show(x));
  };
  button.addEventListener('pointerenter', () => lift(PEEK_PX));
  button.addEventListener('pointerleave', () => lift(IDLE_PX));

  const hostPoint = (event) => {
    const area = host.getBoundingClientRect();
    return { x: event.clientX - area.left, y: event.clientY - area.top };
  };

  const turnNow = async () => {
    if (busy) {
      return;
    }
    busy = true;
    if (reducedMotion.matches) {
      await prepare();
      return;
    }
    const turn = await startTurn({ host, page, side, prepare, restore });
    await turn.finish();
  };

  button.addEventListener('pointerdown', async (event) => {
    if (busy || reducedMotion.matches) {
      return;
    }
    event.preventDefault();
    busy = true;
    const from = hostPoint(event);
    let latest = from;
    let moved = false;
    const turnReady = startTurn({ host, page, side, prepare, restore });

    const move = (moveEvent) => {
      latest = hostPoint(moveEvent);
      moved = moved || Math.hypot(latest.x - from.x, latest.y - from.y) > CLICK_PX;
      turnReady.then((turn) => moved && turn.drag(latest));
    };
    const up = async () => {
      window.removeEventListener('pointermove', move);
      const turn = await turnReady;
      if (!moved || turn.committed()) {
        await turn.finish();
      } else {
        await turn.cancel();
      }
    };
    // On the window: turning swaps the pages, this button included, under the pointer
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
  });

  // Enter and space on the focused corner
  button.addEventListener('click', (event) => {
    if (0 === event.detail) {
      turnNow();
    }
  });

  return { turn: turnNow };
};
