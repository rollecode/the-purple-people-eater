// YouTube embeds look as on the site (rollemaa-site/embeds.php, js/modules/video.js): poster, title, play mark, muted preview
const YOUTUBE_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([\w-]{11})/;
const LIVE_DELAY_MS = 2500;

const startSeconds = (url) => {
  const time = (url.match(/[?&#](?:t|start)=([\dhms]+)/) || [])[1] || '';
  if (/^\d+$/.test(time)) {
    return Number(time);
  }
  const [ , h = 0, m = 0, s = 0 ] = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/) || [];
  return 3600 * h + 60 * m + Number(s);
};

const Facade = ({ id, start, title }) => {
  const { createElement: el, useState } = wp.element;
  const [ live, setLive ] = useState(false);
  // rollemaa-site/embeds.php wraps the player in a page of the site, since this canvas sends YouTube no referrer
  const params = new URLSearchParams({ 'video-preview': id });
  if (start) {
    params.set('start', start);
  }

  return el('span', { className: `vid${live ? ' is-live' : ''}` },
    el('iframe', {
      className: 'vid-preview',
      src: `${location.origin}/?${params}`,
      allow: 'autoplay; encrypted-media',
      tabIndex: -1,
      'aria-hidden': true,
      onLoad: () => setTimeout(() => setLive(true), LIVE_DELAY_MS),
    }),
    el('img', { className: 'vid-poster', src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: '' }),
    title && el('span', { className: 'vid-title' }, title),
    el('span', { className: 'vid-play' }, el('svg', { viewBox: '0 0 24 24' }, el('path', { d: 'M8 5.2v13.6L19 12z' }))));
};

const withVideoFacade = wp.compose.createHigherOrderComponent((BlockEdit) => (props) => {
  const { createElement: el, Fragment, createPortal, useEffect, useState } = wp.element;
  const url = 'core/embed' === props.name ? props.attributes.url || '' : '';
  const id = (url.match(YOUTUBE_ID) || [])[1];
  const preview = wp.data.useSelect((select) => (id ? select('core').getEmbedPreview(url) : null), [ id, url ]);
  const [ wrapper, setWrapper ] = useState(null);

  // The preview's wrapper lives in the editor canvas, drawn by the embed block itself
  useEffect(() => {
    if (!id || wrapper?.isConnected) {
      return;
    }
    const canvas = document.querySelector('iframe[name="editor-canvas"]')?.contentDocument || document;
    const found = canvas.getElementById(`block-${props.clientId}`)?.querySelector('.wp-block-embed__wrapper');
    if (found) {
      setWrapper(found);
    }
  });

  if (!id || !wrapper?.isConnected) {
    return el(BlockEdit, props);
  }

  return el(Fragment, null,
    el(BlockEdit, props),
    createPortal(el(Facade, { id, start: startSeconds(url), title: preview?.title }), wrapper));
}, 'withVideoFacade');

wp.hooks.addFilter('editor.BlockEdit', 'the-purple-people-eater/video-embed', withVideoFacade);
