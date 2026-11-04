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
      <button class="btn btn-ghost" type="button" data-gb-prev disabled>Edellinen aukeama</button>
      <span class="meta-text" data-gb-pos></span>
      <button class="btn btn-ghost" type="button" data-gb-next disabled>Seuraava aukeama</button>
    </nav>
  </div>

  <form class="gb-form" data-gb-form novalidate>
    <h2>Kirjoita vieraskirjaan</h2>
    <label class="gb-field"><span>Nimi</span><input name="name" maxlength="40" required autocomplete="nickname"></label>
    <label class="gb-field"><span>Terveiset</span><textarea name="message" maxlength="300" rows="4"></textarea></label>
    <div class="gb-field">
      <span id="gb-pad-label">Nimikirjoitus</span>
      <canvas class="gb-pad" width="600" height="200" data-gb-pad role="img" aria-labelledby="gb-pad-label"></canvas>
      <button class="textlink" type="button" data-gb-clear>Pyyhi nimikirjoitus</button>
    </div>
    <label class="gb-trap" aria-hidden="true"><span>Kotisivu</span><input name="website" tabindex="-1" autocomplete="off"></label>
    <button class="btn" type="submit">Kirjoita kirjaan</button>
    <p class="gb-status" data-gb-status role="status"></p>
  </form>
</section>
<!-- /wp:html -->
