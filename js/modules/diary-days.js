import { THEME_URL, $, $$, bodyClasses, postId, postIdOf, getJson, escapeHtml, icon, reactionsHtml } from 'theme/lib';

/**
 * Lokikirja: the day's numbers and the same day a year ago
 */
const dayHtml = ({ gratitude, scales, conditions, people }) => [
  gratitude ? `<div class="day-grat"><p class="day-label meta-text">Tänään olen kiitollinen</p><p class="day-grat-text">${gratitude}</p></div>` : '',
  scales.length ? `<ul class="day-scales">${scales.map(({ label, value, tone }) => `<li class="is-${tone}"><span class="meta-text">${escapeHtml(label)}</span><b>${value} %</b><span class="day-bar" aria-hidden="true"><i style="width: ${Math.min(100, value)}%"></i></span></li>`).join('')}</ul>` : '',
  conditions.length ? `<p class="day-conds meta-text">${conditions.map(({ icon: svg, text, url }) => `<span>${svg}${url ? `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>` : escapeHtml(text)}</span>`).join('')}</p>` : '',
  postId ? reactionsHtml(people) : '',
].join('');

const days = $$('[data-day]');
if (days.length) {
  const idOf = (day) => postId || postIdOf(day);

  getJson(`days?ids=${days.map(idOf).join(',')}`).then((data) => {
    days.forEach((day) => {
      const entry = data[idOf(day)];
      if (entry) {
        day.innerHTML = dayHtml(entry);
      }

      // Each day of the archive needs a name of its own
      const entryRow = day.closest('.dentry');
      if (entryRow) {
        day.closest('.day').setAttribute('aria-label', `${$('.diary-date', entryRow).textContent}, päivän tiedot`);
      }
    });
  });
}

const yearAgo = $('[data-year-ago]');
if (yearAgo) {
  getJson(`year-ago/${postId}`).then((entry) => {
    if (!entry) {
      return;
    }

    const [ longDate, clock ] = entry.date.split(' · ');
    const more = entry.long ? `<button class="btn btn-ghost yearago-more" type="button" aria-expanded="false" aria-controls="year-ago-text" data-expand data-more="Näytä koko päivä" data-less="Näytä vähemmän"><span class="lbl">Näytä koko päivä</span>${icon('chev')}</button>` : '';

    yearAgo.innerHTML = `<aside class="yearago" aria-labelledby="year-ago-title"><p class="yearago-label meta-text">${icon('clock', 'ic-sm')}Vuosi sitten tänä päivänä</p><p class="yearago-date"><a href="${escapeHtml(entry.link)}">${escapeHtml(longDate)}</a></p><h2 class="dmeta meta-text" id="year-ago-title">${escapeHtml(entry.title)}<span> · ${escapeHtml(clock)}</span></h2><div class="prose yearago-text${entry.long ? ' is-clamped' : ''}" id="year-ago-text">${entry.content}</div>${more}</aside>`;
  });
}

// The writing calendar belongs to the first page of the whole diary
const heatmap = $('[data-heatmap]');
if (heatmap) {
  if (bodyClasses.contains('paged') || bodyClasses.contains('date')) {
    heatmap.hidden = true;
  } else {
    document.head.append(Object.assign(document.createElement('script'), { src: `${THEME_URL}js/heatmap.js`, async: true }));
  }
}
