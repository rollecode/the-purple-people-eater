import { $, REST_URL, getJson, escapeHtml, fiNumber } from 'theme/lib';

/**
 * Archive page: tags and the most read and discussed lists
 */
const ARCHIVE_TAGS = 18;
const ARCHIVE_RANKED = 30;
const ARCHIVE_RANK_OPEN = 10;
const NOISE_TAG = 'twitter-tilapaivitys';

const tagBars = $('[data-tagbars]');
if (tagBars) {
  fetch(`${REST_URL}wp/v2/tags?orderby=count&order=desc&per_page=${ARCHIVE_TAGS + 1}&_fields=name,link,count,slug`)
    .then((response) => response.json())
    .then((tags) => {
      const shown = tags.filter(({ slug }) => NOISE_TAG !== slug).slice(0, ARCHIVE_TAGS);
      const top = Math.max(1, ...shown.map(({ count }) => count));

      tagBars.innerHTML = shown.map(({ name, link, count }) => `<li><a href="${escapeHtml(link)}"><span class="nm">${name}</span><span class="meta-text">${count}</span><span class="b" aria-hidden="true"><i style="width: ${(count / top * 100).toFixed(1)}%"></i></span></a></li>`).join('');
    });
}

const rankedList = (items, start) => `<ol class="ranked" start="${start}">${items.map(({ link, title, count }, index) => `<li><span class="pos" aria-hidden="true">${String(start + index).padStart(2, '0')}</span><a href="${escapeHtml(link)}">${escapeHtml(title)}</a><span class="num"><b>${fiNumber(count)}</b></span></li>`).join('')}</ol>`;

const fillRanked = (element, items) => {
  const more = items.slice(ARCHIVE_RANK_OPEN);

  element.innerHTML = rankedList(items.slice(0, ARCHIVE_RANK_OPEN), 1)
    + (more.length ? `<details class="more-ranked"><summary>Koko lista, ${items.length} kirjoitusta</summary>${rankedList(more, ARCHIVE_RANK_OPEN + 1)}</details>` : '');
};

const mostRead = $('[data-ranked="read"]');
if (mostRead) {
  getJson(`most-read?period=alltime&limit=${ARCHIVE_RANKED}`).then((posts) => fillRanked(mostRead, posts.map((post) => ({ ...post, count: post.reads }))));
}

const discussed = $('[data-ranked="discussed"]');
if (discussed) {
  getJson(`discussed?limit=${ARCHIVE_RANKED}`).then((posts) => fillRanked(discussed, posts));
}
