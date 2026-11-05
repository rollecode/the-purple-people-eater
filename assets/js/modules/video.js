import { $, $$ } from 'theme/lib';

/**
 * Videos wait behind a poster and a play button (rollemaa-site/embeds.php for
 * YouTube). While one is in view it plays muted and looping behind the
 * poster; pressing play loads the real player with sound.
 */
const YOUTUBE = 'https://www.youtube-nocookie.com';
const PLAYING = 1;
// YouTube shows its own title bar for the first seconds of play
const LIVE_DELAY_MS = 2500;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches || navigator.connection?.saveData;

const embedUrl = (video, params) => {
  const query = new URLSearchParams(params);
  if (video.dataset.start) {
    query.set('start', video.dataset.start);
  }

  return `${YOUTUBE}/embed/${video.dataset.video}?${query}`;
};

const startPreview = (video) => {
  if ($('.vid-preview', video)) {
    return;
  }

  const frame = Object.assign(document.createElement('iframe'), {
    className: 'vid-preview',
    src: embedUrl(video, { autoplay: 1, mute: 1, loop: 1, playlist: video.dataset.video, controls: 0, disablekb: 1, iv_load_policy: 3, playsinline: 1, rel: 0, enablejsapi: 1, origin: location.origin }),
    allow: 'autoplay; encrypted-media',
    tabIndex: -1,
  });
  frame.setAttribute('aria-hidden', 'true');
  // Asks the player to report its state, so the poster stays until the video really plays
  frame.addEventListener('load', () => frame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: video.dataset.video, channel: 'widget' }), YOUTUBE));
  video.prepend(frame);
};

const stopPreview = (video) => {
  $('.vid-preview', video)?.remove();
  video.classList.remove('is-live');
};

window.addEventListener('message', ({ origin, source, data }) => {
  if (YOUTUBE !== origin || 'string' !== typeof data) {
    return;
  }

  const frame = $$('.vid-preview').find((preview) => preview.contentWindow === source);
  let message;
  try {
    message = JSON.parse(data);
  } catch (error) {
    return;
  }

  const state = 'onStateChange' === message.event ? message.info : message.info?.playerState;
  if (frame && PLAYING === state) {
    setTimeout(() => frame.isConnected && frame.parentNode.classList.add('is-live'), LIVE_DELAY_MS);
  }
});

const playYouTube = (video) => {
  const frame = Object.assign(document.createElement('iframe'), {
    src: embedUrl(video, { autoplay: 1, rel: 0 }),
    title: $('.vid-title', video)?.textContent || 'YouTube-video',
    allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen',
    allowFullscreen: true,
  });

  video.replaceChildren(frame);
  video.classList.remove('is-live');
  video.classList.add('is-playing');
  frame.focus();
};

// Previews run only while in view, so a page of videos plays one or two at a time
const previews = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => {
  if (target.classList.contains('is-playing')) {
    previews.unobserve(target);
    return;
  }

  const media = $('video', target);
  if (media) {
    isIntersecting ? media.play().catch(() => {}) : media.pause();
    return;
  }

  isIntersecting ? startPreview(target) : stopPreview(target);
}), { threshold: .5 });

$$('.vid[data-video]').forEach((video) => {
  $('.vid-play', video)?.addEventListener('click', () => playYouTube(video), { once: true });
  if (!still) {
    previews.observe(video);
  }
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

  Object.assign(media, { controls: false, muted: true, loop: true, playsInline: true });
  media.replaceWith(wrap);
  wrap.append(media, button);
  button.addEventListener('click', () => {
    button.remove();
    wrap.classList.add('is-playing');
    Object.assign(media, { controls: true, muted: false, loop: false, currentTime: 0 });
    media.play();
  }, { once: true });

  if (!still) {
    previews.observe(wrap);
  }
});
