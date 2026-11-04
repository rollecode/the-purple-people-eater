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
    <div class="gb-spread" data-gb-spread aria-live="polite"></div>
    <nav class="gb-turn" aria-label="Vieraskirjan sivut">
      <button class="btn btn-ghost" type="button" data-gb-prev disabled aria-label="Edellinen aukeama">Edellinen</button>
      <span class="meta-text" data-gb-pos></span>
      <button class="btn btn-ghost" type="button" data-gb-next disabled aria-label="Seuraava aukeama">Seuraava</button>
    </nav>
  </div>

  <form class="gb-page gb-write" data-gb-form novalidate hidden>
    <p class="gb-date" data-gb-today></p>
    <label class="screen-reader-text" for="gb-message">Terveiset</label>
    <textarea class="gb-ink gb-message" id="gb-message" name="message" maxlength="300" rows="5" placeholder="Kirjoita terveisesi tähän…"></textarea>
    <canvas class="gb-pad" width="600" height="200" data-gb-pad role="img" aria-label="Nimikirjoitus, piirrä hiirellä tai sormella"></canvas>
    <p class="gb-signed"><span aria-hidden="true">–</span><label class="screen-reader-text" for="gb-name">Nimi</label><input class="gb-ink gb-name" id="gb-name" name="name" maxlength="40" required autocomplete="nickname" placeholder="nimesi"></p>
    <label class="gb-trap" aria-hidden="true"><span>Kotisivu</span><input name="website" tabindex="-1" autocomplete="off"></label>
    <p class="gb-actions"><button class="gb-pencil" type="button" data-gb-clear>pyyhi nimikirjoitus</button><button class="gb-submit" type="submit">Kirjoita kirjaan</button></p>
    <p class="gb-status" data-gb-status role="status"></p>
  </form>
</section>
<!-- /wp:html -->
