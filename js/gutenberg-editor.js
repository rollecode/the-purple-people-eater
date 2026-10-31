/**
 * Editor settings. Buildless, uses editor globals.
 */

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
