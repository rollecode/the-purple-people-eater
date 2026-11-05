// Code blocks as on the site (js/modules/code-highlight.js): the bar with the copy button, and a coloured copy under the text being typed
const HIGHLIGHT_URL = new URL('../../vendor/highlight/', document.currentScript.src).href;
const SPRITE_URL = new URL('../../svg/icons.svg', document.currentScript.src).href;
const AUTO_MIN_RELEVANCE = 5;
const COPIED_MS = 2000;
const PLAIN = [ 'plaintext', 'text', 'txt' ];
const LABELS = { html: 'HTML', xml: 'XML', php: 'PHP', 'php-template': 'PHP', ini: 'INI' };
let highlighter = null;

const loadHighlighter = () => {
  highlighter ??= import(`${HIGHLIGHT_URL}highlight.min.js`).then(({ default: hljs }) => hljs);
  return highlighter;
};

const loadLanguage = async (hljs, language) => {
  if (!language || hljs.getLanguage(language)) {
    return;
  }
  try {
    const { default: grammar } = await import(`${HIGHLIGHT_URL}languages/${language}.min.js`);
    hljs.registerLanguage(language, grammar);
  } catch (error) {
    // Unknown name: the block falls back to guessing
  }
};

const plainText = (html) => {
  const box = document.createElement('div');
  box.innerHTML = html.replace(/<br\s*\/?>/g, '\n');
  return box.textContent;
};

const CopyButton = ({ text }) => {
  const { createElement: el, useState } = wp.element;
  const [ copied, setCopied ] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MS);
  });

  return el('button', { type: 'button', className: 'code-copy', onClick: copy },
    el('svg', { className: 'ic ic-sm', 'aria-hidden': true }, el('use', { href: `${SPRITE_URL}#copy` })),
    el('span', null, copied ? 'Kopioitu' : 'Kopioi'));
};

const withCodeHighlight = wp.compose.createHigherOrderComponent((BlockEdit) => (props) => {
  const { createElement: el, Fragment, createPortal, useEffect, useState } = wp.element;
  const isCode = 'core/code' === props.name;
  const language = ((props.attributes.className ?? '').match(/(?:^|\s)language-([\w+#-]+)/) || [])[1]?.toLowerCase();
  const [ hljs, setHljs ] = useState(null);
  const [ pre, setPre ] = useState(null);
  const [ , setLoaded ] = useState(null);

  useEffect(() => {
    if (isCode) {
      loadHighlighter().then(setHljs);
    }
  }, [ isCode ]);

  useEffect(() => {
    if (hljs) {
      loadLanguage(hljs, language).then(() => setLoaded(language));
    }
  }, [ hljs, language ]);

  // The block's own pre lives in the editor canvas
  useEffect(() => {
    if (!isCode || pre?.isConnected) {
      return;
    }
    const canvas = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
    setPre(canvas.getElementById(`block-${props.clientId}`));
  });

  // The bar stays put while long lines scroll sideways, as it does outside the scrolling code on the site
  useEffect(() => {
    if (!pre) {
      return undefined;
    }
    const follow = () => pre.querySelector(':scope > .code-bar')?.style.setProperty('translate', `${pre.scrollLeft}px 0`);
    pre.addEventListener('scroll', follow);
    return () => pre.removeEventListener('scroll', follow);
  }, [ pre ]);

  if (!isCode || !hljs || !pre?.isConnected) {
    return el(BlockEdit, props);
  }

  const text = plainText(String(props.attributes.content ?? ''));
  const known = language && hljs.getLanguage(language);
  const result = PLAIN.includes(language) ? null : known ? hljs.highlight(text, { language, ignoreIllegals: true }) : hljs.highlightAuto(text);
  const coloured = result && (known || result.relevance >= AUTO_MIN_RELEVANCE);
  // A guessed language is often wrong, so only a named one gets a label
  const name = known && !PLAIN.includes(language) ? LABELS[language] ?? known.name : '';

  return el(Fragment, null,
    el(BlockEdit, props),
    createPortal(el(Fragment, null,
      coloured && el('code', { className: 'code-shadow hljs', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: result.value } }),
      el('span', { className: 'code-bar', contentEditable: false },
        el('span', name ? { className: 'code-lang' } : null, name),
        el(CopyButton, { text }))), pre));
}, 'withCodeHighlight');

wp.hooks.addFilter('editor.BlockEdit', 'the-purple-people-eater/code-highlight', withCodeHighlight);
