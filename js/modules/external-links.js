import { $, $$, config } from 'theme/lib';

/**
 * Screen readers hear that a link leaves the site
 */
const localHosts = [ window.location.host ].concat(config.localDomains || []);
$$('.prose a[href^="http"], .keywords a[href^="http"]').forEach((link) => {
  let host;
  try {
    host = new URL(link.href).host;
  } catch (error) {
    return;
  }
  if (localHosts.includes(host) || link.getAttribute('aria-label') || !link.textContent.trim()) {
    return;
  }
  link.setAttribute('aria-label', `${link.textContent.trim()}: ulkoinen sivusto`);
});

// Mastodon embed script, only when the page actually has an embed
if ($('iframe[src*="mementomori.social"]')) {
  const tag = document.createElement('script');
  tag.src = 'https://mementomori.social/embed.js';
  document.head.appendChild(tag);
}
