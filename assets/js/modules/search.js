import { $, $$, store, escapeHtml, siteData } from 'theme/lib';

/**
 * Search dialog: Algolia results grouped by type, arrow keys between
 * results, the last searches remembered on this device.
 */
const dialog = $('#search');
if (dialog) {
  const input = $('#search-input', dialog);

  // The counted placeholder does not fit a phone
  if (window.matchMedia('(max-width: 600px)').matches) {
    input.placeholder = 'Hae Rollemaasta';
  }
  const results = $('#search-results', dialog);
  const status = $('#search-status', dialog);
  const empty = $('[data-search-empty]', dialog);
  const recentList = $('[data-search-recent]', dialog);
  const allLink = $('[data-search-all]', dialog);
  const randomLink = { href: allLink.href, html: allLink.innerHTML };
  const RECENT_KEY = 'rollemaa:searches';
  const MIN_LENGTH = 3;
  const cache = new Map();
  const groups = { post: 'Artikkelit', diary: 'Lokikirja', page: 'Sivut' };
  const dateFi = (unix) => {
    const date = new Date(unix * 1000);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  const showRecent = () => {
    const recent = store.get(RECENT_KEY) || [];
    recentList.innerHTML = recent.map((term) => `<li><a href="#" data-search-term="${escapeHtml(term)}">${escapeHtml(term)}</a></li>`).join('');
    empty.hidden = !recent.length;
  };

  const remember = (term) => {
    const recent = (store.get(RECENT_KEY) || []).filter((item) => item !== term);
    store.set(RECENT_KEY, [ term ].concat(recent).slice(0, 5));
  };

  const resetAllLink = () => {
    allLink.href = randomLink.href;
    allLink.innerHTML = randomLink.html;
  };

  // The field's focus line is for keyboard users only. A click reports
  // detail 0 when it comes from Enter or Space.
  const open = (event) => {
    dialog.toggleAttribute('data-keyboard', !event || 0 === event.detail);
    showRecent();
    dialog.showModal();
    input.focus();
  };

  dialog.addEventListener('pointerdown', () => dialog.removeAttribute('data-keyboard'));
  dialog.addEventListener('keydown', (event) => {
    if ('Tab' === event.key) {
      dialog.setAttribute('data-keyboard', '');
    }
  });

  const close = () => dialog.close();

  dialog.addEventListener('close', () => {
    input.value = '';
    results.innerHTML = '';
    status.textContent = '';
    resetAllLink();
  });

  // A click on the backdrop lands on the dialog element itself
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  $$('[data-open-search]').forEach((button) => button.addEventListener('click', open));
  $$('[data-close-search]', dialog).forEach((button) => button.addEventListener('click', close));

  document.addEventListener('keydown', (event) => {
    const typing = event.target.closest('input, textarea, select, [contenteditable]');
    if ('/' === event.key && !typing && !dialog.open) {
      event.preventDefault();
      open();
    }
  });

  const hitCount = (count) => (1 === count ? '1 osuma' : `${count} osumaa`);

  const render = (term, response, took) => {
    const hits = response.hits || [];
    const facets = (response.facets && response.facets.post_type) || {};
    const total = response.nbHits || 0;

    if (!hits.length) {
      results.innerHTML = `<p class="s-none">Ei osumia haulle ”${escapeHtml(term)}”. Kokeile toista sanaa.</p>`;
      status.textContent = 'Ei osumia';
      resetAllLink();
      return;
    }

    const byType = {};
    hits.forEach((hit) => {
      (byType[hit.post_type] = byType[hit.post_type] || []).push(hit);
    });

    results.innerHTML = Object.keys(groups).filter((type) => byType[type]).map((type) => {
      const items = byType[type].map((hit) => {
        const thumb = hit.image ? `<img class="s-thumb" src="${escapeHtml(hit.image)}" alt="" loading="lazy">` : '';
        const snippet = hit._snippetResult ? `<span class="x">${hit._snippetResult.content.value}</span>` : '';
        return `<li><a href="${escapeHtml(hit.url)}"><span class="s-text"><span class="t">${hit._highlightResult.title.value}</span>${snippet}<span class="d meta-text">${dateFi(hit.date)}</span></span>${thumb}</a></li>`;
      }).join('');
      return `<section class="s-group"><h2><span>${groups[type]}</span><span>${hitCount(facets[type] || byType[type].length)}</span></h2><ul class="s-list">${items}</ul></section>`;
    }).join('');

    status.textContent = `${hitCount(total)} · ${took} ms`;
    allLink.href = `/?s=${encodeURIComponent(term)}`;
    allLink.textContent = `Kaikki ${total} osumaa`;
  };

  const search = (term) => {
    if (cache.has(term)) {
      render(term, ...cache.get(term));
      return;
    }

    const started = performance.now();

    siteData()
      .then(({ search: { appId, searchKey, index } }) => fetch(`https://${appId}-dsn.algolia.net/1/indexes/${index}/query`, {
        method: 'POST',
        headers: { 'X-Algolia-Application-Id': appId, 'X-Algolia-API-Key': searchKey },
        body: JSON.stringify({
          query: term,
          facets: [ 'post_type' ],
          facetingAfterDistinct: true,
          attributesToRetrieve: [ 'title', 'url', 'date', 'post_type', 'image' ],
        }),
      }))
      .then((response) => response.json())
      .then((response) => {
        const took = Math.round(performance.now() - started);
        cache.set(term, [ response, took ]);
        if (input.value.trim() === term) {
          render(term, response, took);
          remember(term);
        }
      })
      .catch(() => {
        status.textContent = 'Haku ei juuri nyt vastaa. Yritä hetken päästä uudelleen.';
      });
  };

  // Free plan: 10K requests a month, so wait for three characters and a
  // typing pause, and never ask twice for the same thing
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const term = input.value.trim();
    empty.hidden = term.length > 0 || !recentList.children.length;

    if (term.length < MIN_LENGTH) {
      results.innerHTML = '';
      status.textContent = '';
      resetAllLink();
      return;
    }

    timer = setTimeout(() => search(term), 300);
  });

  recentList.addEventListener('click', (event) => {
    const link = event.target.closest('[data-search-term]');
    if (!link) {
      return;
    }
    event.preventDefault();
    input.value = link.dataset.searchTerm;
    input.dispatchEvent(new Event('input'));
    input.focus();
  });

  // Arrow keys move between the input and the result links
  dialog.addEventListener('keydown', (event) => {
    if (![ 'ArrowDown', 'ArrowUp' ].includes(event.key)) {
      return;
    }
    const links = $$('.s-list a, [data-search-recent] a', dialog);
    if (!links.length) {
      return;
    }
    event.preventDefault();
    const current = links.indexOf(document.activeElement);
    const next = 'ArrowDown' === event.key ? current + 1 : current - 1;
    if (next < 0) {
      input.focus();
    } else {
      links[Math.min(next, links.length - 1)].focus();
    }
  });
}
