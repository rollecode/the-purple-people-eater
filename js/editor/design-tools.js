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
