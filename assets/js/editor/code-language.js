// Code block language (js/modules/code-highlight.js reads it): a language-* class, so the block stays core markup
const CODE_LANGUAGES_URL = new URL('../../vendor/highlight/languages.json', document.currentScript.src).href;
const CODE_LANGUAGE_CLASS = /(^|\s)language-[\w+#-]+/g;
let codeLanguages = null;

const loadCodeLanguages = () => {
  codeLanguages ??= fetch(CODE_LANGUAGES_URL)
    .then((response) => response.json())
    .then((names) => Object.entries(names).map(([ value, label ]) => ({ value, label })));
  return codeLanguages;
};

const withCodeLanguage = wp.compose.createHigherOrderComponent((BlockEdit) => (props) => {
  const { createElement: el, Fragment, useEffect, useState } = wp.element;
  const { InspectorControls } = wp.blockEditor;
  const { PanelBody, ComboboxControl } = wp.components;
  const [ options, setOptions ] = useState([]);

  useEffect(() => {
    if ('core/code' === props.name) {
      loadCodeLanguages().then(setOptions);
    }
  }, [ props.name ]);

  if ('core/code' !== props.name) {
    return el(BlockEdit, props);
  }

  const className = props.attributes.className ?? '';
  const current = (className.match(/(?:^|\s)language-([\w+#-]+)/) || [])[1] ?? '';

  const choose = (language) => {
    const rest = className.replace(CODE_LANGUAGE_CLASS, '').trim();
    const next = [ rest, language ? `language-${language}` : '' ].filter(Boolean).join(' ');
    props.setAttributes({ className: next || undefined });
  };

  return el(Fragment, null,
    el(BlockEdit, props),
    el(InspectorControls, null,
      el(PanelBody, { title: 'Kieli' },
        el(ComboboxControl, {
          label: 'Ohjelmointikieli',
          help: 'Ilman kieltä korostus arvaa sen koodista.',
          value: current,
          options,
          onChange: choose,
        }))));
}, 'withCodeLanguage');

wp.hooks.addFilter('editor.BlockEdit', 'the-purple-people-eater/code-language', withCodeLanguage);
