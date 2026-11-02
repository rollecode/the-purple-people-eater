import { $ } from 'theme/lib';

/**
 * Logo rain
 */
const brand = $('.brand');
if (brand && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let rained = false;
  const makeItRain = () => {
    if (rained) {
      return;
    }
    rained = true;
    let drops = '';
    let backDrops = '';
    for (let left = 0; left < 100;) {
      const hundred = Math.floor(Math.random() * 98 + 1);
      const five = Math.floor(Math.random() * 4 + 2);
      left += five;
      const timing = `animation-delay: 0.${hundred}s; animation-duration: 0.5${hundred}s;`;
      const drop = (side) => `<div class="drop" style="${side}: ${left}%; bottom: ${five + five - 1 + 100}%; ${timing}"><div class="stem" style="${timing}"></div><div class="splat" style="${timing}"></div></div>`;
      drops += drop('left');
      backDrops += drop('right');
    }
    $('.rain.front-row').innerHTML = drops;
    $('.rain.back-row').innerHTML = backDrops;
  };
  brand.addEventListener('mouseenter', () => {
    makeItRain();
    document.body.classList.add('splat-toggle');
  });
  brand.addEventListener('mouseleave', () => document.body.classList.remove('splat-toggle'));
}
