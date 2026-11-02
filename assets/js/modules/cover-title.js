import { $ } from 'theme/lib';

// A subtitle after the dash sets in italics
const coverTitle = $('.cover-title');
if (coverTitle) {
  const [ main, subtitle, extra ] = coverTitle.innerHTML.split(' – ');
  if (subtitle && !extra) {
    coverTitle.innerHTML = `${main} – <em>${subtitle}</em>`;
  }
}
