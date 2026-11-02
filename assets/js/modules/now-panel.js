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
const JUST_NOW_SECONDS = 600;
const nowItem = (visual, label, url, what, service, when) => `<li>${visual}<div><span class="label meta-text">${label}</span><a class="what" href="${escapeHtml(url)}">${escapeHtml(what)}</a><span class="src"><a href="${PROFILES[service]}">${service}</a>${when ? `, ${when}` : ''}</span></div></li>`;
const nowList = $('[data-now]');
if (nowList) {
  const nowPanel = nowList.closest('.now');
  nowPanel.hidden = true;

  getJson('now').then(({ listening, watched, reading }) => {
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
      items.push(nowItem(icon('book'), 'Luettua', reading.url, reading.title, 'Luku', reading.date && fiAgo(reading.date)));
    }

    nowList.innerHTML = items.join('');
    nowPanel.hidden = !items.length;
  }).catch(() => {});
}
