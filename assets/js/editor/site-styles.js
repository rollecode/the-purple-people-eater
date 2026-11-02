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
