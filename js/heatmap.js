/**
 * Writing heatmap on the lokikirja front: a year of daily word counts, one
 * square per day, darker for more words.
 *
 * Data comes from the `heatmapdata` global (localized on the diary archive
 * only): { <unix timestamp of local midnight>: <word count> }, and the
 * days with a diary entry from `heatmapdays`: { 'Y-m-d': <address> }.
 * Those days are links: one tab stop, arrow keys between days.
 */

(() => {
  'use strict';

  const el = document.getElementById('heatmap');
  if (!el || typeof window.heatmapdata === 'undefined') {
    return;
  }

  const days = window.heatmapdays || {};
  const MONTHS = [ 'tammi', 'helmi', 'maalis', 'huhti', 'touko', 'kesä', 'heinä', 'elo', 'syys', 'loka', 'marras', 'joulu' ];
  const CELL = 18; // 14px square and a 4px gap
  const localIso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // Word counts per local calendar day
  const counts = {};
  Object.entries(window.heatmapdata).forEach(([ ts, words ]) => {
    const key = localIso(new Date(ts * 1000));
    counts[key] = (counts[key] || 0) + Number(words);
  });

  const max = Math.max(...Object.values(counts), 1);
  const level = (value) => (value ? Math.min(4, Math.ceil(value / (max / 4))) : 0);

  // One year back from today, starting on a Monday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  let cells = '';
  let months = '';
  let week = -1;
  let labeled = -1;

  for (let day = new Date(start); day <= today; day.setDate(day.getDate() + 1)) {
    if (1 === day.getDay() || week < 0) {
      week += 1;
      if (day.getMonth() !== labeled && day.getDate() <= 7) {
        labeled = day.getMonth();
        months += `<span style="left: ${week * CELL}px">${MONTHS[labeled]}</span>`;
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

  el.innerHTML = `<div class="heat-months" aria-hidden="true">${months}</div>
    <div class="heat-days" aria-hidden="true"><span>ma</span><span></span><span>ke</span><span></span><span>pe</span><span></span><span></span></div>
    <div class="heat-grid">${cells}</div>
    <div class="heat-legend" aria-hidden="true"><span>Vähemmän</span><i style="background: var(--h0)"></i><i style="background: var(--h1)"></i><i style="background: var(--h2)"></i><i style="background: var(--h3)"></i><i style="background: var(--h4)"></i><span>Enemmän</span></div>`;

  // Start from the newest weeks on narrow screens
  const scroller = el.closest('.heat-scroll');
  if (scroller) {
    scroller.scrollLeft = scroller.scrollWidth;
  }

  // One tab stop: the newest day; arrows move a day up or down, a week sideways
  const cellsList = [...el.querySelectorAll('.heat-day')];
  const links = cellsList.filter((cell) => 'A' === cell.tagName);
  if (links.length) {
    links[links.length - 1].tabIndex = 0;
  }

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
  if (scroller) {
    scroller.addEventListener('scroll', hideTip, { passive: true });
  }
})();
