// Word explanation (js/modules/word-explanations.js opens it): any selected text can carry an explanation and a link
const GLOSS_FORMAT = 'rollemaa/gloss';
const GLOSS_SETTINGS = { title: 'Selitys', tagName: 'dfn', className: 'gloss' };

wp.richText.registerFormatType(GLOSS_FORMAT, {
  ...GLOSS_SETTINGS,
  attributes: { text: 'title', url: 'data-url' },
  edit: ({ isActive, activeAttributes, value, onChange, contentRef }) => {
    const { createElement: el, Fragment, useState } = wp.element;
    const { Popover, TextareaControl, TextControl, Button } = wp.components;
    const [ open, setOpen ] = useState(false);
    const [ text, setText ] = useState('');
    const [ url, setUrl ] = useState('');
    const anchor = wp.richText.useAnchor({ editableContentElement: contentRef.current, settings: GLOSS_SETTINGS });

    const start = () => {
      setText(activeAttributes.text ?? '');
      setUrl(activeAttributes.url ?? '');
      setOpen(true);
    };

    const save = () => {
      const attributes = url.trim() ? { text, url: url.trim() } : { text };

      onChange(wp.richText.applyFormat(value, { type: GLOSS_FORMAT, attributes }));
      setOpen(false);
    };

    const remove = () => {
      onChange(wp.richText.removeFormat(value, GLOSS_FORMAT));
      setOpen(false);
    };

    return el(Fragment, null,
      el(wp.blockEditor.RichTextToolbarButton, { name: 'unknown', icon: 'editor-help', title: 'Selitys', onClick: start, isActive }),
      open && el(Popover, { anchor, placement: 'bottom-start', focusOnMount: 'firstElement', onClose: () => setOpen(false) },
        el('div', { style: { width: 320, padding: 12 } },
          el(TextareaControl, { label: 'Selitys', value: text, rows: 4, onChange: setText }),
          el(TextControl, { label: 'Linkki, esimerkiksi Wikipediaan', type: 'url', value: url, onChange: setUrl }),
          el('div', { style: { display: 'flex', gap: 8 } },
            el(Button, { variant: 'primary', disabled: !text.trim(), onClick: save }, 'Tallenna'),
            isActive && el(Button, { variant: 'tertiary', isDestructive: true, onClick: remove }, 'Poista selitys')))));
  },
});
