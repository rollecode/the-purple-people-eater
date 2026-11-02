import { ASSETS_URL, $$, icon } from 'theme/lib';

/**
 * Code blocks: highlight.js in Tokyo Night, with a bar for the language and
 * a copy button. The bundle knows the common languages; the rest load from
 * assets/vendor/highlight/languages only when a block names one.
 */

const VENDOR_URL = `${ASSETS_URL}vendor/highlight/`;
const COPIED_MS = 2000;
const AUTO_MIN_RELEVANCE = 5;
const PLAIN = [ 'plaintext', 'text', 'txt' ];

// Shorter names than highlight.js gives, which joins HTML with XML and INI with TOML
const LABELS = { html: 'HTML', xml: 'XML', php: 'PHP', 'php-template': 'PHP', ini: 'INI' };

const { default: hljs } = await import(`${VENDOR_URL}highlight.min.js`);

const languageOf = (pre) => (`${pre.className} ${pre.firstElementChild?.className ?? ''}`.match(/\blang(?:uage)?-([\w+#-]+)/) || [])[1];

const loadLanguage = async (language) => {
  if (!language || hljs.getLanguage(language)) {
    return;
  }

  try {
    const { default: grammar } = await import(`${VENDOR_URL}languages/${language}.min.js`);
    hljs.registerLanguage(language, grammar);
  } catch (error) {
    // Unknown name: the block falls back to guessing
  }
};

const highlight = (code, language) => {
  if (PLAIN.includes(language)) {
    return;
  }

  const result = hljs.getLanguage(language)
    ? hljs.highlight(code.textContent, { language, ignoreIllegals: true })
    : hljs.highlightAuto(code.textContent);

  if (hljs.getLanguage(language) || result.relevance >= AUTO_MIN_RELEVANCE) {
    code.innerHTML = result.value;
    code.classList.add('hljs');
  }
};

const copyButton = (code) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.innerHTML = `${icon('copy', 'ic-sm')}<span>Kopioi</span>`;
  button.addEventListener('click', () => navigator.clipboard.writeText(code.textContent).then(() => {
    button.lastChild.textContent = 'Kopioitu';
    setTimeout(() => {
      button.lastChild.textContent = 'Kopioi';
    }, COPIED_MS);
  }));
  return button;
};

const frame = (pre, code, language) => {
  const wrap = document.createElement('div');
  const bar = document.createElement('div');
  const name = LABELS[language] ?? (language && hljs.getLanguage(language)?.name);

  wrap.className = 'code-frame';
  bar.className = 'code-bar';
  bar.innerHTML = name && !PLAIN.includes(language) ? `<span class="code-lang">${name}</span>` : '<span></span>';
  bar.append(copyButton(code));
  pre.before(wrap);
  wrap.append(bar, pre);
};

$$('.prose .wp-block-code').forEach(async (pre) => {
  const code = pre.querySelector('code') ?? pre;
  const named = languageOf(pre)?.toLowerCase();

  await loadLanguage(named);
  highlight(code, named);

  // A guessed language is often wrong, so only a named one gets a label
  frame(pre, code, hljs.getLanguage(named) ? named : '');
});
