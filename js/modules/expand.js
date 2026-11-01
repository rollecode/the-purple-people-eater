import { $ } from 'theme/lib';

/**
 * Long comments open in full on request
 */
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-expand]');
  if (!button) {
    return;
  }

  const body = document.getElementById(button.getAttribute('aria-controls'));
  const expanded = 'true' === button.getAttribute('aria-expanded');
  body.classList.toggle('is-clamped', expanded);
  button.setAttribute('aria-expanded', String(!expanded));
  $('.screen-reader-text, .lbl', button).textContent = expanded ? (button.dataset.more || 'Näytä koko kommentti') : (button.dataset.less || 'Näytä vähemmän');
});
