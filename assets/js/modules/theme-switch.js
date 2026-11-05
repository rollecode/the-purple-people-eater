import { $, $$, store } from 'theme/lib';

/**
 * Theme switch: light, dark, 90s or follow the system. The prepaint script in
 * <head> has already set the class; this keeps it and the buttons in sync.
 * The 90s stylesheet and extras load only when that theme is chosen.
 */
const themeButtons = $$('[data-theme-set]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const NINETIES = 'theme-90s';

const themeSwitch = $('.themesw');

// The highlight slides under the pressed button
const moveThemePill = () => {
  const pressed = $('[aria-pressed="true"]', themeSwitch);
  if (!pressed) {
    return;
  }
  themeSwitch.style.setProperty('--pill-x', `${pressed.offsetLeft}px`);
  themeSwitch.style.setProperty('--pill-w', `${pressed.offsetWidth}px`);
};

// The prepaint script may already have written the stylesheet into <head>
const ninetiesSheet = () => {
  let link = $('link[data-nineties]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = document.documentElement.dataset.nineties;
    link.dataset.nineties = '';
    document.head.append(link);
  }
  return link;
};

// Resolves once the 90s stylesheet and extras are in or out
const setNineties = (nineties) => {
  if (!nineties && !$('link[data-nineties]')) {
    return Promise.resolve();
  }
  const link = ninetiesSheet();
  link.disabled = !nineties;
  const loaded = nineties && !link.sheet
    ? new Promise((resolve) => {
      link.addEventListener('load', resolve, { once: true });
      link.addEventListener('error', resolve, { once: true });
    })
    : null;
  const extras = import('theme/ninety').then((module) => (nineties ? module.on() : module.off()));
  return Promise.all([ loaded, extras ]);
};

// The 90s layout is a different height: while it comes or goes, the pressed button is kept where
// it was on the screen, until the reader scrolls or the page has settled
const HOLD_MS = 1500; // Late images and the visit counter
const HANDS_ON = [ 'wheel', 'touchstart', 'keydown', 'pointerdown' ];
const holdInPlace = (button, change) => {
  const root = document.documentElement;
  const middle = () => {
    const rect = button.getBoundingClientRect();
    return rect.top + rect.height / 2;
  };
  const top = middle();
  let holding = true;
  const stop = () => {
    holding = false;
  };
  const frame = () => {
    if (!holding) {
      root.style.removeProperty('overflow-anchor');
      HANDS_ON.forEach((type) => window.removeEventListener(type, stop, true));
      return;
    }
    const shift = middle() - top;
    if (shift) {
      window.scrollBy({ top: shift, behavior: 'instant' });
    }
    requestAnimationFrame(frame);
  };
  root.style.overflowAnchor = 'none';
  HANDS_ON.forEach((type) => window.addEventListener(type, stop, { capture: true, passive: true }));
  change().finally(() => window.setTimeout(stop, HOLD_MS));
  requestAnimationFrame(frame);
};

const applyTheme = () => {
  const choice = store.raw('theme');
  const theme = choice || (systemDark.matches ? 'theme-dark' : 'theme-light');
  document.documentElement.className = theme;
  const switched = setNineties(NINETIES === theme);
  themeButtons.forEach((button) => {
    const value = button.dataset.themeSet;
    const pressed = choice ? `theme-${value}` === choice : 'auto' === value;
    button.setAttribute('aria-pressed', String(pressed));
  });
  if (themeSwitch) {
    moveThemePill();
  }
  return switched;
};

themeButtons.forEach((button) => button.addEventListener('click', () => {
  const value = button.dataset.themeSet;
  store.raw('theme', 'auto' === value ? null : `theme-${value}`);
  holdInPlace(button, applyTheme);
}));

systemDark.addEventListener('change', applyTheme);
applyTheme();

if (themeSwitch) {
  // Font loading and layout changes resize the buttons under the pill
  new ResizeObserver(moveThemePill).observe(themeSwitch);
  requestAnimationFrame(() => themeSwitch.classList.add('is-ready'));
}
