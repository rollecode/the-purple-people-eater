// A pasted address becomes a card with the page's title, words and picture (rollemaa-site/link-cards.php reads the page)
// Editor scripts share one global scope, so this one keeps its names in a block
{
  const NAME = 'the-purple-people-eater/link-card';
  // Ahead of core's embed (10), which would take every address
  const PASTE_PRIORITY = 9;
  // Players core embeds better than any card; Reddit's own embed is a script that loads a whole page
  const CARD_OVER_EMBED = [ 'reddit', 'wordpress' ];

  const keepsCoreEmbed = (url) => (wp.blocks.getBlockVariations('core/embed') || [])
    .some((variation) => !CARD_OVER_EMBED.includes(variation.name) && (variation.patterns || []).some((pattern) => pattern.test(url)));

  const host = (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const Card = ({ attributes: { url, title, description, image, site }, loading, blockProps }) => {
    const { createElement: el } = wp.element;

    return el('a', { ...blockProps, href: url, onClick: (event) => event.preventDefault() },
      el('span', { className: 'link-card-text' },
        el('span', { className: 'link-card-site' }, site || host(url)),
        el('span', { className: 'link-card-title' }, loading ? 'Haetaan sivun tietoja…' : title || host(url)),
        description && el('span', { className: 'link-card-desc' }, description)),
      image && el('span', { className: 'link-card-image' }, el('img', { src: image, alt: '' })));
  };

  const Edit = ({ attributes, setAttributes }) => {
    const { createElement: el, Fragment, useEffect, useState } = wp.element;
    const { InspectorControls, MediaUpload, MediaUploadCheck, useBlockProps } = wp.blockEditor;
    const { Button, PanelBody, Placeholder, TextControl, TextareaControl } = wp.components;
    const [ draft, setDraft ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const blockProps = useBlockProps({ className: 'link-card' });

    const load = (url) => {
      setLoading(true);
      wp.apiFetch({ path: wp.url.addQueryArgs('/rollemaa/v1/link-card', { url }) })
        .then((card) => setAttributes(card))
        .catch(() => setAttributes({ url, site: host(url) }))
        .finally(() => setLoading(false));
    };

    // A card pasted or turned from an embed knows only its address
    useEffect(() => {
      if (attributes.url && !attributes.title) {
        load(attributes.url);
      }
    }, [ attributes.url ]);

    if (!attributes.url) {
      return el('div', blockProps,
        el(Placeholder, { icon: 'admin-links', label: 'Linkkikortti', instructions: 'Osoite, josta tehdään kortti otsikolla, kuvauksella ja kuvalla.' },
          el('form', { onSubmit: (event) => {
            event.preventDefault();
            if (wp.url.isURL(draft.trim())) {
              setAttributes({ url: draft.trim() });
            }
          } },
            el(TextControl, { __nextHasNoMarginBottom: true, __next40pxDefaultSize: true, type: 'url', placeholder: 'https://', value: draft, onChange: setDraft }),
            el(Button, { variant: 'primary', type: 'submit' }, 'Tee kortti'))));
    }

    const field = (label, key, Control = TextControl) => el(Control, {
      __nextHasNoMarginBottom: true,
      __next40pxDefaultSize: true,
      label,
      value: attributes[key],
      onChange: (value) => setAttributes({ [key]: value }),
    });

    return el(Fragment, null,
      el(InspectorControls, null,
        el(PanelBody, { title: 'Kortti' },
          field('Osoite', 'url'),
          el(Button, { variant: 'secondary', isBusy: loading, disabled: loading, onClick: () => load(attributes.url) }, 'Hae tiedot uudelleen'),
          field('Otsikko', 'title'),
          field('Kuvaus', 'description', TextareaControl),
          field('Sivusto', 'site'),
          el(MediaUploadCheck, null,
            el(MediaUpload, {
              allowedTypes: [ 'image' ],
              onSelect: (media) => setAttributes({ image: media.sizes?.medium_large?.url || media.url }),
              render: ({ open }) => el(Button, { variant: 'secondary', onClick: open }, attributes.image ? 'Vaihda kuva' : 'Lisää kuva'),
            })),
          attributes.image && el(Button, { variant: 'tertiary', isDestructive: true, onClick: () => setAttributes({ image: '' }) }, 'Poista kuva'))),
      el(Card, { attributes, loading, blockProps }));
  };

  wp.blocks.registerBlockType(NAME, {
    apiVersion: 3,
    title: 'Linkkikortti',
    description: 'Linkki korttina: sivun otsikko, kuvaus ja kuva.',
    category: 'embed',
    icon: 'admin-links',
    keywords: [ 'linkki', 'link', 'kortti', 'esikatselu', 'og' ],
    supports: { html: false, customClassName: false },
    attributes: {
      url: { type: 'string', default: '' },
      title: { type: 'string', default: '' },
      description: { type: 'string', default: '' },
      image: { type: 'string', default: '' },
      site: { type: 'string', default: '' },
    },
    edit: Edit,
    save: () => null,
    transforms: {
      from: [
        {
          type: 'raw',
          priority: PASTE_PRIORITY,
          isMatch: (node) => {
            const text = node.textContent.trim();
            // Core's test: one address, and not a file
            return 'P' === node.nodeName && wp.url.isURL(text) && /^https?:\/\/\S+$/i.test(text)
              && !/\.(?!(html?|php)$)[a-z0-9]+$/i.test(wp.url.getFilename(text) || '') && !keepsCoreEmbed(text);
          },
          transform: (node) => wp.blocks.createBlock(NAME, { url: node.textContent.trim() }),
        },
        { type: 'block', blocks: [ 'core/embed' ], transform: ({ url }) => wp.blocks.createBlock(NAME, { url }) },
      ],
      to: [
        {
          type: 'block',
          blocks: [ 'core/paragraph' ],
          transform: ({ url, title }) => wp.blocks.createBlock('core/paragraph', { content: `<a href="${url}">${(title || url).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>` }),
        },
        { type: 'block', blocks: [ 'core/embed' ], transform: ({ url }) => wp.blocks.createBlock('core/embed', { url }) },
      ],
    },
  });
}
