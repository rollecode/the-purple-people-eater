<?php
/**
 * Title: Random finds
 * Slug: the-purple-people-eater/picks
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:group {"className":"wrap shuffle"} -->
<div class="wp-block-group wrap shuffle"><!-- wp:group {"className":"shuffle-head"} -->
<div class="wp-block-group shuffle-head"><!-- wp:heading {"className":"h-sec"} -->
<h2 class="wp-block-heading h-sec">Satunnaisia kirjoituksia arkistosta</h2>
<!-- /wp:heading -->

<!-- wp:html -->
<button class="btn btn-ghost" type="button" data-shuffle aria-controls="random-picks"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#shuffle"></use></svg>Arvo uudet</button>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:html -->
<ul class="picks" id="random-picks" aria-live="polite" data-picks></ul>
<!-- /wp:html --></div>
<!-- /wp:group -->
