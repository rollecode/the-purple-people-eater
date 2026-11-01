import { $$ } from 'theme/lib';

/**
 * Pictures that old posts link from services long gone: a note instead of a broken image.
 */
const loseImage = (image) => {
  const alt = image.alt.trim();
  const note = Object.assign(document.createElement('span'), {
    className: 'old-notice',
    textContent: alt ? `Kuva ”${alt}” ei ole enää saatavilla.` : 'Kuva ei ole enää saatavilla.',
  });
  const link = image.parentElement.closest('a');
  const lone = link && link.textContent.trim() === '' && link.querySelectorAll('img').length === 1;
  (lone ? link : image).replaceWith(note);
};

$$('.prose img').forEach((image) => {
  if (image.complete && image.naturalWidth === 0 && image.currentSrc) {
    loseImage(image);
    return;
  }
  image.addEventListener('error', () => loseImage(image), { once: true });
});
