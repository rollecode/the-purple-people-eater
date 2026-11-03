import { $ } from 'theme/lib';

/**
 * The head comes back whenever the reader scrolls up, anywhere on the page,
 * and fades out by itself or on the way down. Away from the top it floats
 * over the text. On an article with a photo it also sleeps at the top: the
 * mouse wakes it at once over the head and a moment later elsewhere on the
 * hero, a touch on the hero wakes it too. A resting pointer, an open menu
 * or keyboard focus keep it awake.
 */
const HEAD_WAKE_MS = 2000;
const HEAD_AWAKE_MS = 2000;
const HEAD_TOUCH_AWAKE_MS = 4000;
const HEAD_SCROLL_PX = 4;
const siteHead = $('.site-head');
if (siteHead) {
  const { classList } = document.body;
  const photoHero = $('.article-head:has(> figure)');
  const touch = !window.matchMedia('(hover: hover)').matches;
  const awakeFor = touch ? HEAD_TOUCH_AWAKE_MS : HEAD_AWAKE_MS;
  const held = () => $('a:hover, button:hover, :focus-visible, .is-menu-open', siteHead);
  let wakeTimer = null;
  let sleepTimer;
  let lastScroll = window.scrollY;

  const sleep = () => {
    if (held()) {
      sleepTimer = window.setTimeout(sleep, awakeFor);
      return;
    }
    classList.remove('head-awake');
  };

  const wake = () => {
    window.clearTimeout(wakeTimer);
    window.clearTimeout(sleepTimer);
    wakeTimer = null;
    classList.add('head-awake');
    sleepTimer = window.setTimeout(sleep, awakeFor);
  };

  // Floating takes the head out of the page, so its place is kept
  const float = () => {
    const floating = window.scrollY > siteHead.offsetHeight;
    if (floating !== classList.contains('head-floating')) {
      document.documentElement.style.setProperty('--head-h', `${siteHead.offsetHeight}px`);
      classList.toggle('head-floating', floating);
    }
  };

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < lastScroll - HEAD_SCROLL_PX) {
      wake();
    } else if (y > lastScroll + HEAD_SCROLL_PX && !held()) {
      window.clearTimeout(sleepTimer);
      classList.remove('head-awake');
    }
    lastScroll = y;
    float();
  }, { passive: true });
  float();

  if (photoHero && touch) {
    photoHero.addEventListener('touchstart', wake, { passive: true });
    siteHead.addEventListener('touchstart', wake, { passive: true });
  } else if (photoHero) {
    siteHead.addEventListener('mousemove', wake);
    photoHero.addEventListener('mousemove', () => {
      if (classList.contains('head-awake')) {
        wake();
        return;
      }
      wakeTimer ??= window.setTimeout(wake, HEAD_WAKE_MS);
    });
  } else {
    siteHead.addEventListener('mousemove', () => {
      if (classList.contains('head-awake')) {
        wake();
      }
    });
  }
}
