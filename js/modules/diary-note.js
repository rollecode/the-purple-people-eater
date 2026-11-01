import { $, store } from 'theme/lib';

/**
 * Diary entry: the note about the diary until it is closed once
 */
const explainer = $('[data-explainer]');
if (explainer && !store.raw('rollemaa:explainer-closed')) {
  explainer.hidden = false;
  $('[data-dismiss-explainer]', explainer).addEventListener('click', () => {
    explainer.hidden = true;
    store.raw('rollemaa:explainer-closed', '1');
  });
}
