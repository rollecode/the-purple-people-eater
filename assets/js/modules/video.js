import { $, $$ } from 'theme/lib';

/**
 * Videos wait behind a poster and a play button (rollemaa-site/video.php for
 * YouTube); pressing it loads the player and starts it.
 */
const playYouTube = (video) => {
  const params = new URLSearchParams({ autoplay: 1, rel: 0 });
  if (video.dataset.start) {
    params.set('start', video.dataset.start);
  }

  const frame = Object.assign(document.createElement('iframe'), {
    src: `https://www.youtube-nocookie.com/embed/${video.dataset.video}?${params}`,
    title: $('.vid-title', video)?.textContent || 'YouTube-video',
    allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
    allowFullscreen: true,
  });

  video.replaceChildren(frame);
  video.classList.add('is-playing');
  frame.focus();
};

$$('.vid[data-video]').forEach((video) => {
  $('.vid-play', video)?.addEventListener('click', () => playYouTube(video), { once: true });
});

// Videos of this site's own: the same button over the poster, the player's controls once it plays
$$('.prose video[controls][poster]').forEach((media) => {
  const wrap = Object.assign(document.createElement('span'), { className: 'vid is-native' });
  const button = Object.assign(document.createElement('button'), {
    className: 'vid-play',
    type: 'button',
    ariaLabel: 'Toista video',
    innerHTML: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
  });

  media.controls = false;
  media.replaceWith(wrap);
  wrap.append(media, button);
  button.addEventListener('click', () => {
    button.remove();
    wrap.classList.add('is-playing');
    media.controls = true;
    media.play();
  }, { once: true });
});
