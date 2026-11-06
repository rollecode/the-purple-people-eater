import { $, $$, prose } from 'theme/lib';

/**
 * The AI stance gauge (js/editor/stance-meter.js): the dot follows the
 * section being read, holding its score and easing into the next one
 */
const READING_LINE = 0.4;
const EASE_FROM = 0.75;
const RANGE = 2;

const meter = $('.stance-meter');
const dot = $('.stance-dot', meter);
const stops = JSON.parse(meter.dataset.stops || '{}');
let points = [];

// Fixed to the viewport, so it lives outside the text it would otherwise shift
document.body.append(meter);

const measure = () => {
  const top = (element) => element.getBoundingClientRect().top + scrollY;
  let score = stops[''] ?? 0;

  points = [ { y: top(prose), score } ];
  $$('h2', prose).forEach((heading) => {
    score = stops[heading.textContent.trim()] ?? score;
    points.push({ y: top(heading), score });
  });
  points.push({ y: top(prose) + prose.offsetHeight, score });
};

const scoreAt = (y) => {
  const next = points.findIndex((point) => point.y > y);
  if (next < 1) {
    return points[0 === next ? 0 : points.length - 1].score;
  }

  const from = points[next - 1];
  const to = points[next];
  const t = Math.max(0, ((y - from.y) / (to.y - from.y) - EASE_FROM) / (1 - EASE_FROM));

  return from.score + (to.score - from.score) * t * t * (3 - 2 * t);
};

const update = () => {
  const y = scrollY + innerHeight * READING_LINE;
  const end = points[points.length - 1].y;

  meter.classList.toggle('is-on', y > points[0].y && y < end);
  dot.style.setProperty('--p', `${((RANGE - scoreAt(y)) / (2 * RANGE)) * 100}%`);
};

let queued = false;
addEventListener('scroll', () => {
  if (queued) {
    return;
  }
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    update();
  });
}, { passive: true });

// Images and embeds change the heights after load
new ResizeObserver(() => {
  measure();
  update();
}).observe(prose);
