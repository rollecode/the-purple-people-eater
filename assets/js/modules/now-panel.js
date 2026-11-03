import { $, config, getJson, escapeHtml, icon, fiNumber, fiAgo } from 'theme/lib';

/**
 * Front page: most read and the "Nyt" panel
 */
const chart = $('[data-most-read]');
if (chart) {
  const TREND_LABELS = { up: 'nousussa', flat: 'ennallaan', down: 'laskussa' };

  getJson('most-read?period=week&limit=4').then((posts) => {
    if (!posts.length) {
      chart.closest('.wp-block-group').hidden = true;
      return;
    }

    chart.innerHTML = posts.map(({ title, link, reads, trend }, index) => `<li><span class="pos" aria-hidden="true">${index + 1}</span><a href="${escapeHtml(link)}">${escapeHtml(title)}</a><span class="reads meta-text"><svg class="ic ic-sm" role="img" aria-label="${TREND_LABELS[trend]}"><use href="${config.sprite}#${trend}"></use></svg>${fiNumber(reads)}<span class="screen-reader-text"> lukukertaa</span></span></li>`).join('');
  });
}

const PROFILES = {
  'Last.fm': 'https://www.last.fm/user/rolle-',
  Trakt: 'https://trakt.tv/users/rolle',
  Rollekino: 'https://www.rollekino.fi',
  Luku: 'https://luku.app/@rolle',
};
const EQUALIZER = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
const TURNING_PAGES = '<span class="pages" aria-hidden="true"><i></i><i></i></span>';
const READING_LABELS = { active: 'Juuri nyt', paused: 'Tauolla' };
const JUST_NOW_SECONDS = 600;
const NOW_REFRESH_MS = 30000;
const nowItem = (visual, label, url, what, service, when) => `<li>${visual}<div><span class="label meta-text">${label}</span><a class="what" href="${escapeHtml(url)}">${escapeHtml(what)}</a><span class="src"><a href="${PROFILES[service]}">${service}</a>${when ? `, ${when}` : ''}</span></div></li>`;
const nowList = $('[data-now]');
if (nowList) {
  const nowPanel = nowList.closest('.now');
  nowPanel.hidden = true;

  const show = () => getJson('now').then(({ listening, watched, reading }) => {
    const items = [];

    if (listening) {
      const justNow = listening.playing || Date.now() / 1000 - listening.date < JUST_NOW_SECONDS;

      items.push(nowItem(justNow ? EQUALIZER : icon('lastfm'), justNow ? 'Juuri nyt' : 'Kuunneltua', listening.url, `${listening.artist} – ${listening.track}`, 'Last.fm', listening.date && fiAgo(listening.date)));
    }
    if (watched) {
      const source = watched.source || 'Rollekino';
      items.push(nowItem(icon('Trakt' === source ? 'trakt' : 'rollekino'), 'Katsottua', watched.url, watched.title, source, fiAgo(watched.date)));
    }
    if (reading) {
      const visual = 'active' === reading.state ? TURNING_PAGES : icon('book');
      items.push(nowItem(visual, READING_LABELS[reading.state] || 'Luettua', reading.url, reading.title, 'Luku', !reading.state && reading.date && fiAgo(reading.date)));
    }

    // Unchanged lists stay in place so the bars and pages keep moving
    if (nowList.innerHTML !== items.join('')) {
      nowList.innerHTML = items.join('');
    }
    nowPanel.hidden = !items.length;
  }).catch(() => {});

  // Live while the page is in view: the next song or book replaces the last one within half a minute
  show();
  setInterval(() => 'visible' === document.visibilityState && show(), NOW_REFRESH_MS);
  document.addEventListener('visibilitychange', () => 'visible' === document.visibilityState && show());
}
