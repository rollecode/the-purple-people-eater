/**
 * Front-end JavaScript, vanilla and buildless. Every part checks for its
 * markup first, so one file serves all views. Settings come from
 * window.rollemaa (scripts-styles.php).
 *
 * Conditional extras live in their own files: heatmap.js (diary archive)
 * and prism.js (singulars with code blocks).
 */

(() => {
  'use strict';

  const config = window.rollemaa || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

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
  if (config.post) {
    const key = `mostread_${config.post}`;
    const now = Date.now();
    if (now - Number(sessionStorage.getItem(key)) > 3600000) {
      sessionStorage.setItem(key, now);
      fetch(`${config.rest}read/${config.post}`, { method: 'POST', keepalive: true });
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
    const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
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

      const { appId, searchKey, index } = config.algolia;
      fetch(`https://${appId}-dsn.algolia.net/1/indexes/${index}/query`, {
        method: 'POST',
        headers: { 'X-Algolia-Application-Id': appId, 'X-Algolia-API-Key': searchKey },
        body: JSON.stringify({
          query: term,
          facets: [ 'post_type' ],
          facetingAfterDistinct: true,
          attributesToRetrieve: [ 'title', 'url', 'date', 'post_type', 'image' ],
        }),
      })
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
   * Front page: more cards
   */
  const loadMore = $('[data-load-more]');
  const feed = $('[data-feed]');
  if (loadMore && feed) {
    const counter = $('[data-feed-count]');
    loadMore.addEventListener('click', () => {
      loadMore.disabled = true;
      const shown = $$('.card', feed).length;

      getJson(`cards?offset=${shown}`)
        .then(({ html, done }) => {
          const first = feed.children.length;
          feed.insertAdjacentHTML('beforeend', html);
          markResumable(feed);
          if (counter) {
            counter.textContent = counter.textContent.replace(/^\d+/, String(1 + $$('.card', feed).length));
          }
          // Keyboard users continue from the first new card
          const firstNew = feed.children[first];
          if (firstNew) {
            $('.card-title a', firstNew).focus();
          }
          loadMore.closest('.loadmore').hidden = done;
        })
        .finally(() => {
          loadMore.disabled = false;
        });
    });
  }

  /**
   * Front page: draw new random finds
   */
  const picks = $('#random-picks');
  $$('[data-shuffle]').forEach((button) => button.addEventListener('click', () => {
    picks.classList.add('is-loading');
    getJson('random')
      .then(({ html }) => {
        picks.innerHTML = html;
      })
      .finally(() => picks.classList.remove('is-loading'));
  }));

  /**
   * Front page: refresh the "Nyt" panel; the page shows the cached copy
   */
  const nowPanel = $('[data-now]');
  if (nowPanel) {
    getJson('now').then(({ html }) => {
      if (html) {
        $('[data-now-items]', nowPanel).innerHTML = html;
        nowPanel.hidden = false;
      }
    }).catch(() => {});
  }

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
    $$('.card[data-post-id]', root).forEach((card) => {
      const saved = store.get(`${READ_PREFIX}${card.dataset.postId}`);
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

  const prose = $('.single-post .prose');
  if (prose && config.post) {
    const key = `${READ_PREFIX}${config.post}`;

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

      const hero = $('.photo-hero');
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
  const yearLinks = $$('.all-years a');
  if (yearLinks.length && 'IntersectionObserver' in window) {
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
    navigator.clipboard.writeText(button.dataset.copy).then(() => {
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
  $$('[data-expand]').forEach((button) => button.addEventListener('click', () => {
    const body = document.getElementById(button.getAttribute('aria-controls'));
    const expanded = 'true' === button.getAttribute('aria-expanded');
    body.classList.toggle('is-clamped', expanded);
    button.setAttribute('aria-expanded', String(!expanded));
    $('.screen-reader-text, .lbl', button).textContent = expanded ? (button.dataset.more || 'Näytä koko kommentti') : (button.dataset.less || 'Näytä vähemmän');
  }));

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
   * The shelf starts from the newest years on narrow screens
   */
  $$('.shelf').forEach((shelf) => {
    shelf.scrollLeft = shelf.scrollWidth;
  });

  /**
   * Article with a photo: the head sleeps until the mouse moves over the
   * hero. It stays awake under a resting pointer, so no link vanishes from
   * under it. Keyboard focus is handled in nav.css.
   */
  const HEAD_AWAKE_MS = 2000;
  const photoHero = $('.photo-hero');
  const siteHead = $('.site-head');
  if (photoHero && siteHead && window.matchMedia('(hover: hover)').matches) {
    let sleepTimer;
    const sleep = () => {
      if ($('a:hover, button:hover', siteHead)) {
        sleepTimer = window.setTimeout(sleep, HEAD_AWAKE_MS);
        return;
      }
      document.body.classList.remove('head-awake');
    };
    const wake = () => {
      document.body.classList.add('head-awake');
      window.clearTimeout(sleepTimer);
      sleepTimer = window.setTimeout(sleep, HEAD_AWAKE_MS);
    };

    [ photoHero, siteHead ].forEach((element) => element.addEventListener('mousemove', wake));
  }

  /**
   * Own ad, with permanent dismiss. Dude's brand: the aurora and the
   * crawling grain from dude.fi, the logo in the middle.
   */
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

  if (store.raw('hide_dude_ad') !== '1') {
    const spawnAd = (referenceElement) => {
      const ownAd = document.createElement('aside');
      ownAd.innerHTML = adContent;
      ownAd.classList.add('ownad-unblockable');
      ownAd.setAttribute('aria-label', 'Mainos: Digitoimisto Dude');
      referenceElement.after(ownAd);
    };

    const articleProse = $('.single-post .prose');
    if (articleProse && articleProse.children.length) {
      spawnAd(articleProse.children[Math.floor(articleProse.children.length / 3)]);
    }
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.hide-forever-ad')) {
      return;
    }
    const ownAd = $('.ownad-unblockable');
    ownAd.classList.add('closing');
    window.setTimeout(() => ownAd.classList.add('dismissed'), 400);
    store.raw('hide_dude_ad', '1');
  });
})();
