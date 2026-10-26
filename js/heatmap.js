/**
 * Writing heatmap on the lokikirja front: a year of daily word counts, one
 * square per day, darker for more words.
 *
 * Data comes from the `heatmapdata` global (localized on the diary archive
 * only): { <unix timestamp of local midnight>: <word count> }.
 */

(() => {
  'use strict';

  const el = document.getElementById('heatmap');
  if (!el || typeof window.heatmapdata === 'undefined') {
    return;
  }

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
    const title = `${day.getDate()}.${day.getMonth() + 1}.${day.getFullYear()}: ${value ? `${value} sanaa` : 'ei merkintää'}`;
    const isToday = day.getTime() === today.getTime() ? ' class="is-today"' : '';
    cells += `<i data-l="${level(value)}" title="${title}"${isToday}></i>`;
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
})();
