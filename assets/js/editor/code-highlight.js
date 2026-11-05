// Code blocks highlighted as on the site (js/modules/code-highlight.js): a coloured copy under the text being typed
const HIGHLIGHT_URL = new URL('../../vendor/highlight/', document.currentScript.src).href;
const AUTO_MIN_RELEVANCE = 5;
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

  if (!isCode || !hljs || !pre?.isConnected || PLAIN.includes(language)) {
    return el(BlockEdit, props);
  }

  const text = plainText(String(props.attributes.content ?? ''));
  const known = language && hljs.getLanguage(language);
  const result = known ? hljs.highlight(text, { language, ignoreIllegals: true }) : hljs.highlightAuto(text);
  if (!known && result.relevance < AUTO_MIN_RELEVANCE) {
    return el(BlockEdit, props);
  }

  const name = known ? LABELS[language] ?? known.name : '';

  return el(Fragment, null,
    el(BlockEdit, props),
    createPortal(el(Fragment, null,
      el('code', { className: 'code-shadow hljs', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: result.value } }),
      name && el('span', { className: 'code-bar' }, el('span', { className: 'code-lang' }, name))), pre));
}, 'withCodeHighlight');

wp.hooks.addFilter('editor.BlockEdit', 'the-purple-people-eater/code-highlight', withCodeHighlight);
