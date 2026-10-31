/**
 * Front-end JavaScript, vanilla and buildless. Every part checks for its
 * markup first, so one file serves all views. What the templates cannot
 * know comes from the rollemaa/v1 REST routes of the rollemaa-site mu-plugin.
 *
 * Conditional extras load from their own files: heatmap.js (diary archive)
 * and prism.js (pages with code blocks).
 */

(() => {
  'use strict';

  const THEME_URL = document.currentScript.src.replace(/js\/front-end\.js.*$/, '');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const REST_URL = $('link[rel="https://api.w.org/"]').href;
  const config = {
    rest: `${REST_URL}rollemaa/v1/`,
    sprite: `${THEME_URL}svg/icons.svg`,
    localDomains: [ 'rollemaa.test', 'rollemaa.fi', 'www.rollemaa.fi' ],
  };
  const { classList: bodyClasses } = document.body;
  const postId = (document.body.className.match(/\bpostid-(\d+)/) || [])[1];
  const articleId = bodyClasses.contains('single-post') ? postId : null;
  const postIdOf = (element) => (element.closest('.wp-block-post').className.match(/\bpost-(\d+)/) || [])[1];
  const permalink = ($('link[rel="canonical"]') || window.location).href.split('#')[0];

  // localStorage can be missing or full; nothing here is worth an error
  const store = {
    get(key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // Private mode or quota: the feature just forgets
      }
    },
    // Plain strings, shared with the prepaint script: read, write or remove (null)
    raw(key, value) {
      try {
        if (undefined === value) {
          return localStorage.getItem(key);
        }
        if (null === value) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        return null;
      }
      return value;
    },
  };

  const getJson = (path) => fetch(`${config.rest}${path}`).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });

  const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const icon = (name, classes = '') => `<svg class="ic ${classes}" aria-hidden="true"><use href="${config.sprite}#${name}"></use></svg>`;
  const fiNumber = (number) => (number < 10000 ? String(number) : number.toLocaleString('fi-FI'));
  const fiCount = (number, one, many) => `${fiNumber(number)} ${1 === number ? one : many}`;
  const fiWord = (number) => [ 'nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän', 'kymmenen' ][number] ?? fiNumber(number);
  const textItem = ({ title, link, date, minutes }) => `<li><span class="meta-text">${date} · ${minutes} min</span><a href="${escapeHtml(link)}">${escapeHtml(title)}</a></li>`;

  // How long ago, by calendar days: last night is "eilen" even a few hours later
  const fiAgo = (unix) => {
    const DAY = 86400000;
    const then = new Date(unix * 1000);
    const midnight = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const seconds = Math.max(0, Date.now() - then) / 1000;
    const days = Math.round((midnight(new Date()) - midnight(then)) / DAY);
    const unit = (number, one, many) => `${1 === number ? one : `${fiWord(number)} ${many}`} sitten`;

    if (0 === days) {
      return seconds < 3600 ? unit(Math.max(1, Math.floor(seconds / 60)), 'minuutti', 'minuuttia') : unit(Math.floor(seconds / 3600), 'tunti', 'tuntia');
    }
    if (1 === days) {
      return 'eilen';
    }
    if (days < 7) {
      return unit(days, 'päivä', 'päivää');
    }
    if (days < 30) {
      return unit(Math.floor(days / 7), 'viikko', 'viikkoa');
    }
    if (days < 365) {
      return unit(Math.floor(days / 30), 'kuukausi', 'kuukautta');
    }
    return unit(Math.floor(days / 365), 'vuosi', 'vuotta');
  };

  // Counts, years and the search keys, kept for an hour on this device
  const SITE_KEY = 'rollemaa:site';
  const SITE_MAX_AGE = 3600000;
  let sitePromise;
  const siteData = () => {
    if (!sitePromise) {
      const saved = store.get(SITE_KEY);
      sitePromise = saved && Date.now() - saved.at < SITE_MAX_AGE
        ? Promise.resolve(saved.data)
        : getJson('site').then((data) => {
          store.set(SITE_KEY, { at: Date.now(), data });
          return data;
        });
    }
    return sitePromise;
  };

  /**
   * Theme switch: light, dark or follow the system. The prepaint script in
   * <head> has already set the class; this keeps it and the buttons in sync.
   */
  const themeButtons = $$('[data-theme-set]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const themeSwitch = $('.themesw');

  // The highlight slides under the pressed button
  const moveThemePill = () => {
    const pressed = $('[aria-pressed="true"]', themeSwitch);
    if (!pressed) {
      return;
    }
    themeSwitch.style.setProperty('--pill-x', `${pressed.offsetLeft}px`);
    themeSwitch.style.setProperty('--pill-w', `${pressed.offsetWidth}px`);
  };

  const applyTheme = () => {
    const choice = store.raw('theme');
    const theme = choice || (systemDark.matches ? 'theme-dark' : 'theme-light');
    document.documentElement.className = theme;
    themeButtons.forEach((button) => {
      const value = button.dataset.themeSet;
      const pressed = choice ? `theme-${value}` === choice : 'auto' === value;
      button.setAttribute('aria-pressed', String(pressed));
    });
    if (themeSwitch) {
      moveThemePill();
    }
  };

  themeButtons.forEach((button) => button.addEventListener('click', () => {
    const value = button.dataset.themeSet;
    store.raw('theme', 'auto' === value ? null : `theme-${value}`);
    applyTheme();
  }));

  systemDark.addEventListener('change', applyTheme);
  applyTheme();

  if (themeSwitch) {
    // Font loading and layout changes resize the buttons under the pill
    new ResizeObserver(moveThemePill).observe(themeSwitch);
    requestAnimationFrame(() => themeSwitch.classList.add('is-ready'));
  }

  /**
   * Screen readers hear that a link leaves the site
   */
  const localHosts = [ window.location.host ].concat(config.localDomains || []);
  $$('.prose a[href^="http"], .keywords a[href^="http"]').forEach((link) => {
    let host;
    try {
      host = new URL(link.href).host;
    } catch (error) {
      return;
    }
    if (localHosts.includes(host) || link.getAttribute('aria-label') || !link.textContent.trim()) {
      return;
    }
    link.setAttribute('aria-label', `${link.textContent.trim()}: ulkoinen sivusto`);
  });

  // Mastodon embed script, only when the page actually has an embed
  if ($('iframe[src*="mementomori.social"]')) {
    const tag = document.createElement('script');
    tag.src = 'https://mementomori.social/embed.js';
    document.head.appendChild(tag);
  }

  /**
   * Most read posts counter, one count per post per hour per tab
   */
  if (articleId) {
    const key = `mostread_${articleId}`;
    const now = Date.now();
    if (now - Number(sessionStorage.getItem(key)) > 3600000) {
      sessionStorage.setItem(key, now);
      fetch(`${config.rest}read/${articleId}`, { method: 'POST', keepalive: true });
    }
  }

  /**
   * Logo rain
   */
  const brand = $('.brand');
  if (brand && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let rained = false;
    const makeItRain = () => {
      if (rained) {
        return;
      }
      rained = true;
      let drops = '';
      let backDrops = '';
      for (let left = 0; left < 100;) {
        const hundred = Math.floor(Math.random() * 98 + 1);
        const five = Math.floor(Math.random() * 4 + 2);
        left += five;
        const timing = `animation-delay: 0.${hundred}s; animation-duration: 0.5${hundred}s;`;
        const drop = (side) => `<div class="drop" style="${side}: ${left}%; bottom: ${five + five - 1 + 100}%; ${timing}"><div class="stem" style="${timing}"></div><div class="splat" style="${timing}"></div></div>`;
        drops += drop('left');
        backDrops += drop('right');
      }
      $('.rain.front-row').innerHTML = drops;
      $('.rain.back-row').innerHTML = backDrops;
    };
    brand.addEventListener('mouseenter', () => {
      makeItRain();
      document.body.classList.add('splat-toggle');
    });
    brand.addEventListener('mouseleave', () => document.body.classList.remove('splat-toggle'));
  }

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
          status.textContent = 'Haku ei juuri nyt vastaa. Paina Enter, niin haetaan sivuston omalla haulla.';
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

  /**
   * Counts, the shelf and the lists under it
   */
  const SHELF_TONES = [ 'L', 'D', 'S', 'L', 'S', 'D', 'L', 'S' ];
  const yearUrl = (year, count) => (count.posts ? `/${year}/` : `/lokikirja/${year}/`);

  const shelfHtml = (years, maxHeight) => {
    const most = Math.max(1, ...Object.values(years).map(({ posts }) => posts));
    let spines = 0;

    return Object.entries(years).map(([ year, count ]) => {
      if (!count.posts && !count.diary) {
        return '';
      }

      const tone = count.posts ? SHELF_TONES[spines % SHELF_TONES.length] : 'S';
      const height = Math.round(count.posts ? maxHeight * .38 + count.posts / most * maxHeight * .62 : maxHeight * .6);
      const words = count.posts ? count.post_words : count.diary_words;
      const label = count.posts ? `${year}: ${count.posts} kirjoitusta` : `${year}: lokikirjassa ${count.diary} päivää`;
      spines += 1;

      return `<li class="vol" style="--w: ${40 + Math.round(words / 1000)}; --h: ${height}px"><a href="${yearUrl(year, count)}" aria-label="${label}"><span class="sp ${tone}"><span class="n">${count.posts || count.diary}</span></span><span class="pl"></span><span class="y">${year}</span></a></li>`;
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

  /**
   * Front page: most read and the "Nyt" panel
   */
  const chart = $('[data-most-read]');
  if (chart) {
    const TREND_LABELS = { up: 'nousussa', flat: 'ennallaan', down: 'laskussa' };

    getJson('most-read?period=week&limit=4').then((posts) => {
      if (!posts.length) {
        chart.closest('.wp-block-group').hidden = true;
        return;
      }

      chart.innerHTML = posts.map(({ title, link, reads, trend }, index) => `<li><span class="pos" aria-hidden="true">${index + 1}</span><a href="${escapeHtml(link)}">${escapeHtml(title)}</a><span class="reads meta-text"><svg class="ic ic-sm" role="img" aria-label="${TREND_LABELS[trend]}"><use href="${config.sprite}#${trend}"></use></svg>${fiNumber(reads)}<span class="screen-reader-text"> lukukertaa</span></span></li>`).join('');
    });
  }

  const PROFILES = {
    'Last.fm': 'https://www.last.fm/user/rolle-',
    Trakt: 'https://trakt.tv/users/rolle',
    Rollekino: 'https://www.rollekino.fi',
    Luku: 'https://luku.app/u/rolle',
  };
  const nowItem = (iconName, label, url, what, service, when) => `<li>${icon(iconName)}<div><span class="label meta-text">${label}</span><a class="what" href="${escapeHtml(url)}">${escapeHtml(what)}</a><span class="src"><a href="${PROFILES[service]}">${service}</a>${when ? `, ${when}` : ''}</span></div></li>`;
  const nowList = $('[data-now]');
  if (nowList) {
    const nowPanel = nowList.closest('.now');
    nowPanel.hidden = true;

    getJson('now').then(({ listening, watched, reading }) => {
      const items = [];

      if (listening) {
        items.push(nowItem('lastfm', listening.playing ? 'Soi nyt' : 'Kuunneltua', listening.url, `${listening.artist} – ${listening.track}`, 'Last.fm', listening.date && fiAgo(listening.date)));
      }
      if (watched) {
        const source = watched.source || 'Rollekino';
        items.push(nowItem('Trakt' === source ? 'trakt' : 'rollekino', 'Katsottua', watched.url, watched.title, source, fiAgo(watched.date)));
      }
      if (reading) {
        items.push(nowItem('book', 'Luettua', reading.url, reading.title, 'Luku', reading.date && fiAgo(reading.date)));
      }

      nowList.innerHTML = items.join('');
      nowPanel.hidden = !items.length;
    }).catch(() => {});
  }

  /**
   * Random finds: one draw on arrival, more on request
   */
  const picks = $('[data-picks]');
  if (picks) {
    const draw = () => {
      picks.classList.add('is-loading');
      getJson('random')
        .then((posts) => {
          picks.innerHTML = posts.map(textItem).join('');
        })
        .finally(() => picks.classList.remove('is-loading'));
    };

    draw();
    $$('[data-shuffle]').forEach((button) => button.addEventListener('click', draw));
  }

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

  /**
   * All posts page. PHP's newest-first order does not survive JSON's numeric keys.
   */
  const allPosts = $('[data-all-posts]');
  if (allPosts) {
    const monthName = (month) => {
      const name = new Date(2000, month - 1).toLocaleString('fi', { month: 'long' });
      return name[0].toUpperCase() + name.slice(1);
    };
    const newestFirst = (object) => Object.entries(object).sort(([ a ], [ b ]) => b - a);

    getJson('all-posts').then((data) => {
      const years = newestFirst(data);
      const rail = years.map(([ year, months ]) => `<li><a href="#year-${year}">${year} <span class="meta-text">${Object.values(months).flat().length}</span></a></li>`).join('');
      const body = years.map(([ year, months ]) => `<section class="all-year" id="year-${year}" aria-labelledby="year-title-${year}"><h2 class="all-year-title" id="year-title-${year}">${year}</h2>${newestFirst(months).map(([ month, items ]) => `<h3 class="all-month">${monthName(month)}</h3><ul class="all-list">${items.map(({ day, date, link, title }) => `<li><time class="meta-text" datetime="${date}">${day}</time><a href="${escapeHtml(link)}">${escapeHtml(title)}</a></li>`).join('')}</ul>`).join('')}</section>`).join('');

      allPosts.innerHTML = `<nav class="all-years" aria-label="Vuodet"><ol>${rail}</ol></nav><div class="all-body">${body}</div>`;
      watchYears();
    });
  }

  /**
   * Article parts the template cannot know: side notes, related texts,
   * the age note, the byline icons and counts
   */
  const prose = $('.single-post .prose');

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

      target.insertAdjacentHTML('beforebegin', `<div class="mnote" role="note"><span class="n" aria-hidden="true">${index + 1}</span><b>${escapeHtml(label)}</b> <a href="${escapeHtml(url)}">${escapeHtml(title)}</a>${about ? `<span class="about">${escapeHtml(about)}</span>` : ''}${text ? `<span class="snippet">${escapeHtml(text)}</span>` : ''}</div>`);
    });
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

    const META_ICONS = { 'wp-block-post-date': 'cal', 'wp-block-post-time-to-read': 'clock', 'wp-block-post-comments-link': 'comment' };
    $$('.byline .meta > *').forEach((part) => {
      const name = Object.keys(META_ICONS).find((className) => part.classList.contains(className));
      if (name) {
        part.insertAdjacentHTML('afterbegin', icon(META_ICONS[name], 'ic-sm'));
      }
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

    // The photo's caption is its credit
    const hero = $('.article-head:has(> figure)');
    if (hero) {
      fetch(`${REST_URL}wp/v2/posts/${articleId}?_embed=wp:featuredmedia&_fields=_links,_embedded`)
        .then((response) => response.json())
        .then(({ _embedded: embedded }) => {
          const caption = embedded?.['wp:featuredmedia']?.[0]?.caption?.rendered;
          if (caption) {
            hero.insertAdjacentHTML('beforeend', `<span class="credit">${caption.replace(/<[^>]+>/g, '').trim()}</span>`);
          }
        });
    }
  }

  // One face per person, however many ways they reacted
  const reactionsHtml = ({ faces, counts }) => (faces.length ? `<div class="rx"><ul class="rx-faces" aria-label="Reagoineet">${faces.map(({ url, name, avatar }) => `<li><a href="${escapeHtml(url)}" title="${escapeHtml(name)}"><img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" width="32" height="32" loading="lazy"></a></li>`).join('')}</ul><p class="rx-count meta-text">${icon('heart', 'ic-sm')}${counts}</p></div>` : '');

  const responsesFor = articleId || (bodyClasses.contains('single-diary') ? postId : null);
  if (responsesFor) {
    getJson(`responses/${responsesFor}`).then(({ comments, fediverse, likes, boosts, people }) => {
      const reactions = likes + boosts;
      const line = $('.count-line');
      const meta = $('.byline .meta, .diary-head .meta-line');

      if (reactions && meta) {
        meta.insertAdjacentHTML('beforeend', `<span>${icon('heart', 'ic-sm')}${fiCount(reactions, 'reaktio', 'reaktiota')}</span>`);
      }

      const faces = $('[data-reactions]');
      if (faces) {
        faces.innerHTML = reactionsHtml(people);
      }

      if (line) {
        line.innerHTML = comments
          ? `${fiCount(comments, 'kommentti', 'kommenttia')}${fediverse ? ` · ${icon('fedi', 'ic-sm')}${fiNumber(fediverse)} fediversumista` : ''}`
          : 'Ei vielä kommentteja';
      }
    });
  }

  // A subtitle after the dash sets in italics
  const coverTitle = $('.cover-title');
  if (coverTitle) {
    const [ main, subtitle, extra ] = coverTitle.innerHTML.split(' – ');
    if (subtitle && !extra) {
      coverTitle.innerHTML = `${main} – <em>${subtitle}</em>`;
    }
  }

  /**
   * Comments: Rolle's own, fediverse handles and long ones folded
   */
  const AUTHOR_URL = 'https://mementomori.social/@rolle';
  const COMMENT_CLAMP_CHARS = 900;

  $$('.comment-list .cmt').forEach((comment, index) => {
    const link = $('.name a', comment);
    const url = link ? link.href.replace(/\/$/, '') : '';
    const handle = url.match(/^https?:\/\/([^/]+)\/@([^/?]+)/);
    const body = $('.cmt-body', comment);

    if (AUTHOR_URL === url || comment.closest('.bypostauthor')) {
      comment.classList.add('is-author');
      $('.name', comment).insertAdjacentHTML('beforeend', '<span class="role">Kirjoittaja</span>');
    } else if (handle) {
      $('.name', comment).insertAdjacentHTML('beforeend', `<a class="handle" href="${escapeHtml(url)}">@${handle[2]}@${handle[1]}</a>`);
    }

    if (handle) {
      $('.when', comment).insertAdjacentHTML('beforeend', `<span class="via">${icon('masto')}fediversumista</span>`);
    }

    if (body.textContent.length > COMMENT_CLAMP_CHARS) {
      body.id = `comment-body-${index}`;
      body.classList.add('is-clamped');
      body.insertAdjacentHTML('afterend', `<button class="expand" type="button" aria-expanded="false" aria-controls="${body.id}" data-expand><span class="screen-reader-text">Näytä koko kommentti</span>${icon('chev')}</button>`);
    }
  });

  $$('[data-permalink]').forEach((field) => {
    field.value = permalink;
  });

  const heading = $('.wp-block-post-title');
  $$('[data-share]').forEach((link) => {
    link.href = `https://share.joinmastodon.org/#text=${encodeURIComponent(`${heading.textContent} ${permalink}`)}`;
  });

  /**
   * Listings: diary days are marked, and the image link adds nothing to
   * the title link for keyboards and screen readers
   */
  $$('.row').forEach((row) => {
    if (row.closest('.type-diary')) {
      $('.meta-line', row).insertAdjacentHTML('afterbegin', `<span class="diary-mark">${icon('logbook', 'ic-sm')}Lokikirja</span>`);
    }
  });

  function quietLinks(root) {
    $$('.row-thumb a, .card-img a, .card .wp-block-read-more', root).forEach((link) => {
      link.tabIndex = -1;
      link.setAttribute('aria-hidden', 'true');
    });
  }

  quietLinks(document);
  $$('.card .wp-block-read-more').forEach((link) => link.insertAdjacentHTML('beforeend', ` ${icon('arrow')}`));

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

  /**
   * Lokikirja: the day's numbers and the same day a year ago
   */
  const dayHtml = ({ gratitude, scales, conditions, people }) => [
    gratitude ? `<div class="day-grat"><p class="day-label meta-text">Tänään olen kiitollinen</p><p class="day-grat-text">${gratitude}</p></div>` : '',
    scales.length ? `<ul class="day-scales">${scales.map(({ label, value, tone }) => `<li class="is-${tone}"><span class="meta-text">${escapeHtml(label)}</span><b>${value} %</b><span class="day-bar" aria-hidden="true"><i style="width: ${Math.min(100, value)}%"></i></span></li>`).join('')}</ul>` : '',
    conditions.length ? `<p class="day-conds meta-text">${conditions.map(({ icon: svg, text, url }) => `<span>${svg}${url ? `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>` : escapeHtml(text)}</span>`).join('')}</p>` : '',
    postId ? reactionsHtml(people) : '',
  ].join('');

  const days = $$('[data-day]');
  if (days.length) {
    const idOf = (day) => postId || postIdOf(day);

    getJson(`days?ids=${days.map(idOf).join(',')}`).then((data) => {
      days.forEach((day) => {
        const entry = data[idOf(day)];
        if (entry) {
          day.innerHTML = dayHtml(entry);
        }

        // Each day of the archive needs a name of its own
        const entryRow = day.closest('.dentry');
        if (entryRow) {
          day.closest('.day').setAttribute('aria-label', `${$('.diary-date', entryRow).textContent}, päivän tiedot`);
        }
      });
    });
  }

  const yearAgo = $('[data-year-ago]');
  if (yearAgo) {
    getJson(`year-ago/${postId}`).then((entry) => {
      if (!entry) {
        return;
      }

      const [ longDate, clock ] = entry.date.split(' · ');
      const more = entry.long ? `<button class="btn btn-ghost yearago-more" type="button" aria-expanded="false" aria-controls="year-ago-text" data-expand data-more="Näytä koko päivä" data-less="Näytä vähemmän"><span class="lbl">Näytä koko päivä</span>${icon('chev')}</button>` : '';

      yearAgo.innerHTML = `<aside class="yearago" aria-labelledby="year-ago-title"><p class="yearago-label meta-text">${icon('clock', 'ic-sm')}Vuosi sitten tänä päivänä</p><p class="yearago-date"><a href="${escapeHtml(entry.link)}">${escapeHtml(longDate)}</a></p><h2 class="dmeta meta-text" id="year-ago-title">${escapeHtml(entry.title)}<span> · ${escapeHtml(clock)}</span></h2><div class="prose yearago-text${entry.long ? ' is-clamped' : ''}" id="year-ago-text">${entry.content}</div>${more}</aside>`;
    });
  }

  // The writing calendar belongs to the first page of the whole diary
  const heatmap = $('[data-heatmap]');
  if (heatmap) {
    if (bodyClasses.contains('paged') || bodyClasses.contains('date')) {
      heatmap.hidden = true;
    } else {
      document.head.append(Object.assign(document.createElement('script'), { src: `${THEME_URL}js/heatmap.js`, async: true }));
    }
  }

  // Code highlighting only where there is code
  if ($('.prose pre')) {
    document.head.append(
      Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${THEME_URL}css/prism.css` }),
      Object.assign(document.createElement('script'), { src: `${THEME_URL}js/prism.js`, async: true })
    );
  }

  /**
   * The header marks the section, not only the exact page: an article
   * belongs to Blogi, a diary day to Lokikirja
   */
  const sectionPath = [ 'single-diary', 'post-type-archive-diary' ].some((name) => bodyClasses.contains(name))
    ? '/lokikirja/'
    : [ 'single-post', 'home', 'front-page', 'category', 'tag', 'date' ].some((name) => bodyClasses.contains(name)) && '/';
  $$('.nav a').forEach((link) => {
    if (sectionPath && new URL(link.href).pathname === sectionPath) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /**
   * Long texts remember how far you got. The byline offers to continue,
   * and front page cards show a ribbon on texts left unfinished.
   */
  const READ_PREFIX = 'rollemaa:read:';
  const RESUME_MIN = 5;
  const RESUME_MAX = 95;
  const METER_FROM = 2;
  const METER_DONE_MS = 2400;
  const METER_RESET = 97;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const whenFi = (time) => {
    const date = new Date(time);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const clock = `klo ${date.getHours()}.${String(date.getMinutes()).padStart(2, '0')}`;
    if (date.toDateString() === today.toDateString()) {
      return `tänään ${clock}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `eilen ${clock}`;
    }
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${clock}`;
  };

  function markResumable(root) {
    $$('.card', root).forEach((card) => {
      const saved = store.get(`${READ_PREFIX}${postIdOf(card)}`);
      if (!saved || saved.pct < RESUME_MIN || saved.pct > RESUME_MAX || $('.resume-chip', card)) {
        return;
      }
      const image = $('.card-img', card);
      if (image) {
        image.insertAdjacentHTML('beforeend', '<span class="ribbon" title="Lukeminen kesken"></span>');
      }
      const link = $('.card-title a', card);
      $('.card-body', card).insertAdjacentHTML('beforeend', `<a class="resume-chip" href="${link.href}#jatka">Jatka siitä, mihin jäit (${saved.pct} % luettu)</a>`);
    });
  }

  markResumable(document);

  if (prose && articleId) {
    const key = `${READ_PREFIX}${articleId}`;

    // How far the reader is, in a corner; pressing it goes back to the top
    const meter = document.createElement('button');
    meter.type = 'button';
    meter.className = 'read-meter';
    meter.hidden = true;
    meter.innerHTML = '<span class="ripples" aria-hidden="true"><i></i><i></i><i></i></span><svg class="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="done" cx="22" cy="22" r="19" pathLength="100"/></svg><span class="pct" aria-hidden="true"></span><svg class="check" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" pathLength="1"/></svg>';
    document.body.append(meter);
    meter.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      const main = $('#content');
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
    });

    const headings = $$('h2, h3', prose);
    const progress = () => {
      const rect = prose.getBoundingClientRect();
      const read = (window.innerHeight - rect.top) / rect.height;
      return Math.max(0, Math.min(1, read));
    };

    // Offer to continue from where the last visit ended
    const saved = store.get(key);
    const resume = $('[data-resume]');
    const jumpTo = (pct) => {
      const top = prose.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + prose.offsetHeight * (pct / 100) - window.innerHeight * .8 });
    };

    if (saved && resume && saved.pct >= RESUME_MIN && saved.pct <= RESUME_MAX) {
      const heading = saved.heading.replace(/[<>&]/g, '');
      const place = heading ? ` ja pääsit kohtaan <i>${heading}</i>` : '';
      const stop = /[.?!]$/.test(heading) ? '' : '.';
      $('[data-resume-text]', resume).innerHTML = `Luit tätä viimeksi ${whenFi(saved.at)}${place}${stop}`;
      $('[data-resume-pct]', resume).textContent = saved.pct;
      $('.resume-bar i', resume).style.width = `${saved.pct}%`;
      resume.hidden = false;

      const hero = $('.article-head:has(> figure)');
      if (hero) {
        hero.insertAdjacentHTML('beforeend', `<a class="ribbon" href="#" data-resume-go aria-label="Jatka siitä, mihin jäit (${saved.pct} % luettu)"></a>`);
      }

      $$('[data-resume-go]').forEach((link) => link.addEventListener('click', (event) => {
        event.preventDefault();
        jumpTo(saved.pct);
      }));
      if ('#jatka' === window.location.hash) {
        jumpTo(saved.pct);
      }
    }

    let ticking = false;
    let lastSave = 0;
    window.addEventListener('scroll', () => {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const value = progress();
        const pct = Math.round(value * 100);
        const footer = $('.site-foot');

        // Back up the text after finishing: the meter returns
        if (pct < METER_RESET) {
          clearTimeout(meter.doneTimer);
          meter.classList.remove('is-done', 'is-gone');
        }

        const finished = meter.classList.contains('is-done');
        meter.hidden = meter.classList.contains('is-gone') || pct < METER_FROM || (footer && footer.getBoundingClientRect().top < window.innerHeight);

        // The end: a tick, a ripple, and the meter bows out
        if (pct >= 100 && !finished) {
          meter.classList.add('is-done');
          meter.setAttribute('aria-label', 'Luettu loppuun, takaisin alkuun');
          meter.doneTimer = setTimeout(() => {
            meter.classList.add('is-gone');
            meter.hidden = true;
          }, METER_DONE_MS);
        }

        if (!finished && pct < 100) {
          meter.style.setProperty('--progress', pct);
          $('.pct', meter).textContent = `${pct} %`;
          meter.setAttribute('aria-label', `Luettu ${pct} %, takaisin alkuun`);
        }

        const now = Date.now();
        if (now - lastSave < 1000) {
          return;
        }
        lastSave = now;
        const passed = headings.filter((heading) => heading.getBoundingClientRect().top < window.innerHeight * .3).pop();
        store.set(key, { pct: Math.round(value * 100), heading: passed ? passed.textContent.trim() : '', at: now });
      });
    }, { passive: true });
  }

  /**
   * All posts page: the year rail marks the year in view
   */
  function watchYears() {
    const yearLinks = $$('.all-years a');
    const yearObserver = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
        yearLinks.forEach((link) => {
          const current = link.hash === `#${entry.target.id}`;
          link.toggleAttribute('aria-current', current);
          if (current) {
            link.setAttribute('aria-current', 'true');
            link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
        });
      });
    }, { rootMargin: '-12% 0px -80% 0px' });
    $$('.all-year').forEach((year) => yearObserver.observe(year));
  }

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

  /**
   * Diary entry: the note about the diary until it is closed once
   */
  const explainer = $('[data-explainer]');
  if (explainer && !store.raw('rollemaa:explainer-closed')) {
    explainer.hidden = false;
    $('[data-dismiss-explainer]', explainer).addEventListener('click', () => {
      explainer.hidden = true;
      store.raw('rollemaa:explainer-closed', '1');
    });
  }

  /**
   * Phone menu sheet: a finger drags it, a pull up or a tap outside closes it,
   * and it slides away before the core menu closes for real
   */
  const SHEET_CLOSE_PX = 60;
  const SHEET_LEAVE_MS = 300;
  const SHEET_PULL_DOWN = .25;
  const sheet = $('.site-head .wp-block-navigation__responsive-container');
  const sheetClose = sheet && $('.wp-block-navigation__responsive-container-close', sheet);
  if (sheet && sheetClose) {
    let leaving = false;
    let startY = null;

    const leave = () => {
      if (leaving) {
        return;
      }
      leaving = true;
      sheet.style.transform = '';
      sheet.classList.add('is-leaving');
      window.setTimeout(() => {
        sheetClose.click();
        sheet.classList.remove('is-leaving');
        leaving = false;
      }, reducedMotion.matches ? 0 : SHEET_LEAVE_MS);
    };

    // Runs before the core handler, so the close can wait for the slide
    document.addEventListener('click', (event) => {
      if (!sheet.classList.contains('is-menu-open') || leaving) {
        return;
      }
      if (event.target.closest('.wp-block-navigation__responsive-container-close') || !sheet.contains(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        leave();
      }
    }, true);

    sheet.addEventListener('touchstart', (event) => {
      startY = event.touches[0].clientY;
      sheet.style.transition = 'none';
    }, { passive: true });

    sheet.addEventListener('touchmove', (event) => {
      if (null === startY) {
        return;
      }
      const moved = event.touches[0].clientY - startY;
      sheet.style.transform = `translateY(${moved < 0 ? moved : moved * SHEET_PULL_DOWN}px)`;
    }, { passive: true });

    sheet.addEventListener('touchend', (event) => {
      if (null === startY) {
        return;
      }
      const moved = event.changedTouches[0].clientY - startY;
      startY = null;
      sheet.style.transition = '';
      if (moved < -SHEET_CLOSE_PX) {
        leave();
        return;
      }
      sheet.style.transform = '';
    });
  }

  /**
   * The head comes back whenever the reader scrolls up, anywhere on the page,
   * and fades out by itself or on the way down. Away from the top it floats
   * over the text. On an article with a photo it also sleeps at the top: the
   * mouse wakes it at once over the head and a moment later elsewhere on the
   * hero, a touch on the hero wakes it too. A resting pointer, an open menu
   * or keyboard focus keep it awake.
   */
  const HEAD_WAKE_MS = 2000;
  const HEAD_AWAKE_MS = 2000;
  const HEAD_TOUCH_AWAKE_MS = 4000;
  const HEAD_SCROLL_PX = 4;
  const siteHead = $('.site-head');
  if (siteHead) {
    const { classList } = document.body;
    const photoHero = $('.article-head:has(> figure)');
    const touch = !window.matchMedia('(hover: hover)').matches;
    const awakeFor = touch ? HEAD_TOUCH_AWAKE_MS : HEAD_AWAKE_MS;
    const held = () => $('a:hover, button:hover, :focus-visible, .is-menu-open', siteHead);
    let wakeTimer = null;
    let sleepTimer;
    let lastScroll = window.scrollY;

    const sleep = () => {
      if (held()) {
        sleepTimer = window.setTimeout(sleep, awakeFor);
        return;
      }
      classList.remove('head-awake');
    };

    const wake = () => {
      window.clearTimeout(wakeTimer);
      window.clearTimeout(sleepTimer);
      wakeTimer = null;
      classList.add('head-awake');
      sleepTimer = window.setTimeout(sleep, awakeFor);
    };

    // Floating takes the head out of the page, so its place is kept
    const float = () => {
      const floating = window.scrollY > siteHead.offsetHeight;
      if (floating !== classList.contains('head-floating')) {
        document.documentElement.style.setProperty('--head-h', `${siteHead.offsetHeight}px`);
        classList.toggle('head-floating', floating);
      }
    };

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < lastScroll - HEAD_SCROLL_PX) {
        wake();
      } else if (y > lastScroll + HEAD_SCROLL_PX && !held()) {
        window.clearTimeout(sleepTimer);
        classList.remove('head-awake');
      }
      lastScroll = y;
      float();
    }, { passive: true });
    float();

    if (photoHero && touch) {
      photoHero.addEventListener('touchstart', wake, { passive: true });
      siteHead.addEventListener('touchstart', wake, { passive: true });
    } else if (photoHero) {
      siteHead.addEventListener('mousemove', wake);
      photoHero.addEventListener('mousemove', () => {
        if (classList.contains('head-awake')) {
          wake();
          return;
        }
        wakeTimer ??= window.setTimeout(wake, HEAD_WAKE_MS);
      });
    } else {
      siteHead.addEventListener('mousemove', () => {
        if (classList.contains('head-awake')) {
          wake();
        }
      });
    }
  }

  /**
   * Own ad, with permanent dismiss. Dude's brand: the aurora and the
   * crawling grain from dude.fi, the logo in the middle.
   */
  const DUDE_AD_ENABLED = false;
  const DUDE_URL = 'https://www.dude.fi/yhteystiedot';
  const DUDE_LOGO = '<svg class="ownad-logo" aria-hidden="true" viewBox="0 0 2267.72 453.54"><path d="M950.26 211.64c0 37.66-12.7 111.12-97.79 111.12-85.61 0-98.4-73.47-98.4-111.12V5.23H590.91v217.92c0 138.73 97.78 221.55 261.55 221.55 163.39 0 260.93-82.82 260.93-221.55V5.23H950.26v206.41zM2264.41 127.17V5.23h-505.2v439.48h505.2V322.76h-345.08v-48.71h286.91v-98.17h-286.91v-48.71zM317.21 5.23H3v439.48h314.21c108.81 0 219.87-87.76 219.87-219.74 0-132.83-111.06-219.74-219.87-219.74zm-39.84 317.53H166.14v-195.4h111.23c57.58 0 97.7 45.79 97.7 97.61 0 52.51-40.12 97.79-97.7 97.79zM1485.51 5.23H1171.3v439.48h314.21c108.81 0 219.87-87.76 219.87-219.74 0-132.83-111.06-219.74-219.87-219.74zm-39.84 317.53h-111.23v-195.4h111.23c57.58 0 97.7 45.79 97.7 97.61 0 52.51-40.12 97.79-97.7 97.79z"/></svg>';
  const adContent = `
    <a href="${DUDE_URL}" class="global-link" aria-hidden="true" tabindex="-1"></a>
    <p class="ownad-note">Sori häiriö, tämä on härski oman firmani mainos. Teksti jatkuu alla.</p>
    ${DUDE_LOGO}
    <p class="ownad-title">Tarvitsetko laadukkaat ja helposti päivitettävät verkkosivut?</p>
    <p class="ownad-text">Teemme kotimaisia WordPress-sivustoja, jotka latautuvat supernopeasti ja ovat helposti päivitettäviä ja naurettavan hyvännäköisiä.</p>
    <ul class="ownad-facts">
      <li>Vuodesta 2013</li>
      <li>Satoja asiakkaita</li>
      <li>Ylläpito ja tuki</li>
    </ul>
    <a class="ownad-cta" href="${DUDE_URL}">Tutustu ja ota yhteyttä <svg class="ic" aria-hidden="true"><use href="${config.sprite}#arrow"></use></svg></a>
    <button class="hide-forever-ad" type="button"><svg class="ic" aria-hidden="true"><use href="${config.sprite}#close"></use></svg>Ei kiinnosta, piilota mainos pysyvästi</button>`;

  if (DUDE_AD_ENABLED && store.raw('hide_dude_ad') !== '1') {
    const spawnAd = (referenceElement) => {
      const ownAd = document.createElement('aside');
      ownAd.innerHTML = adContent;
      ownAd.classList.add('ownad-unblockable');
      ownAd.setAttribute('aria-label', 'Mainos: Digitoimisto Dude');
      document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${THEME_URL}css/ads.css` }));
      referenceElement.after(ownAd);
    };

    const articleProse = $('.single-post .prose');
    if (articleProse && articleProse.children.length) {
      spawnAd(articleProse.children[Math.floor(articleProse.children.length / 3)]);
    }
  }

  document.addEventListener('click', (event) => {
    if (!DUDE_AD_ENABLED || !event.target.closest('.hide-forever-ad')) {
      return;
    }
    const ownAd = $('.ownad-unblockable');
    ownAd.classList.add('closing');
    window.setTimeout(() => ownAd.classList.add('dismissed'), 400);
    store.raw('hide_dude_ad', '1');
  });
})();
