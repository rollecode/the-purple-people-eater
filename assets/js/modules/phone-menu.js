import { $, reducedMotion } from 'theme/lib';

/**
 * Phone menu sheet: a finger drags it, a pull up or a tap outside closes it,
 * and it slides away before the core menu closes for real
 */
const SHEET_CLOSE_PX = 60;
const SHEET_LEAVE_MS = 220;
const SHEET_FLING_SPEED = .4;
const SHEET_LEAVE_MIN_MS = 70;
const SHEET_PULL_DOWN = .25;
const sheet = $('.site-head .wp-block-navigation__responsive-container');
const sheetClose = sheet && $('.wp-block-navigation__responsive-container-close', sheet);
if (sheet && sheetClose) {
  let leaving = false;
  let startY = null;
  let samples = [];

  // Slides up from wherever it is, as fast as the finger threw it
  const leave = (ms = SHEET_LEAVE_MS) => {
    if (leaving) {
      return;
    }
    leaving = true;
    const duration = reducedMotion.matches ? 0 : ms;
    sheet.style.transition = `transform ${duration}ms cubic-bezier(.25, .7, .35, 1)`;
    sheet.style.transform = 'translateY(-110%)';
    window.setTimeout(() => {
      sheetClose.click();
      sheet.style.transition = '';
      sheet.style.transform = '';
      leaving = false;
    }, duration);
  };

  // Runs before the core handler, so the close can wait for the slide
  document.addEventListener('click', (event) => {
    if (!sheet.classList.contains('is-menu-open') || leaving) {
      return;
    }
    if (event.target.closest('.wp-block-navigation__responsive-container-close') || !sheet.contains(event.target)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      leave();
    }
  }, true);

  sheet.addEventListener('touchstart', (event) => {
    startY = event.touches[0].clientY;
    samples = [ [ startY, event.timeStamp ] ];
    sheet.style.transition = 'none';
  }, { passive: true });

  sheet.addEventListener('touchmove', (event) => {
    if (null === startY) {
      return;
    }
    const y = event.touches[0].clientY;
    const moved = y - startY;
    samples = [ ...samples.slice(-4), [ y, event.timeStamp ] ];
    sheet.style.transform = `translateY(${moved < 0 ? moved : moved * SHEET_PULL_DOWN}px)`;
  }, { passive: true });

  sheet.addEventListener('touchend', (event) => {
    if (null === startY) {
      return;
    }
    const y = event.changedTouches[0].clientY;
    const moved = y - startY;
    const [ fromY, fromTime ] = samples[0];
    const speed = (y - fromY) / Math.max(1, event.timeStamp - fromTime);
    startY = null;

    if (moved < -SHEET_CLOSE_PX || speed < -SHEET_FLING_SPEED) {
      const left = sheet.offsetHeight + moved;
      leave(Math.max(SHEET_LEAVE_MIN_MS, Math.min(SHEET_LEAVE_MS, left / Math.max(Math.abs(speed), 1))));
      return;
    }
    sheet.style.transition = '';
    sheet.style.transform = '';
  });
}
