<?php
/**
 * Title: Byline
 * Slug: the-purple-people-eater/byline
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

?>
<!-- wp:group {"className":"byline"} -->
<div class="wp-block-group byline"><!-- wp:image -->
<figure class="wp-block-image"><img src="<?php echo esc_url( get_theme_file_uri( 'images/author-info.jpg' ) ); ?>" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"who-line"} -->
<p class="who-line">Kirjoittanut <strong>Rolle Laukkarinen</strong></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"meta"} -->
<div class="wp-block-group meta"><!-- wp:post-date {"format":"j.n.Y"} /--><!-- wp:post-time-to-read {"displayAsRange":false,"averageReadingSpeed":200} /--><!-- wp:post-comments-link /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:html -->
<div class="resume" data-resume hidden><span class="resume-flag" aria-hidden="true"></span><div class="resume-text"><span data-resume-text></span><span class="resume-bar" aria-hidden="true"><i></i></span></div><a href="#" data-resume-go>Jatka kohdasta <span data-resume-pct></span> %</a></div>
<!-- /wp:html --></div>
<!-- /wp:group -->
