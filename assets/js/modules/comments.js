import { $, $$, permalink, getJson, escapeHtml, icon, responsesFor, fiAgo } from 'theme/lib';

/**
 * Comments: Rolle's own, handles and where each came from, long ones folded
 */
const OWN_PROFILES = [ 'https://mementomori.social/@rolle', 'https://bsky.app/profile/rolle.social', 'https://www.threads.com/@rolle_' ];
const COMMENT_CLAMP_CHARS = 900;
const RELATIVE_FOR_MS = 7 * 86400000;
const NETWORKS = {
  fediverse: { icon: 'masto', from: 'fediversumi', at: 'fediversumissa' },
  bluesky: { icon: 'bluesky', from: 'Bluesky', at: 'Blueskyssä' },
  threads: { icon: 'threads', from: 'Threads', at: 'Threadsissa' },
  web: { icon: 'link', from: 'verkosta', at: 'verkossa' },
};

const commentHandle = (url, network) => {
  if (network === 'bluesky') {
    return (url.match(/bsky\.app\/profile\/([^/?]+)/) || [])[1];
  }
  if (network === 'threads') {
    return (url.match(/threads\.(?:com|net)\/@([^/?]+)/) || [])[1];
  }
  if (network === 'web') {
    return '';
  }
  const fedi = url.match(/^https?:\/\/([^/]+)\/@([^/?]+)/);
  return fedi ? `${fedi[2]}@${fedi[1]}` : '';
};

const decorateComments = () => $$('.comment-list .cmt').forEach((comment, index) => {
  const item = comment.closest('li');
  const link = $('.name a', comment);
  const url = link ? link.href.replace(/\/$/, '') : '';
  const body = $('.cmt-body', comment);
  const network = [ 'bluesky', 'threads', 'fediverse', 'web' ].find((name) => item.classList.contains(`from-${name}`))
    || (/^https?:\/\/[^/]+\/@[^/?]+/.test(url) ? 'fediverse' : '');
  const handle = network ? commentHandle(url, network) : '';

  if (OWN_PROFILES.includes(url) || comment.closest('.bypostauthor')) {
    comment.classList.add('is-author');
    $('.name', comment).insertAdjacentHTML('beforeend', '<span class="role">Kirjoittaja</span>');
  } else if (handle) {
    $('.name', comment).insertAdjacentHTML('beforeend', `<a class="handle" href="${escapeHtml(url)}">@${escapeHtml(handle)}</a>`);
  }

  // The past week reads as "kaksi tuntia sitten"; the exact time stays on hover
  const time = $('.when time', comment);
  const then = time ? Date.parse(time.dateTime) : NaN;
  if (Date.now() - then < RELATIVE_FOR_MS) {
    const label = time.firstElementChild || time;
    time.title = label.textContent;
    label.textContent = fiAgo(then / 1000);
  }

  if (network) {
    const { icon: name, from, at } = NETWORKS[network];
    let label = from;
    if (item.classList.contains('is-quote')) {
      label = `lainasi ${at}`;
    } else if (item.classList.contains('is-share')) {
      label = `jakoi ${at}`;
    } else if (item.classList.contains('is-mention')) {
      label = `linkitti ${at}`;
    }
    $('.when', comment).insertAdjacentHTML('beforeend', `<span class="via">${icon(name)}${label}</span>`);
  }

  if (body.textContent.length > COMMENT_CLAMP_CHARS) {
    body.id = `comment-body-${index}`;
    body.classList.add('is-clamped');
    body.insertAdjacentHTML('afterend', `<button class="expand" type="button" aria-expanded="false" aria-controls="${body.id}" data-expand><span class="screen-reader-text">Näytä koko kommentti</span>${icon('chev')}</button>`);
  }
});

decorateComments();

// Cached pages can be a day old; the list is fetched fresh when it comes near
const commentsSection = $('#comments');
if (responsesFor && commentsSection) {
  new IntersectionObserver(([ entry ], observer) => {
    if (!entry.isIntersecting) {
      return;
    }

    observer.disconnect();
    getJson(`comments/${responsesFor}`).then(({ html }) => {
      const list = $('.wp-block-comments', commentsSection);

      if (list) {
        list.outerHTML = html;
      } else {
        $('.comments-empty', commentsSection).insertAdjacentHTML('beforebegin', html);
      }

      decorateComments();
    });
  }, { rootMargin: '600px' }).observe(commentsSection);
}

$$('[data-permalink]').forEach((field) => {
  field.value = permalink;
});

const heading = $('.wp-block-post-title');
$$('[data-share]').forEach((link) => {
  link.href = `https://share.joinmastodon.org/#text=${encodeURIComponent(`${heading.textContent} ${permalink}`)}`;
});
