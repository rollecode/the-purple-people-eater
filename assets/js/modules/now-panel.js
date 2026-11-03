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
// A page turn drawn as SMIL, so it runs without a script
const TURNING_PAGES = matchMedia('(prefers-reduced-motion: reduce)').matches ? icon('book') : '<svg class="pages" viewBox="-1 -1 57.2 58.6" aria-hidden="true"><path d="M26.6 15.1c0 0 6.2-6.4 25.3-6.6c.2 0 .4 0 .5 .1c.2 0 .3 .1 .4 .2c.1 .1 .2 .3 .3 .4c0 .2 .1 .3 .1 .5v38.1c0 .1-0.1 .3-0.1 .4c-0.1 .2-0.2 .3-0.3 .4c-0.1 .2-0.2 .2-0.4 .3c-0.1 .1-0.3 .1-0.4 .1c-19.6 .2-25.4 6.6-25.4 6.6v-40.5c0 0-5.8-6.4-25.4-6.6c-0.1 0-0.3 0-0.4 .1c-0.2 0-0.3 .1-0.4 .2c-0.2 .1-0.2 .3-0.3 .4c-0.1 .2-0.1 .3-0.1 .5v38.1c0 .1 0 .3 .1 .4c0 .2 .1 .3 .2 .4c.2 .2 .3 .2 .4 .3c.2 .1 .3 .1 .5 .1c19.6 .2 25.4 6.6 25.4 6.6" transform="translate(1,-.4)"/><path d="M26.6,54.4C26.6,54.4,35.5,48.4,53.1,48.4L53.3,8.9C53.3,8.8,53.2,8.6,53.1,8.4C52.9,8.2,52.7,8.1,52.4,8C52.1,7.8,51.8,7.8,51.4,7.7C51.1,7.7,50.7,7.7,50.4,7.8C35.3,7.7,26.6,13.4,26.6,14.5" transform="translate(1,.6)"><animate attributeName="d" dur="3s" repeatCount="indefinite" calcMode="spline" values="M26.6,54.4C26.6,54.4,35.5,48.4,53.1,48.4L53.3,8.9C53.3,8.8,53.2,8.6,53.1,8.4C52.9,8.2,52.7,8.1,52.4,8C52.1,7.8,51.8,7.8,51.4,7.7C51.1,7.7,50.7,7.7,50.4,7.8C35.3,7.7,26.6,13.4,26.6,14.5;M26.6,54.4C26.6,54.4,35.5,48.4,53.1,48.4L53.3,8.9C53.3,8.8,53.2,8.6,53.1,8.4C52.9,8.2,52.7,8.1,52.4,8C52.1,7.8,51.8,7.8,51.4,7.7C51.1,7.7,50.7,7.7,50.4,7.8C35.3,7.7,26.6,13.4,26.6,14.5;M26.6,54.4C26.6,53.2,30.5,45.4,35.4,42.7L35.5,4.1C35.5,3.9,35.5,3.7,35.4,3.5C35.4,3.3,35.3,3.2,35.2,3.1C35.1,3,35,2.9,34.9,2.9C34.8,2.8,34.6,2.9,34.5,2.9C29.5,5.6,26.6,13.4,26.6,14.5;M26.6,54.4C26.6,52.6,26.6,40.1,26.6,39.9L26.6,1.6C26.6,1.4,26.6,1.2,26.6,1.1C26.6,.9,26.6,.7,26.6,.6C26.6,.5,26.6,.4,26.6,.4C26.6,.4,26.6,.4,26.6,.5C26.6,4.6,26.6,13.4,26.6,14.5;M26.6,54.4C26.6,52.6,26.6,40.1,26.6,39.9L26.6,1.6C26.6,1.4,26.6,1.2,26.6,1.1C26.6,.9,26.6,.7,26.6,.6C26.6,.5,26.6,.4,26.6,.4C26.6,.4,26.6,.4,26.6,.5C26.6,4.6,26.6,13.4,26.6,14.5" keyTimes="0;.6;.7;.75;1" keySplines="0 0 1 1;.5 0 1 1;.3 0 .7 1;0 0 1 1"/><animate attributeName="opacity" dur="3s" repeatCount="indefinite" calcMode="discrete" values="1;0" keyTimes="0;.75"/></path><path d="M41.4,54.4C41.4,52.5,41.4,40.1,41.4,39.9L41.4,1.6C41.4,1.5,41.4,1.4,41.4,1.3C41.4,1.2,41.4,1.1,41.4,1.1C41.4,1,41.4,.9,41.4,.8C41.4,.7,41.4,.7,41.4,.6C41.4,.6,41.4,.5,41.4,.5C41.4,.5,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.5C41.4,4.6,41.4,13.4,41.4,14.5" opacity="0" transform="translate(-13.9,.6)"><animate attributeName="d" dur="3s" repeatCount="indefinite" calcMode="spline" values="M41.4,54.4C41.4,52.5,41.4,40.1,41.4,39.9L41.4,1.6C41.4,1.5,41.4,1.4,41.4,1.3C41.4,1.2,41.4,1.1,41.4,1.1C41.4,1,41.4,.9,41.4,.8C41.4,.7,41.4,.7,41.4,.6C41.4,.6,41.4,.5,41.4,.5C41.4,.5,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.5C41.4,4.6,41.4,13.4,41.4,14.5;M41.4,54.4C41.4,52.5,41.4,40.1,41.4,39.9L41.4,1.6C41.4,1.5,41.4,1.4,41.4,1.3C41.4,1.2,41.4,1.1,41.4,1.1C41.4,1,41.4,.9,41.4,.8C41.4,.7,41.4,.7,41.4,.6C41.4,.6,41.4,.5,41.4,.5C41.4,.5,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.4C41.4,.4,41.4,.4,41.4,.5C41.4,4.6,41.4,13.4,41.4,14.5;M41.4,54.4C41.4,54.4,37.4,44.9,32.6,42.7L32.7,3.9C32.7,3.8,32.7,3.7,32.8,3.6C32.8,3.5,32.8,3.4,32.8,3.4C32.8,3.3,32.9,3.2,32.9,3.1C33,3,33,3,33,2.9C33.1,2.9,33.1,2.8,33.2,2.8C33.2,2.8,33.3,2.7,33.4,2.7C33.4,2.7,33.5,2.7,33.5,2.7C33.6,2.7,33.6,2.7,33.7,2.8C39.4,5.9,41.4,13.4,41.4,14.5;M41.4,54.4C41.4,54.4,33.9,48.4,15.2,48.4L15.5,8.5C15.5,8.4,15.5,8.3,15.6,8.2C15.6,8.1,15.7,8,15.7,8C15.8,7.9,15.9,7.8,16,7.7C16.1,7.6,16.3,7.6,16.4,7.5C16.5,7.5,16.7,7.4,16.9,7.4C17,7.4,17.2,7.3,17.4,7.3C17.5,7.3,17.7,7.3,17.9,7.3C18,7.3,18.2,7.3,18.4,7.4C35.4,8.5,41.4,13.4,41.4,14.5;M41.4,54.4C41.4,54.4,33.9,48.4,15.2,48.4L15.5,8.5C15.5,8.4,15.5,8.3,15.6,8.2C15.6,8.1,15.7,8,15.7,8C15.8,7.9,15.9,7.8,16,7.7C16.1,7.6,16.3,7.6,16.4,7.5C16.5,7.5,16.7,7.4,16.9,7.4C17,7.4,17.2,7.3,17.4,7.3C17.5,7.3,17.7,7.3,17.9,7.3C18,7.3,18.2,7.3,18.4,7.4C35.4,8.5,41.4,13.4,41.4,14.5" keyTimes="0;.75;.8;.9;1" keySplines="0 0 1 1;.3 0 .7 1;0 0 .5 1;0 0 1 1"/><animate attributeName="opacity" dur="3s" repeatCount="indefinite" calcMode="discrete" values="0;1" keyTimes="0;.75"/></path><path d="M27.5 14.5v40.5"/></svg>';
const READING_LABELS = { active: 'Juuri nyt', paused: 'Tauolla' };
const JUST_NOW_SECONDS = 600;
const NOW_REFRESH_MS = 30000;
const nowItem = (visual, label, url, what, service, when) => `<li>${visual}<div><span class="label meta-text">${label}</span><a class="what" href="${escapeHtml(url)}">${escapeHtml(what)}</a><span class="src"><a href="${PROFILES[service]}">${service}</a>${when ? `, ${when}` : ''}</span></div></li>`;
const nowList = $('[data-now]');
if (nowList) {
  const nowPanel = nowList.closest('.now');
  nowPanel.hidden = true;
  let shown = '';

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

    // Unchanged lists stay in place so the bars and pages keep moving. Compared with what was
    // written, not innerHTML, which the browser re-serialises
    const html = items.join('');
    if (html !== shown) {
      nowList.innerHTML = shown = html;
    }
    nowPanel.hidden = !items.length;
  }).catch(() => {});

  // Live while the page is in view: the next song or book replaces the last one within half a minute
  show();
  setInterval(() => 'visible' === document.visibilityState && show(), NOW_REFRESH_MS);
  document.addEventListener('visibilitychange', () => 'visible' === document.visibilityState && show());
}
