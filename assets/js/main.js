/**
 * Front-end entry, vanilla and buildless. Every feature is a module in
 * js/modules. What every page needs loads here, the rest only when its markup
 * is on the page. What the templates cannot know comes from the rollemaa/v1
 * REST routes of the rollemaa-site mu-plugin.
 */

import 'theme/theme-switch';
import 'theme/expand';
import 'theme/nav-current';
import 'theme/logo-rain';
import 'theme/phone-menu';
import 'theme/site-head';
import 'theme/search';

// theme/own-ad is off for now: add it with '.single-post .prose' and set DUDE_AD_ENABLED
const MODULES = {
  'theme/all-posts': '[data-all-posts]',
  'theme/archive-lists': '[data-tagbars], [data-ranked]',
  'theme/code-highlight': '.prose .wp-block-code',
  'theme/comments': '#comments, .comment-list, [data-permalink], [data-share]',
  'theme/copy-link': '[data-copy]',
  'theme/cover-title': '.cover-title',
  'theme/diary-days': '[data-day], [data-heatmap], [data-year-ago]',
  'theme/diary-note': '[data-explainer]',
  'theme/external-links': '.prose a[href^="http"], .keywords a[href^="http"], iframe[src*="mementomori.social"]',
  'theme/guestbook': '[data-guestbook]',
  'theme/listings': '.row, .card',
  'theme/load-more': '.loadmore',
  'theme/lost-images': '.prose img',
  'theme/now-panel': '[data-most-read], [data-now]',
  'theme/presence': '.single-post',
  'theme/rain-scene': '[data-rain]',
  'theme/random-picks': '[data-picks]',
  'theme/read-count': '.single-post',
  'theme/reading': '.card, .single-post',
  'theme/responses': '.single-post, .single-diary',
  'theme/side-notes': '.single-post',
  'theme/summary': '.ai-summary',
  'theme/video': '.vid, .prose video[controls][poster]',
  'theme/word-explanations': 'dfn.gloss',
  'theme/year-shelf': '[data-stat], [data-shelf], [data-years]',
};

Object.entries(MODULES).forEach(([ id, selector ]) => {
  if (document.querySelector(selector)) {
    import(id);
  }
});
