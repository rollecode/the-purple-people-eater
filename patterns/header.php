<?php
/**
 * Title: Header
 * Slug: the-purple-people-eater/header
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:html -->
<div class="rain-wrapper" aria-hidden="true"><div class="rain front-row"></div><div class="rain back-row"></div></div>
<!-- /wp:html -->

<!-- wp:group {"tagName":"header","className":"site-head"} -->
<header class="wp-block-group site-head"><!-- wp:group {"className":"bar"} -->
<div class="wp-block-group bar"><!-- wp:navigation {"overlayMenu":"never","ariaLabel":"Päävalikko","className":"nav"} -->
<!-- wp:navigation-link {"label":"Blogi","url":"/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Lokikirja","url":"/lokikirja/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Arkisto","url":"/arkisto/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Tietoa","url":"/info/","kind":"custom"} /-->
<!-- wp:navigation-link {"label":"Kirja","url":"/kirja/","kind":"custom"} /-->
<!-- /wp:navigation -->

<!-- wp:html -->
<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="Rollemaa, etusivu"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#logo"></use></svg>Rollemaa</a>
<!-- /wp:html -->

<!-- wp:html -->
<button class="search-btn" type="button" aria-label="Haku (pikanäppäin /)" aria-haspopup="dialog" aria-controls="search" data-open-search><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#search"></use></svg><span class="lbl" aria-hidden="true">Haku</span><kbd aria-hidden="true">/</kbd></button>
<!-- /wp:html --></div>
<!-- /wp:group --></header>
<!-- /wp:group -->

<!-- wp:html -->
<dialog class="search-dialog" id="search" aria-label="Haku">
  <div class="sbox">
    <form class="s-input" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
      <svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#search"></use></svg>
      <label class="screen-reader-text" for="search-input">Hae Rollemaasta</label>
      <input id="search-input" type="search" name="s" autocomplete="off" enterkeyhint="search" aria-controls="search-results" aria-describedby="search-status" placeholder="Hae Rollemaasta">
      <button class="x-btn" type="button" aria-label="Sulje haku" data-close-search><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#close"></use></svg></button>
    </form>
    <p class="s-meta meta-text" id="search-status" aria-live="polite"></p>
    <div class="s-results" id="search-results"></div>
    <div class="s-empty" data-search-empty hidden>
      <h2>Viimeisimmät hakusi</h2>
      <ul data-search-recent></ul>
    </div>
    <div class="s-foot meta-text">
      <span><kbd>↑</kbd><kbd>↓</kbd> liiku</span>
      <span><kbd>Enter</kbd> avaa</span>
      <span><kbd>Esc</kbd> sulje</span>
      <a class="all textlink" href="<?php echo esc_url( home_url( '/?satunnainen' ) ); ?>" data-search-all>Satunnainen kirjoitus <svg class="ic ic-sm" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#shuffle"></use></svg></a>
    </div>
  </div>
</dialog>
<!-- /wp:html -->
