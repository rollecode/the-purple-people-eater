import { $$, bodyClasses } from 'theme/lib';

/**
 * The header marks the section, not only the exact page: an article
 * belongs to Blogi, a diary day to Lokikirja
 */
const sectionPath = [ 'single-diary', 'post-type-archive-diary' ].some((name) => bodyClasses.contains(name))
  ? '/lokikirja/'
  : [ 'single-post', 'home', 'front-page', 'category', 'tag', 'date' ].some((name) => bodyClasses.contains(name)) && '/';
$$('.nav a').forEach((link) => {
  if (sectionPath && new URL(link.href).pathname === sectionPath) {
    link.setAttribute('aria-current', 'page');
  }
});
