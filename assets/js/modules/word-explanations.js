import { $, $$, icon } from 'theme/lib';

// Word explanations from the editor: <dfn class="gloss" title="…" data-url="…">
const glosses = $$('dfn.gloss');
if (glosses.length && HTMLElement.prototype.showPopover) {
  const GLOSS_EDGE = 16;
  const GLOSS_GAP = 8;
  const card = document.createElement('div');
  card.className = 'gloss-card';
  card.popover = 'auto';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-label', 'Sanan selitys');
  card.innerHTML = `<button class="gloss-close" type="button" aria-label="Sulje">${icon('close')}</button><p><strong></strong> <span></span></p><a class="gloss-link" hidden></a>`;
  document.body.append(card);

  const [ word, explanation ] = [ $('strong', card), $('span', card) ];
  const link = $('.gloss-link', card);
  const closeButton = $('.gloss-close', card);
  let active = null;
  let closingOwn = false;

  const linkLabel = (url) => (/wikipedia\.org$/.test(url.hostname) ? 'Lue lisää Wikipediasta' : `Lue lisää: ${url.hostname.replace(/^www\./, '')}`);

  const open = (term) => {
    const url = URL.canParse(term.dataset.url) ? new URL(term.dataset.url) : null;
    const linkable = url && [ 'http:', 'https:' ].includes(url.protocol);

    word.textContent = term.textContent;
    explanation.textContent = term.dataset.gloss;
    link.hidden = !linkable;
    link.href = linkable ? url.href : '';
    link.textContent = linkable ? linkLabel(url) : '';

    active = term;

    // Placed before it opens, or the browser scrolls to where it first appears
    const { left, bottom } = term.getBoundingClientRect();
    card.style.top = `${bottom + window.scrollY + GLOSS_GAP}px`;
    card.style.left = `${left + window.scrollX}px`;
    card.showPopover();

    const widest = document.documentElement.clientWidth - card.offsetWidth - GLOSS_EDGE;
    card.style.left = `${Math.max(GLOSS_EDGE, Math.min(left, widest)) + window.scrollX}px`;
    closeButton.focus({ preventScroll: true });
  };

  glosses.forEach((term) => {
    term.dataset.gloss = term.title;
    term.removeAttribute('title');
    term.tabIndex = 0;
    term.setAttribute('role', 'button');
    term.setAttribute('aria-haspopup', 'dialog');
    term.setAttribute('aria-expanded', 'false');

    // The press itself closes the open card, so the click after it must not reopen it
    term.addEventListener('pointerdown', () => {
      closingOwn = active === term;
    });
    term.addEventListener('click', (event) => {
      event.preventDefault();

      if (!closingOwn) {
        open(term);
      }
      closingOwn = false;
    });
    term.addEventListener('keydown', (event) => {
      if ('Enter' === event.key || ' ' === event.key) {
        event.preventDefault();
        open(term);
      }
    });
  });

  closeButton.addEventListener('click', () => card.hidePopover());
  card.addEventListener('toggle', ({ newState }) => {
    active?.setAttribute('aria-expanded', String('open' === newState));
    if ('closed' === newState) {
      active = null;
    }
  });
}
