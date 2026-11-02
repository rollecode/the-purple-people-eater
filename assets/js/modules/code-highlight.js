import { ASSETS_URL, $ } from 'theme/lib';

// Code highlighting only where there is code
if ($('.prose pre')) {
  document.head.append(
    Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${ASSETS_URL}css/prism.css` }),
    Object.assign(document.createElement('script'), { src: `${ASSETS_URL}js/prism.js`, async: true })
  );
}
