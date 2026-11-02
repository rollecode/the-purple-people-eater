import { $, $$, fiNumber, fiCount, siteData } from 'theme/lib';

/**
 * Counts, the shelf and the lists under it
 */
const SHELF_TONES = [ 'L', 'D', 'S', 'L', 'S', 'D', 'L', 'S' ];
const yearUrl = (year, count) => (count.posts ? `/${year}/` : `/lokikirja/${year}/`);

// Every spine counts the year's texts, articles and diary days alike, and grows with its words
const shelfHtml = (years, maxHeight) => {
  const yearWords = ({ post_words: postWords, diary_words: diaryWords }) => postWords + diaryWords;
  const most = Math.max(1, ...Object.values(years).map(yearWords));
  let spines = 0;

  return Object.entries(years).map(([ year, count ]) => {
    const texts = count.posts + count.diary;
    if (!texts) {
      return '';
    }

    const words = yearWords(count);
    const tone = SHELF_TONES[spines % SHELF_TONES.length];
    const height = Math.round(maxHeight * .38 + words / most * maxHeight * .62);
    const label = `${year}: ${fiCount(texts, 'kirjoitus', 'kirjoitusta')}, ${fiCount(words, 'sana', 'sanaa')}`;
    spines += 1;

    return `<li class="vol" style="--w: ${40 + Math.round(words / 1000)}; --h: ${height}px"><a href="${yearUrl(year, count)}" aria-label="${label}"><span class="sp ${tone}"><span class="n">${fiNumber(texts)}</span></span><span class="pl"></span><span class="y">${year}</span></a></li>`;
  }).join('');
};

const yearRow = ([ year, count ]) => {
  const parts = [
    count.posts ? fiCount(count.posts, 'kirjoitus', 'kirjoitusta') : '',
    count.diary ? `${fiCount(count.diary, 'päivä', 'päivää')} lokikirjassa` : '',
  ].filter(Boolean).join(' · ');

  return `<li><a href="${yearUrl(year, count)}">${year}</a><span class="meta-text muted">${parts}</span><b>${fiCount(count.post_words + count.diary_words, 'sana', 'sanaa')}</b></li>`;
};

siteData().then((site) => {
  const stats = { ...site, texts: site.posts + site.diary };

  $$('[data-stat]').forEach((element) => {
    element.textContent = fiNumber(stats[element.dataset.stat]);
  });

  $$('[data-shelf]').forEach((shelf) => {
    shelf.innerHTML = shelfHtml(site.years, Number(shelf.dataset.shelf));
    // Starts from the newest years on narrow screens
    shelf.scrollLeft = shelf.scrollWidth;
  });

  const years = $('[data-years]');
  if (years) {
    years.innerHTML = Object.entries(site.years).reverse().map(yearRow).join('');
  }
});
