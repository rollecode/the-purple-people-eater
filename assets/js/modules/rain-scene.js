import { $ } from 'theme/lib';

/**
 * Rain on the 404 page: three rows of drops, the nearest longest and fastest
 */
const ROWS = [
  { every: 9, length: [ 18, 34 ], speed: [ 1.1, 1.5 ], opacity: .45 },
  { every: 14, length: [ 40, 70 ], speed: [ .75, 1 ], opacity: .7 },
  { every: 28, length: [ 80, 130 ], speed: [ .5, .65 ], opacity: 1 },
];

const sky = $('[data-rain]');
const between = ([ min, max ]) => min + Math.random() * (max - min);

const drops = ROWS.flatMap((row) => Array.from({ length: Math.round(sky.offsetWidth / row.every) }, () => {
  const speed = between(row.speed);

  return `<i style="--x:${between([ -5, 125 ]).toFixed(1)}%;--l:${between(row.length).toFixed(0)}px;--d:${speed.toFixed(2)}s;--t:-${(Math.random() * speed).toFixed(2)}s;--o:${row.opacity};--y:${between([ 0, 110 ]).toFixed(0)}cqh"></i>`;
}));

sky.innerHTML = drops.join('');
