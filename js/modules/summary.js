import { $, icon } from 'theme/lib';

// A long summary fades out until asked for
const SUMMARY_FOLD_PX = 190;
const summaryBody = $('.ai-summary > ul') || $('.ai-summary > p');
if (summaryBody && summaryBody.scrollHeight > SUMMARY_FOLD_PX) {
  summaryBody.id = 'summary-body';
  summaryBody.classList.add('is-clamped');
  summaryBody.insertAdjacentHTML('afterend', `<button class="expand" type="button" aria-expanded="false" aria-controls="summary-body" data-expand data-more="Näytä koko tiivistelmä" data-less="Näytä vähemmän"><span class="screen-reader-text">Näytä koko tiivistelmä</span>${icon('chev')}</button>`);
}
