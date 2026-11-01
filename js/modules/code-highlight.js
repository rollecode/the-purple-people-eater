import { THEME_URL, $ } from 'theme/lib';

// Code highlighting only where there is code
if ($('.prose pre')) {
  document.head.append(
    Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${THEME_URL}css/prism.css` }),
    Object.assign(document.createElement('script'), { src: `${THEME_URL}js/prism.js`, async: true })
  );
}
