import { $, $$, icon } from 'theme/lib';

/**
 * Listings: diary days are marked, and the image link adds nothing to
 * the title link for keyboards and screen readers
 */
$$('.row').forEach((row) => {
  if (row.closest('.type-diary')) {
    $('.meta-line', row).insertAdjacentHTML('afterbegin', `<span class="diary-mark">${icon('logbook', 'ic-sm')}Lokikirja</span>`);
  }
});

export function quietLinks(root) {
  $$('.row-thumb a, .card-img a, .card .wp-block-read-more', root).forEach((link) => {
    link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true');
  });
}

quietLinks(document);
$$('.card .wp-block-read-more').forEach((link) => link.insertAdjacentHTML('beforeend', ` ${icon('arrow')}`));
