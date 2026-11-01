/**
 * Editor settings. Buildless, uses editor globals.
 */

// Core offers wide and full only in a constrained layout, which would also restyle the column
const POST_CONTENT_LAYOUT = { alignments: [ 'left', 'center', 'right', 'wide', 'full' ] };
wp.hooks.addFilter('blockEditor.useSetting.before', 'the-purple-people-eater', (value, path, clientId, blockName) => ('layout' === path && 'core/post-content' === blockName ? POST_CONTENT_LAYOUT : value));

// Core leaves these out block by block. Only blocks that save their own markup, so the choices stay in the post
const ALIGNABLE_BLOCKS = [ 'core/code', 'core/list', 'core/preformatted', 'core/verse' ];
const OPEN_DESIGN_BLOCKS = [ ...ALIGNABLE_BLOCKS, 'core/audio', 'core/button', 'core/buttons', 'core/column', 'core/columns', 'core/cover', 'core/details', 'core/embed', 'core/file', 'core/gallery', 'core/group', 'core/heading', 'core/image', 'core/list-item', 'core/media-text', 'core/paragraph', 'core/pullquote', 'core/quote', 'core/separator', 'core/spacer', 'core/table', 'core/video' ];

wp.hooks.addFilter('blocks.registerBlockType', 'the-purple-people-eater', (settings, name) => {
  if (!OPEN_DESIGN_BLOCKS.includes(name)) {
    return settings;
  }

  const { supports = {} } = settings;

  return {
    ...settings,
    supports: {
      ...supports,
      align: ALIGNABLE_BLOCKS.includes(name) ? [ 'left', 'center', 'right', 'wide', 'full' ] : supports.align,
      color: { ...supports.color, background: true, text: true, gradients: true, link: true },
      shadow: true,
      spacing: { ...supports.spacing, margin: true, padding: true },
      __experimentalBorder: { ...supports.__experimentalBorder, color: true, radius: true, style: true, width: true },
    },
  };
});

// The excerpt sits in the template, but it is the text's own and stays editable
wp.hooks.addFilter('editor.postContentBlockTypes', 'the-purple-people-eater', (types) => [ ...types, 'core/post-excerpt' ]);

// Finnish language packs translate this key, and an unknown value empties the excerpt and miscounts words
wp.hooks.addFilter('i18n.gettext_with_context', 'the-purple-people-eater', (translation, text, context) => ('Word count type. Do not translate!' === context ? 'words' : translation));

// Short units as on the site (rollemaa-site mu-plugin, ngettext)
wp.hooks.addFilter('i18n.ngettext', 'the-purple-people-eater', (translation, single, plural, number) => {
  if ('%s minute' === single) {
    return '%s min';
  }

  // The number goes in already formatted: as fi_number() in PHP, no separator under five digits
  if ('%s word' === single) {
    const count = Number(number);
    const formatted = count < 10000 ? String(count) : count.toLocaleString('fi-FI');

    return 1 === count ? `${formatted} sana` : `${formatted} sanaa`;
  }

  return translation;
});

/**
 * Make the editor's styles resolve as on the site. The editor prints global styles after the
 * theme stylesheet, the site the other way round. It also reads the theme's empty blockGap as
 * gap support and adds 24px gaps the site never gets (PHP checks isset, JS checks !== null).
 */
const isThemeSheet = (style) => 'theme' === style.__unstableType && !style.isGlobalStyles;
const EDITOR_ONLY_GAPS = /:root :where\((?:\.wp-site-blocks|\.is-layout-flow|\.is-layout-constrained)\) > [^{]*\{[^}]*\}|--wp--style--block-gap:[^;}]*;?/g;
const ROOT_GAP = /:root :where\(\.is-layout-(flex|grid)\) \{ gap: [^;]*; \}/g;

const siteGaps = (style) => {
  if (!style.isGlobalStyles || !style.css) {
    return style;
  }

  const css = style.css.replace(EDITOR_ONLY_GAPS, '').replace(ROOT_GAP, ':where(.is-layout-$1){gap: 0.5em;}');

  return css === style.css ? style : { ...style, css };
};

wp.data.subscribe(() => {
  const styles = wp.data.select('core/editor').getEditorSettings().styles ?? [];
  const site = styles.map(siteGaps);
  const ordered = [ ...site.filter((style) => !isThemeSheet(style)), ...site.filter(isThemeSheet) ];

  if (ordered.some((style, index) => style !== styles[index])) {
    wp.data.dispatch('core/editor').updateEditorSettings({ styles: ordered });
  }
});

// AI summary (rollemaa-site summary.php): edit by hand, or have Claude write it on the server
wp.plugins.registerPlugin('rollemaa-summary', {
  render: () => {
    const { createElement: el, useState } = wp.element;
    const { useSelect, useDispatch } = wp.data;
    const { TextareaControl, Button, Notice } = wp.components;
    const { postId, postType, summary } = useSelect((select) => {
      const editor = select('core/editor');

      return {
        postId: editor.getCurrentPostId(),
        postType: editor.getCurrentPostType(),
        summary: editor.getEditedPostAttribute('meta')?.rollemaa_summary ?? '',
      };
    }, []);
    const { editPost } = useDispatch('core/editor');
    const [ busy, setBusy ] = useState(false);
    const [ error, setError ] = useState('');

    if ('post' !== postType) {
      return null;
    }

    const write = () => {
      setBusy(true);
      setError('');
      wp.apiFetch({ path: `/rollemaa/v1/summary/${postId}`, method: 'POST' })
        .then((response) => editPost({ meta: { rollemaa_summary: response.summary } }))
        .catch((failure) => setError(failure.message))
        .finally(() => setBusy(false));
    };

    return el(wp.editor.PluginDocumentSettingPanel, { name: 'rollemaa-summary', title: 'Tekoälyn tiivistelmä' },
      el(TextareaControl, {
        label: 'Tiivistelmä',
        hideLabelFromVision: true,
        value: summary,
        rows: 6,
        onChange: (value) => editPost({ meta: { rollemaa_summary: value } }),
        help: 'Näkyy artikkelin alussa suljettuna laatikkona. Tyhjä piilottaa sen.',
      }),
      error && el(Notice, { status: 'error', isDismissible: false }, error),
      el(Button, { variant: 'secondary', isBusy: busy, disabled: busy, onClick: write }, summary ? 'Kirjoita uudelleen tekoälyllä' : 'Kirjoita tekoälyllä'));
  },
});
