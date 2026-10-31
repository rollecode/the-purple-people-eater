<?php
/**
 * Title: After an article
 * Slug: the-purple-people-eater/endmatter
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:group {"tagName":"footer","className":"endmatter"} -->
<footer class="wp-block-group endmatter"><!-- wp:group {"className":"colophon"} -->
<div class="wp-block-group colophon"><!-- wp:post-terms {"term":"post_tag","separator":", ","className":"keywords"} /--></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Reaktiot fediversumissa</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div data-reactions></div>
<!-- /wp:html -->

<!-- wp:paragraph {"className":"fedi-note"} -->
<p class="fedi-note">Tykkää, boostaa tai vastaa omalta Mastodon-tililtäsi: hae palvelimesi haulla tämän kirjoituksen osoite. Reaktiot päivittyvät tänne. Rolle Mastodonissa: <a href="https://mementomori.social/@rolle" rel="me">@rolle@mementomori.social</a>.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Jaa ja seuraa</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<div class="share"><a class="btn" href="https://share.joinmastodon.org/" data-share><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#masto"></use></svg>Jaa Mastodonissa</a><a class="btn btn-ghost" href="https://mementomori.social/@rolle" rel="me"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#masto"></use></svg>Seuraa Rollea</a><button class="btn btn-ghost" type="button" data-copy><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#link"></use></svg><span>Kopioi linkki</span></button><a class="btn btn-ghost" href="<?php echo esc_url( home_url( '/feed/' ) ); ?>"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#rss"></use></svg>RSS</a></div>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading">Lue myös</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<ul class="related" data-related></ul>
<!-- /wp:html --></div>
<!-- /wp:group --></footer>
<!-- /wp:group -->
