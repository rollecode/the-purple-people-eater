import { $, config, articleId, prose, postJson } from 'theme/lib';

/**
 * How many are reading this post right now, as a line in the byline. The tab
 * is known only by a random id that lives as long as the page.
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

  const depth = () => {
    const rect = prose.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height)) * 100);
  };

  // Everyone on the post, this reader included; alone it says nothing
  const show = (others) => {
    const count = others.length + 1;
    line.hidden = count < 2;
    line.textContent = `${count} lukee parhaillaan`;
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
  checkIn();
}
