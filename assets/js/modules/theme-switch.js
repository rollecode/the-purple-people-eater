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

const setNineties = (nineties) => {
  if (!nineties && !$('link[data-nineties]')) {
    return;
  }
  ninetiesSheet().disabled = !nineties;
  import('theme/ninety').then((module) => (nineties ? module.on() : module.off()));
};

const applyTheme = () => {
  const choice = store.raw('theme');
  const theme = choice || (systemDark.matches ? 'theme-dark' : 'theme-light');
  document.documentElement.className = theme;
  setNineties(NINETIES === theme);
  themeButtons.forEach((button) => {
    const value = button.dataset.themeSet;
    const pressed = choice ? `theme-${value}` === choice : 'auto' === value;
    button.setAttribute('aria-pressed', String(pressed));
  });
  if (themeSwitch) {
    moveThemePill();
  }
};

// The 90s theme adds and moves things above the switch; the switch stays put under the pointer
const KEEP_IN_PLACE_MS = 1500;
const keepInPlace = (element) => {
  const top = element.getBoundingClientRect().top;
  const until = performance.now() + KEEP_IN_PLACE_MS;
  const hold = (now) => {
    window.scrollBy({ top: element.getBoundingClientRect().top - top, behavior: 'instant' });
    if (now < until) {
      requestAnimationFrame(hold);
    }
  };
  requestAnimationFrame(hold);
};

themeButtons.forEach((button) => button.addEventListener('click', () => {
  const value = button.dataset.themeSet;
  keepInPlace(button);
  store.raw('theme', 'auto' === value ? null : `theme-${value}`);
  applyTheme();
}));

systemDark.addEventListener('change', applyTheme);
applyTheme();

if (themeSwitch) {
  // Font loading and layout changes resize the buttons under the pill
  new ResizeObserver(moveThemePill).observe(themeSwitch);
  requestAnimationFrame(() => themeSwitch.classList.add('is-ready'));
}
