import { $, config, articleId, prose, postJson } from 'theme/lib';

/**
 * Who else is reading this post right now: a line in the byline and a dot in
 * the margin for each other reader, at how far down they are. The tab is
 * known only by a random id that lives as long as the page.
 */
const CHECK_IN_MS = 30000;
const SCROLL_SETTLE_MS = 3000;
const DEPTH_STEP = 5;

if (articleId && prose) {
  const tab = crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  const path = `presence/${articleId}`;
  let sentDepth = -1;
  let settleTimer;

  const line = document.createElement('span');
  line.className = 'readers-now';
  line.hidden = true;
  $('.byline .meta')?.append(line);

  const rail = document.createElement('div');
  rail.className = 'reader-rail';
  rail.ariaHidden = 'true';
  rail.hidden = true;
  rail.innerHTML = '<b class="me"></b>';
  document.body.append(rail);

  const depth = () => {
    const rect = prose.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height)) * 100);
  };

  const show = (others) => {
    const count = others.length;
    line.hidden = !count;
    line.textContent = 1 === count ? '1 muu lukee tätä juuri nyt' : `${count} muuta lukee tätä juuri nyt`;

    rail.hidden = !count;
    rail.querySelectorAll('i').forEach((dot) => dot.remove());
    others.forEach((at) => {
      const dot = document.createElement('i');
      dot.style.top = `${at}%`;
      rail.append(dot);
    });
  };

  const placeMe = () => {
    $('.me', rail).style.top = `${depth()}%`;
  };

  const checkIn = () => {
    if (document.hidden) {
      return;
    }
    sentDepth = depth();
    postJson(path, { tab, depth: sentDepth }).then((answer) => answer && show(answer.others));
  };

  const leave = () => {
    navigator.sendBeacon(`${config.rest}${path}`, new Blob([ JSON.stringify({ tab, leave: true }) ], { type: 'application/json' }));
  };

  window.addEventListener('scroll', () => {
    placeMe();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (Math.abs(depth() - sentDepth) >= DEPTH_STEP) {
        checkIn();
      }
    }, SCROLL_SETTLE_MS);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => (document.hidden ? leave() : checkIn()));
  window.addEventListener('pagehide', leave);
  window.setInterval(checkIn, CHECK_IN_MS);
  placeMe();
  checkIn();
}
