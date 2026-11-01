<?php
/**
 * Title: Comments
 * Slug: the-purple-people-eater/comments
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:group {"tagName":"section","anchor":"comments","className":"comments"} -->
<section id="comments" class="wp-block-group comments"><!-- wp:group {"className":"read"} -->
<div class="wp-block-group read"><!-- wp:group {"className":"comments-head"} -->
<div class="wp-block-group comments-head"><!-- wp:heading -->
<h2 class="wp-block-heading">Keskustelu</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"count-line"} -->
<p class="count-line">Ei vielä kommentteja</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:comments -->
<div class="wp-block-comments"><!-- wp:comment-template {"className":"comment-list"} -->
<!-- wp:group {"className":"cmt"} -->
<div class="wp-block-group cmt"><!-- wp:group {"className":"cmt-head"} -->
<div class="wp-block-group cmt-head"><!-- wp:avatar {"size":40} /--><!-- wp:group -->
<div class="wp-block-group"><!-- wp:comment-author-name {"isLink":true,"className":"name"} /--><!-- wp:comment-date {"format":"j.n.Y \\k\\l\\o G.i","isLink":true,"className":"when"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:comment-content {"className":"cmt-body"} /-->

<!-- wp:group {"className":"cmt-actions"} -->
<div class="wp-block-group cmt-actions"><!-- wp:comment-reply-link /--><!-- wp:comment-edit-link /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:comment-template --></div>
<!-- /wp:comments -->

<!-- wp:paragraph {"className":"comments-empty"} -->
<p class="comments-empty">Kukaan ei ole vielä sanonut mitään. Aloita keskustelu Mastodonissa tai siellä, missä kirjoitus on jaettu.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="cf-fedi">
  <h3>Kommentoi muualta</h3>
  <p class="hint">Keskustelu käydään somessa. Julkiset kommentit Blueskysta, Threadsista ja Mastodonista tuodaan tämän artikkelin kylkeen automaattisesti. Voit vastata kirjoitukseen suoraan omalta Mastodon-tililtäsi tai miltä tahansa fediversumin palvelimelta:</p>
  <ol class="steps">
    <li><span class="step-n" aria-hidden="true">1</span><div><b>Kopioi kirjoituksen osoite</b><div class="copyfield"><input class="copybox" readonly aria-label="Kirjoituksen osoite" data-permalink><button class="btn" type="button" data-copy><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#copy"></use></svg><span>Kopioi</span></button></div></div></li>
    <li><span class="step-n" aria-hidden="true">2</span><div><b>Liitä osoite oman palvelimesi hakuun</b><p>Haku löytää kirjoituksen, ja voit vastata siihen kuten mihin tahansa julkaisuun.</p></div></li>
    <li><span class="step-n" aria-hidden="true">3</span><div><b>Rolle Mastodonissa</b><p><a href="https://mementomori.social/@rolle" rel="me">@rolle@mementomori.social</a></p></div></li>
  </ol>
  <div class="cf-shares"><b>Jaa ja keskustele</b><p>Kun kirjoitus jaetaan Mastodonissa, Blueskyssa tai Threadsissa, jakoon tulleet vastaukset ja lainaukset kopioituvat tänne viestiketjuineen. Keskustelu näkyy täällä yleensä vartin sisällä.</p></div>
</div>
<!-- /wp:html --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
