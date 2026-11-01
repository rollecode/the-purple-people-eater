import { config, articleId } from 'theme/lib';

/**
 * Most read posts counter, one count per post per hour per tab
 */
if (articleId) {
  const key = `mostread_${articleId}`;
  const now = Date.now();
  if (now - Number(sessionStorage.getItem(key)) > 3600000) {
    sessionStorage.setItem(key, now);
    fetch(`${config.rest}read/${articleId}`, { method: 'POST', keepalive: true });
  }
}
