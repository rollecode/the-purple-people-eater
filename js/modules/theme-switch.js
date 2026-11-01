import { $, $$, store } from 'theme/lib';

/**
 * Theme switch: light, dark or follow the system. The prepaint script in
 * <head> has already set the class; this keeps it and the buttons in sync.
 */
const themeButtons = $$('[data-theme-set]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

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

const applyTheme = () => {
  const choice = store.raw('theme');
  const theme = choice || (systemDark.matches ? 'theme-dark' : 'theme-light');
  document.documentElement.className = theme;
  themeButtons.forEach((button) => {
    const value = button.dataset.themeSet;
    const pressed = choice ? `theme-${value}` === choice : 'auto' === value;
    button.setAttribute('aria-pressed', String(pressed));
  });
  if (themeSwitch) {
    moveThemePill();
  }
};

themeButtons.forEach((button) => button.addEventListener('click', () => {
  const value = button.dataset.themeSet;
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
