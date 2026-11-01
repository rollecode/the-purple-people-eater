import { $, $$, articleId, postIdOf, store, prose, reducedMotion } from 'theme/lib';

/**
 * Long texts remember how far you got. The byline offers to continue,
 * and front page cards show a ribbon on texts left unfinished.
 */
const READ_PREFIX = 'rollemaa:read:';
const RESUME_MIN = 5;
const RESUME_MAX = 95;
const METER_FROM = 2;
const METER_DONE_MS = 2400;
const METER_RESET = 97;

const whenFi = (time) => {
  const date = new Date(time);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const clock = `klo ${date.getHours()}.${String(date.getMinutes()).padStart(2, '0')}`;
  if (date.toDateString() === today.toDateString()) {
    return `tänään ${clock}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `eilen ${clock}`;
  }
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${clock}`;
};

export function markResumable(root) {
  $$('.card', root).forEach((card) => {
    const saved = store.get(`${READ_PREFIX}${postIdOf(card)}`);
    if (!saved || saved.pct < RESUME_MIN || saved.pct > RESUME_MAX || $('.resume-chip', card)) {
      return;
    }
    // The newest article already invites back with its own line
    const image = card.classList.contains('card-lead') ? null : $('.card-img', card);
    if (image) {
      image.insertAdjacentHTML('beforeend', '<span class="ribbon" title="Lukeminen kesken"></span>');
    }
    const link = $('.card-title a', card);
    $('.card-body', card).insertAdjacentHTML('beforeend', `<a class="resume-chip" href="${link.href}#jatka">Jatka siitä, mihin jäit (${saved.pct} % luettu)</a>`);
  });
}

markResumable(document);

if (prose && articleId) {
  const key = `${READ_PREFIX}${articleId}`;

  // How far the reader is, in a corner; pressing it goes back to the top
  const meter = document.createElement('button');
  meter.type = 'button';
  meter.className = 'read-meter';
  meter.hidden = true;
  meter.innerHTML = '<span class="ripples" aria-hidden="true"><i></i><i></i><i></i></span><svg class="ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19"/><circle class="done" cx="22" cy="22" r="19" pathLength="100"/></svg><span class="pct" aria-hidden="true"></span><svg class="check" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" pathLength="1"/></svg>';
  document.body.append(meter);
  meter.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    const main = $('#content');
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  });

  const headings = $$('h2, h3', prose);
  const progress = () => {
    const rect = prose.getBoundingClientRect();
    const read = (window.innerHeight - rect.top) / rect.height;
    return Math.max(0, Math.min(1, read));
  };

  // Offer to continue from where the last visit ended
  const saved = store.get(key);
  const resume = $('[data-resume]');
  const jumpTo = (pct) => {
    const top = prose.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + prose.offsetHeight * (pct / 100) - window.innerHeight * .8 });
  };

  if (saved && resume && saved.pct >= RESUME_MIN && saved.pct <= RESUME_MAX) {
    const heading = saved.heading.replace(/[<>&]/g, '');
    const place = heading ? ` ja pääsit kohtaan <i>${heading}</i>` : '';
    const stop = /[.?!]$/.test(heading) ? '' : '.';
    $('[data-resume-text]', resume).innerHTML = `Luit tätä viimeksi ${whenFi(saved.at)}${place}${stop}`;
    $('[data-resume-pct]', resume).textContent = saved.pct;
    $('.resume-bar i', resume).style.width = `${saved.pct}%`;
    resume.hidden = false;

    $$('[data-resume-go]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      jumpTo(saved.pct);
    }));
    if ('#jatka' === window.location.hash) {
      jumpTo(saved.pct);
    }
  }

  let ticking = false;
  let lastSave = 0;
  window.addEventListener('scroll', () => {
    if (ticking) {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const value = progress();
      const pct = Math.round(value * 100);
      const footer = $('.site-foot');

      // Back up the text after finishing: the meter returns
      if (pct < METER_RESET) {
        clearTimeout(meter.doneTimer);
        meter.classList.remove('is-done', 'is-gone');
      }

      const finished = meter.classList.contains('is-done');
      meter.hidden = meter.classList.contains('is-gone') || pct < METER_FROM || (footer && footer.getBoundingClientRect().top < window.innerHeight);

      // The end: a tick, a ripple, and the meter bows out
      if (pct >= 100 && !finished) {
        meter.classList.add('is-done');
        meter.setAttribute('aria-label', 'Luettu loppuun, takaisin alkuun');
        meter.doneTimer = setTimeout(() => {
          meter.classList.add('is-gone');
          meter.hidden = true;
        }, METER_DONE_MS);
      }

      if (!finished && pct < 100) {
        meter.style.setProperty('--progress', pct);
        $('.pct', meter).textContent = `${pct} %`;
        meter.setAttribute('aria-label', `Luettu ${pct} %, takaisin alkuun`);
      }

      const now = Date.now();
      if (now - lastSave < 1000) {
        return;
      }
      lastSave = now;
      const passed = headings.filter((heading) => heading.getBoundingClientRect().top < window.innerHeight * .3).pop();
      store.set(key, { pct: Math.round(value * 100), heading: passed ? passed.textContent.trim() : '', at: now });
    });
  }, { passive: true });
}
