/**
 * What the theme's modules share: DOM shortcuts, page facts, storage, REST and
 * Finnish wording.
 */

const THEME_URL = new URL('../../', import.meta.url).href;
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

// One face per person, however many ways they reacted
const REACTION_FOLD = 48;
let reactionLists = 0;
const reactionsHtml = ({ faces, counts }) => (faces.length || counts ? `<div class="rx"><ul class="rx-faces${faces.length > REACTION_FOLD ? ' is-clamped' : ''}" id="rx-faces-${++reactionLists}" aria-label="Reagoineet">${faces.map(({ url, name, avatar }) => `<li><a href="${escapeHtml(url)}" title="${escapeHtml(name)}"><img src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}" width="32" height="32" loading="lazy"></a></li>`).join('')}</ul>${faces.length > REACTION_FOLD ? `<button class="rx-more" type="button" aria-expanded="false" aria-controls="rx-faces-${reactionLists}" data-expand data-more="Näytä kaikki ${fiNumber(faces.length)}" data-less="Näytä vähemmän"><span class="lbl">Näytä kaikki ${fiNumber(faces.length)}</span></button>` : ''}<p class="rx-count meta-text">${icon('heart', 'ic-sm')}${counts}</p></div>` : '');

const responsesFor = articleId || (bodyClasses.contains('single-diary') ? postId : null);
const postJson = (path, body) => fetch(`${config.rest}${path}`, {
  method: 'POST',
  keepalive: true,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then((response) => (response.ok ? response.json() : null)).catch(() => null);

const prose = $('.single-post .prose');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export {
  THEME_URL,
  $,
  $$,
  REST_URL,
  config,
  bodyClasses,
  postId,
  articleId,
  postIdOf,
  permalink,
  store,
  getJson,
  escapeHtml,
  icon,
  fiNumber,
  fiCount,
  fiWord,
  textItem,
  fiAgo,
  siteData,
  reactionsHtml,
  responsesFor,
  postJson,
  prose,
  reducedMotion,
};
