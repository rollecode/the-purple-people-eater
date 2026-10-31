<?php
/**
 * Title: Arkisto
 * Slug: the-purple-people-eater/archive
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:group {"tagName":"header","className":"page-hero"} -->
<header class="wp-block-group page-hero"><!-- wp:group {"className":"inner"} -->
<div class="wp-block-group inner"><!-- wp:html -->
<h1>Historian lehtien havinaa</h1>
<!-- /wp:html -->

<!-- wp:paragraph {"className":"intro"} -->
<p class="intro">Kaikki pelastetut Rollemaan kirjoitukset vuodesta 2005 lähtien: <span data-stat="posts">1629</span> kirjoitusta, <span data-stat="diary">1690</span> lokikirjan päivää ja <span data-stat="tags">1841</span> avainsanaa. Selaa vuosittain, avainsanoittain tai lukijoiden suosikkien mukaan.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></header>
<!-- /wp:group -->

<!-- wp:group {"className":"wrap shelf-wrap shelf-big"} -->
<div class="wp-block-group wrap shelf-wrap shelf-big"><!-- wp:group {"className":"shelf-meta"} -->
<div class="wp-block-group shelf-meta"><!-- wp:heading -->
<h2 class="wp-block-heading">Kirjoitukset vuosittain</h2>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:html -->
<ol class="shelf" aria-label="Kirjoitukset vuosittain" data-shelf="210"></ol>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"wrap years"} -->
<div class="wp-block-group wrap years"><!-- wp:heading {"className":"sec-title"} -->
<h2 class="wp-block-heading sec-title">Vuodet vierivät</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<ol class="year-index" data-years></ol>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"wrap arch-grid"} -->
<div class="wp-block-group wrap arch-grid"><!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"className":"h-sec"} -->
<h2 class="wp-block-heading h-sec">Avainsanat</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"sub"} -->
<p class="sub">18 käytetyintä <span data-stat="tags">1841</span> avainsanasta.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<ul class="tagbars" data-tagbars></ul>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ranks"} -->
<div class="wp-block-group ranks"><!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"className":"h-sec"} -->
<h2 class="wp-block-heading h-sec">Luetuimmat</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div data-ranked="read"></div>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading {"className":"h-sec"} -->
<h2 class="wp-block-heading h-sec">Kommentoiduimmat</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div data-ranked="discussed"></div>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:paragraph -->
<p><a class="textlink" href="/kaikki-rollemaan-kirjoitukset/">Kaikki kirjoitukset <svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#arrow"></use></svg></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
