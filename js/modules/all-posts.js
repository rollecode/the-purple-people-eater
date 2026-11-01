import { $, $$, getJson, escapeHtml } from 'theme/lib';

/**
 * All posts page. PHP's newest-first order does not survive JSON's numeric keys.
 */
const allPosts = $('[data-all-posts]');
if (allPosts) {
  const monthName = (month) => {
    const name = new Date(2000, month - 1).toLocaleString('fi', { month: 'long' });
    return name[0].toUpperCase() + name.slice(1);
  };
  const newestFirst = (object) => Object.entries(object).sort(([ a ], [ b ]) => b - a);

  getJson('all-posts').then((data) => {
    const years = newestFirst(data);
    const rail = years.map(([ year, months ]) => `<li><a href="#year-${year}">${year} <span class="meta-text">${Object.values(months).flat().length}</span></a></li>`).join('');
    const body = years.map(([ year, months ]) => `<section class="all-year" id="year-${year}" aria-labelledby="year-title-${year}"><h2 class="all-year-title" id="year-title-${year}">${year}</h2>${newestFirst(months).map(([ month, items ]) => `<h3 class="all-month">${monthName(month)}</h3><ul class="all-list">${items.map(({ day, date, link, title }) => `<li><time class="meta-text" datetime="${date}">${day}</time><a href="${escapeHtml(link)}">${escapeHtml(title)}</a></li>`).join('')}</ul>`).join('')}</section>`).join('');

    allPosts.innerHTML = `<nav class="all-years" aria-label="Vuodet"><ol>${rail}</ol></nav><div class="all-body">${body}</div>`;
    watchYears();
  });
}


/**
 * All posts page: the year rail marks the year in view
 */
function watchYears() {
  const yearLinks = $$('.all-years a');
  const yearObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
      yearLinks.forEach((link) => {
        const current = link.hash === `#${entry.target.id}`;
        link.toggleAttribute('aria-current', current);
        if (current) {
          link.setAttribute('aria-current', 'true');
          link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      });
    });
  }, { rootMargin: '-12% 0px -80% 0px' });
  $$('.all-year').forEach((year) => yearObserver.observe(year));
}
