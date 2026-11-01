import { THEME_URL, $, config, store } from 'theme/lib';

/**
 * Own ad, with permanent dismiss. Dude's brand: the aurora and the
 * crawling grain from dude.fi, the logo in the middle.
 */
const DUDE_AD_ENABLED = false;
const DUDE_URL = 'https://www.dude.fi/yhteystiedot';
const DUDE_LOGO = '<svg class="ownad-logo" aria-hidden="true" viewBox="0 0 2267.72 453.54"><path d="M950.26 211.64c0 37.66-12.7 111.12-97.79 111.12-85.61 0-98.4-73.47-98.4-111.12V5.23H590.91v217.92c0 138.73 97.78 221.55 261.55 221.55 163.39 0 260.93-82.82 260.93-221.55V5.23H950.26v206.41zM2264.41 127.17V5.23h-505.2v439.48h505.2V322.76h-345.08v-48.71h286.91v-98.17h-286.91v-48.71zM317.21 5.23H3v439.48h314.21c108.81 0 219.87-87.76 219.87-219.74 0-132.83-111.06-219.74-219.87-219.74zm-39.84 317.53H166.14v-195.4h111.23c57.58 0 97.7 45.79 97.7 97.61 0 52.51-40.12 97.79-97.7 97.79zM1485.51 5.23H1171.3v439.48h314.21c108.81 0 219.87-87.76 219.87-219.74 0-132.83-111.06-219.74-219.87-219.74zm-39.84 317.53h-111.23v-195.4h111.23c57.58 0 97.7 45.79 97.7 97.61 0 52.51-40.12 97.79-97.7 97.79z"/></svg>';
const adContent = `
  <a href="${DUDE_URL}" class="global-link" aria-hidden="true" tabindex="-1"></a>
  <p class="ownad-note">Sori häiriö, tämä on härski oman firmani mainos. Teksti jatkuu alla.</p>
  ${DUDE_LOGO}
  <p class="ownad-title">Tarvitsetko laadukkaat ja helposti päivitettävät verkkosivut?</p>
  <p class="ownad-text">Teemme kotimaisia WordPress-sivustoja, jotka latautuvat supernopeasti ja ovat helposti päivitettäviä ja naurettavan hyvännäköisiä.</p>
  <ul class="ownad-facts">
    <li>Vuodesta 2013</li>
    <li>Satoja asiakkaita</li>
    <li>Ylläpito ja tuki</li>
  </ul>
  <a class="ownad-cta" href="${DUDE_URL}">Tutustu ja ota yhteyttä <svg class="ic" aria-hidden="true"><use href="${config.sprite}#arrow"></use></svg></a>
  <button class="hide-forever-ad" type="button"><svg class="ic" aria-hidden="true"><use href="${config.sprite}#close"></use></svg>Ei kiinnosta, piilota mainos pysyvästi</button>`;

if (DUDE_AD_ENABLED && store.raw('hide_dude_ad') !== '1') {
  const spawnAd = (referenceElement) => {
    const ownAd = document.createElement('aside');
    ownAd.innerHTML = adContent;
    ownAd.classList.add('ownad-unblockable');
    ownAd.setAttribute('aria-label', 'Mainos: Digitoimisto Dude');
    document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: `${THEME_URL}css/ads.css` }));
    referenceElement.after(ownAd);
  };

  const articleProse = $('.single-post .prose');
  if (articleProse && articleProse.children.length) {
    spawnAd(articleProse.children[Math.floor(articleProse.children.length / 3)]);
  }
}



document.addEventListener('click', (event) => {
  if (!DUDE_AD_ENABLED || !event.target.closest('.hide-forever-ad')) {
    return;
  }
  const ownAd = $('.ownad-unblockable');
  ownAd.classList.add('closing');
  window.setTimeout(() => ownAd.classList.add('dismissed'), 400);
  store.raw('hide_dude_ad', '1');
});
