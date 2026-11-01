import { $, $$, icon, fiNumber, siteData } from 'theme/lib';
import { quietLinks } from 'theme/listings';
import { markResumable } from 'theme/reading';

/**
 * Front page: Lataa lisää. Without the script the link opens the next six.
 */
const more = $('.loadmore .wp-block-query-pagination-next');
const feed = $('.cards');
if (more && feed) {
  const counter = document.createElement('span');
  counter.className = 'meta-text muted';
  counter.setAttribute('aria-live', 'polite');
  more.after(counter);
  more.setAttribute('role', 'button');
  more.insertAdjacentHTML('beforeend', icon('chev'));

  const count = () => siteData().then(({ posts }) => {
    counter.textContent = `${1 + feed.children.length} / ${fiNumber(posts)}`;
  });
  count();

  more.addEventListener('click', (event) => {
    event.preventDefault();
    if (more.getAttribute('aria-busy')) {
      return;
    }
    more.setAttribute('aria-busy', 'true');

    fetch(more.href)
      .then((response) => response.text())
      .then((html) => {
        const page = new DOMParser().parseFromString(html, 'text/html');
        const cards = $$('.cards > li', page);
        const next = $('.loadmore .wp-block-query-pagination-next', page);

        feed.append(...cards);
        quietLinks(feed);
        markResumable(feed);
        count();

        // Keyboard users continue from the first new text
        if (cards[0]) {
          $('.card-title a', cards[0]).focus();
        }

        if (next) {
          more.href = next.href;
        } else {
          more.closest('.loadmore').hidden = true;
        }
      })
      .finally(() => more.removeAttribute('aria-busy'));
  });

  more.addEventListener('keydown', (event) => {
    if (' ' === event.key) {
      event.preventDefault();
      more.click();
    }
  });
}
