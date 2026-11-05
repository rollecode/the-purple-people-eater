// The hero photo's credit as on the site (rollemaa-site/site.php): the featured image's caption
const withPhotoCredit = wp.compose.createHigherOrderComponent((BlockEdit) => (props) => {
  const { createElement: el, Fragment } = wp.element;
  const isHero = 'core/post-featured-image' === props.name && undefined === props.context?.queryId;

  const credit = wp.data.useSelect((select) => {
    if (!isHero || 'post' !== select('core/editor').getCurrentPostType()) {
      return '';
    }
    const id = select('core/editor').getEditedPostAttribute('featured_media');
    const caption = id ? select('core').getMedia(id)?.caption : null;
    return (caption?.raw ?? caption?.rendered ?? '').replace(/<[^>]*>/g, '').trim();
  }, [ isHero ]);

  if (!credit) {
    return el(BlockEdit, props);
  }

  return el(Fragment, null,
    el(BlockEdit, props),
    el('span', { className: 'credit' }, el('span', { className: 'credit-label' }, 'Kuva'), ` ${credit}`));
}, 'withPhotoCredit');

wp.hooks.addFilter('editor.BlockEdit', 'the-purple-people-eater/photo-credit', withPhotoCredit);
