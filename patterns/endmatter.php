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
<footer class="wp-block-group endmatter"><!-- wp:html -->
<div class="clap" data-clap><button class="clap-btn" type="button" aria-describedby="clap-count"><svg class="clap-hands" viewBox="0 0 48 48" aria-hidden="true"><g class="hand hand-l"><path d="M14.5 41c-3-2-4.5-4.8-4.5-8.4V24.5a2 2 0 0 1 4 0V28V17a2 2 0 0 1 4 0V26V15.5a2 2 0 0 1 4 0V26V18a2 2 0 0 1 4 0v12.5c0 6-3.6 10.5-8.6 10.5-1.1 0-2.1-.2-2.9-.5z"/></g><g class="hand hand-r"><path d="M14.5 41c-3-2-4.5-4.8-4.5-8.4V24.5a2 2 0 0 1 4 0V28V17a2 2 0 0 1 4 0V26V15.5a2 2 0 0 1 4 0V26V18a2 2 0 0 1 4 0v12.5c0 6-3.6 10.5-8.6 10.5-1.1 0-2.1-.2-2.9-.5z"/></g><path class="clap-sparks" d="M24 4v4M17 6.5l2 3.2M31 6.5l-2 3.2"/></svg><span class="clap-plus" aria-hidden="true"></span><span class="screen-reader-text">Taputa</span></button><div class="clap-text"><p class="clap-title">Hyvin kirjoitettu</p><p class="clap-count meta-text" id="clap-count" aria-live="polite">Taputa, jos tykkäsit</p></div></div>
<!-- /wp:html -->

<!-- wp:group {"className":"colophon"} -->
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
