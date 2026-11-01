import { $, $$, permalink } from 'theme/lib';

/**
 * Copy buttons: the post address for Fediverse replies and sharing
 */
$$('[data-copy]').forEach((button) => button.addEventListener('click', () => {
  const label = $('span', button);
  const original = label ? label.textContent : '';
  navigator.clipboard.writeText(permalink).then(() => {
    if (label) {
      label.textContent = 'Kopioitu';
      setTimeout(() => {
        label.textContent = original;
      }, 2000);
    }
  });
}));
