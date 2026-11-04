<?php
/**
 * Title: Vieraskirja
 * Slug: the-purple-people-eater/guestbook
 * Inserter: no
 *
 * The book and its form; js/modules/guestbook.js fills the pages.
 *
 * @package the-purple-people-eater
 */

?>
<!-- wp:html -->
<section class="guestbook" data-guestbook>
  <div class="gb-book">
    <div class="gb-spread" data-gb-spread aria-live="polite" aria-busy="true"><div class="gb-page gb-skeleton" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="gb-page gb-skeleton" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>
  </div>

  <form class="gb-page gb-write" data-gb-form novalidate hidden>
    <p class="gb-date" data-gb-today></p>

    <div class="gb-part" data-gb-part="picture" data-hint="piirrä kuva tähän">
      <p class="gb-modes" role="group" aria-label="Terveiset"><span>Lähetän terveiset</span><button type="button" data-gb-mode="type" aria-pressed="true">näppäimillä</button><button type="button" data-gb-mode="draw" aria-pressed="false">piirtämällä</button><button class="gb-clear" type="button" data-gb-clear>pyyhi kuva</button></p>
      <label class="screen-reader-text" for="gb-message">Terveiset</label>
      <textarea class="gb-ink gb-message" id="gb-message" name="message" maxlength="300" rows="2" placeholder="Kirjoita terveisesi tähän…"></textarea>
      <canvas class="gb-pad" width="600" height="360" tabindex="0" role="img" aria-label="Kuva, piirrä hiirellä tai sormella"></canvas>
    </div>

    <div class="gb-part" data-gb-part="signature" data-hint="piirrä nimikirjoituksesi tähän">
      <p class="gb-modes" role="group" aria-label="Nimmari"><span>Nimmaroin</span><button type="button" data-gb-mode="type" aria-pressed="true">näppäimillä</button><button type="button" data-gb-mode="draw" aria-pressed="false">piirtämällä</button><button class="gb-clear" type="button" data-gb-clear>pyyhi nimikirjoitus</button></p>
      <canvas class="gb-pad" width="600" height="360" tabindex="0" role="img" aria-label="Nimikirjoitus, piirrä hiirellä tai sormella"></canvas>
      <p class="gb-signed"><label class="screen-reader-text" for="gb-name">Nimi</label><input class="gb-ink gb-name" id="gb-name" name="name" maxlength="40" required autocomplete="nickname" placeholder="nimesi"></p>
    </div>

    <label class="gb-trap" aria-hidden="true"><span>Kotisivu</span><input name="website" tabindex="-1" autocomplete="off"></label>
    <p class="gb-actions"><button class="gb-submit" type="submit">Lähetä terveisesi</button></p>
    <p class="gb-status" data-gb-status role="status"></p>
    <p class="gb-closed">Merkintäsi on kirjassa. Kiitos käynnistä!</p>
  </form>
</section>
<!-- /wp:html -->
