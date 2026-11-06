import { $, $$, articleId, getJson, escapeHtml, fiWord, textItem, prose } from 'theme/lib';

/**
 * Article parts the template cannot know: side notes, related texts,
 * the age note, the byline icons and counts
 */
// Floated into the margin beside their paragraph; without a margin they follow it, so reading is not cut off
const MARGIN = matchMedia('(min-width: 1361px)');
const placed = [];

const seatNotes = () => {
  // Notes going after a paragraph are inserted last first, so several keep their order
  const order = MARGIN.matches ? placed : [ ...placed ].reverse();
  order.forEach(({ note, target }) => target.insertAdjacentElement(MARGIN.matches ? 'beforebegin' : 'afterend', note));
};

MARGIN.addEventListener('change', seatNotes);

const placeNotes = (notes) => {
  const paragraphs = $$('p', prose);

  notes.forEach(({ label, url, title, about, text, paragraph, href }, index) => {
    const target = paragraphs[paragraph];
    if (!target) {
      return;
    }

    const link = href && $$('a', target).find((anchor) => anchor.getAttribute('href') === href);
    if (link) {
      link.insertAdjacentHTML('afterend', `<sup class="ref" aria-hidden="true">${index + 1}</sup>`);
    }

    const note = document.createElement('template');
    note.innerHTML = `<div class="mnote" role="note"><span class="n" aria-hidden="true">${index + 1}</span><b>${escapeHtml(label)}<span class="screen-reader-text">:</span></b> <a href="${escapeHtml(url)}">${escapeHtml(title)}</a>${about ? `<span class="about">${escapeHtml(about)}</span>` : ''}${text ? `<span class="snippet">${escapeHtml(text)}</span>` : ''}</div>`;
    placed.push({ note: note.content.firstElementChild, target });
  });

  seatNotes();
};

if (articleId) {
  getJson(`notes/${articleId}`).then(placeNotes);

  const related = $('[data-related]');
  getJson(`related/${articleId}`).then((posts) => {
    if (!posts.length) {
      related.closest('.wp-block-group').hidden = true;
      return;
    }
    related.innerHTML = posts.map(textItem).join('');
  });

  // Reactions are comments to WordPress, so only this route tells them apart
  const AUTHOR_BORN = new Date(1988, 10, 1);
  const ARCHIVE_NOTE_AFTER_YEARS = 2;
  const YEAR_MS = 31557600000;
  const note = $('[data-archive-note]');
  const written = new Date($('.byline time').dateTime);
  const yearsAgo = Math.floor((Date.now() - written) / YEAR_MS);

  if (note && yearsAgo >= ARCHIVE_NOTE_AFTER_YEARS) {
    const month = written.toLocaleString('fi', { month: 'long' });
    note.innerHTML = `<span class="yr" aria-hidden="true">${written.getFullYear()}</span><p><b>Arkistomatskua.</b> Kirjoitettu ${month}ssa ${written.getFullYear()}, ${fiWord(yearsAgo)} vuotta sitten. Olin kirjoittamishetkellä ${Math.floor((written - AUTHOR_BORN) / YEAR_MS)}-vuotias.</p>`;
    note.hidden = false;
  }
}
