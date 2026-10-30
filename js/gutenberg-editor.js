/**
 * Block editor extras: custom block styles. Buildless, uses editor globals.
 */

wp.blocks.registerBlockStyle('core/paragraph', {
  name: 'boxed',
  label: 'Laatikko',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'no-bullets',
  label: 'Ilman listamerkkejä',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'todo-list',
  label: 'Todo-lista',
});

wp.blocks.registerBlockStyle('core/list-item', {
  name: 'checked',
  label: 'Tehty tehtävä',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'green-shades',
  label: 'Vihreät tasot',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'red-shades',
  label: 'Punaiset tasot',
});

/**
 * Theme blocks in the editor. Wrappers hold real blocks, so titles, featured
 * images and text stay editable in place; the rest show the site's own
 * markup from the block renderer.
 */
(() => {
  const NS = 'the-purple-people-eater';
  const { registerBlockType } = wp.blocks;
  const { useBlockProps, useInnerBlocksProps, InnerBlocks, RichText } = wp.blockEditor;
  const { createElement: el } = wp.element;
  const { useEntityProp } = wp.coreData;
  const { useSelect } = wp.data;
  const { Disabled } = wp.components;
  const ServerSideRender = wp.serverSideRender;

  const save = () => el(InnerBlocks.Content);

  const wrapper = (tagName, useClassName) => ({
    save,
    edit({ context }) {
      const props = useInnerBlocksProps(useBlockProps({ className: useClassName(context) }));
      return el(tagName, props);
    },
  });

  const useArticleHead = ({ postType = 'post', postId }) => {
    const [ featuredMedia ] = useEntityProp('postType', postType, 'featured_media', postId);
    return featuredMedia ? 'photo-hero' : 'read art-head';
  };

  const usePageHead = () => {
    const ownTitle = useSelect((select) => (select('core/editor')?.getEditedPostContent() || '').includes('<h1'), []);
    return ownTitle ? 'page-hero screen-reader-text' : 'page-hero';
  };

  registerBlockType(`${NS}/site-frame`, wrapper('div', () => 'site'));
  registerBlockType(`${NS}/article`, wrapper('article', ({ postType = 'post' }) => `post type-${postType}`));
  registerBlockType(`${NS}/article-head`, wrapper('header', useArticleHead));
  registerBlockType(`${NS}/page-head`, wrapper('header', usePageHead));

  registerBlockType(`${NS}/excerpt`, {
    save: () => null,
    edit({ context: { postType = 'post', postId } }) {
      const [ excerpt, setExcerpt ] = useEntityProp('postType', postType, 'excerpt', postId);
      return el(RichText, {
        ...useBlockProps(),
        tagName: 'p',
        value: excerpt || '',
        onChange: setExcerpt,
        allowedFormats: [],
        disableLineBreaks: true,
        placeholder: 'Ingressi',
      });
    },
  });

  [
    'site-header', 'site-footer', 'hero-meta', 'hero-credit', 'byline', 'archive-note', 'endmatter', 'comments',
    'diary-note', 'diary-head', 'diary-end', 'hidden-title', 'edit-link', 'loop-404', 'loop-archive',
    'loop-archive-diary', 'loop-front-page', 'loop-index', 'loop-search', 'loop-page-archive', 'loop-page-all',
  ].forEach((name) => {
    registerBlockType(`${NS}/${name}`, {
      save: () => null,
      edit({ context: { postId } }) {
        return el('div', useBlockProps(), el(Disabled, null, el(ServerSideRender, {
          block: `${NS}/${name}`,
          urlQueryArgs: postId ? { post_id: postId } : {},
          EmptyResponsePlaceholder: () => null,
        })));
      },
    });
  });

  wp.hooks.addFilter('editor.postContentBlockTypes', NS, (types) => [ ...types, `${NS}/excerpt` ]);
})();
