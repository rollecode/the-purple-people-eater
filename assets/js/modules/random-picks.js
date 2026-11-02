import { $, $$, getJson, textItem } from 'theme/lib';

/**
 * Random finds: one draw on arrival, more on request
 */
const picks = $('[data-picks]');
if (picks) {
  const draw = () => {
    picks.classList.add('is-loading');
    getJson('random')
      .then((posts) => {
        picks.innerHTML = posts.map(textItem).join('');
      })
      .finally(() => picks.classList.remove('is-loading'));
  };

  draw();
  $$('[data-shuffle]').forEach((button) => button.addEventListener('click', draw));
}
