/**
 * Writing heatmap on the lokikirja front: a year of daily word counts, one
 * square per day, darker for more words.
 *
 * Data comes from the rollemaa/v1/heatmap route: word counts per day, and
 * the addresses of days with a diary entry: { words: { 'Y-m-d': <count> },
 * links: { 'Y-m-d': <address> } }. Those days are links: one tab stop,
 * arrow keys between days.
 */

import { getJson } from 'theme/lib';

const el = document.getElementById('heatmap');

const MONTHS = [ 'tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu' ];
const MIN_CELL = 8; // Below this a square is too small to see or tap: drop the oldest weeks
const LABEL_WEEKS = 4; // Room a month name needs at the right edge
const DAY_MS = 86400000;
const localIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const draw = ({ words: counts, links: days }) => {
  const max = Math.max(...Object.values(counts), 1);
  const level = (value) => (value ? Math.min(4, Math.ceil(value / (max / 4))) : 0);

  // One year back from today, whole weeks from Monday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = (date) => {
    const copy = new Date(date);
    copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
    return copy;
  };
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const thisMonday = monday(today);
  const allWeeks = Math.round((thisMonday - monday(yearAgo)) / DAY_MS / 7) + 1;

  let cellsList = [];
  let links = [];

  const render = (weeks) => {
    const start = new Date(thisMonday);
    start.setDate(start.getDate() - (weeks - 1) * 7);

    let cells = '';
    let months = '';
    let week = -1;

    for (let day = new Date(start); day <= today; day.setDate(day.getDate() + 1)) {
      if (1 === day.getDay()) {
        week += 1;
        if (day.getDate() <= 7 && week <= weeks - LABEL_WEEKS) {
          months += `<span style="grid-column-start: ${week + 1}">${MONTHS[day.getMonth()]}</span>`;
        }
      }
      const value = counts[localIso(day)] || 0;
      const label = `${day.getDate()}.${day.getMonth() + 1}.${day.getFullYear()}: ${value ? `${value} sanaa` : 'ei merkintää'}`;
      const isToday = day.getTime() === today.getTime() ? ' is-today' : '';
      const url = days[localIso(day)];
      cells += url
        ? `<a class="heat-day${isToday}" href="${url}" data-l="${level(value)}" data-tip="${label}" aria-label="${label}, avaa päivä" tabindex="-1"></a>`
        : `<i class="heat-day${isToday}" data-l="${level(value)}" data-tip="${label}"></i>`;
    }

    el.style.setProperty('--weeks', weeks);
    el.innerHTML = `<div class="heat-months" aria-hidden="true">${months}</div>
      <div class="heat-days" aria-hidden="true"><span>ma</span><span></span><span>ke</span><span></span><span>pe</span><span></span><span></span></div>
      <div class="heat-grid">${cells}</div>
      <div class="heat-legend" aria-hidden="true"><span>Vähemmän</span><i style="background: var(--h0)"></i><i style="background: var(--h1)"></i><i style="background: var(--h2)"></i><i style="background: var(--h3)"></i><i style="background: var(--h4)"></i><span>Enemmän</span></div>`;

    // One tab stop: the newest day
    cellsList = [...el.querySelectorAll('.heat-day')];
    links = cellsList.filter((cell) => 'A' === cell.tagName);
    if (links.length) {
      links[links.length - 1].tabIndex = 0;
    }
  };

  // The squares shrink to fit; when even that is not enough, the newest weeks that fit
  const fit = () => {
    render(allWeeks);
    const grid = el.querySelector('.heat-grid');
    const gap = parseFloat(getComputedStyle(grid).columnGap);
    const fits = Math.floor((grid.clientWidth + gap) / (MIN_CELL + gap));
    if (fits < allWeeks) {
      render(Math.max(1, fits));
    }
  };

  fit();

  let width = el.parentElement.clientWidth;
  new ResizeObserver(() => {
    if (el.parentElement.clientWidth !== width) {
      width = el.parentElement.clientWidth;
      fit();
    }
  }).observe(el.parentElement);

  // Arrows move a day up or down, a week sideways
  const STEPS = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 7, ArrowLeft: -7 };
  el.addEventListener('keydown', (event) => {
    const from = cellsList.indexOf(event.target);
    let step = STEPS[event.key];
    if (from < 0 || ('Home' !== event.key && 'End' !== event.key && !step)) {
      return;
    }
    event.preventDefault();

    let target = null;
    if ('Home' === event.key || 'End' === event.key) {
      target = 'Home' === event.key ? links[0] : links[links.length - 1];
    } else {
      // Skip days without an entry in the same direction
      for (let index = from + step; index >= 0 && index < cellsList.length; index += step) {
        if ('A' === cellsList[index].tagName) {
          target = cellsList[index];
          break;
        }
      }
    }

    if (target) {
      event.target.tabIndex = -1;
      target.tabIndex = 0;
      target.focus();
    }
  });

  // A black tooltip with the day, on pointer and on focus
  const tip = document.createElement('div');
  tip.className = 'heat-tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.hidden = true;
  document.body.append(tip);

  const showTip = (event) => {
    const cell = event.target.closest('.heat-day');
    if (!cell) {
      return;
    }
    const rect = cell.getBoundingClientRect();
    tip.textContent = cell.dataset.tip;
    tip.hidden = false;
    tip.style.left = `${rect.left + rect.width / 2}px`;
    tip.style.top = `${rect.top}px`;
  };
  const hideTip = () => {
    tip.hidden = true;
  };

  el.addEventListener('pointerover', showTip);
  el.addEventListener('focusin', showTip);
  el.addEventListener('pointerleave', hideTip);
  el.addEventListener('focusout', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });
};

getJson('heatmap').then(draw);
