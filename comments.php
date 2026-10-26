<?php
/**
 * Comments: the conversation, then how to join it with a reply from your
 * own fediverse account. WordPress' own comment form is closed.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

if ( post_password_required() ) {
  return;
}

$responses = post_responses( get_the_ID() );
$permalink = get_permalink();
?>
<section class="comments" id="comments" aria-labelledby="comments-title">
  <div class="read">
    <div class="comments-head">
      <h2 id="comments-title">Kommentit</h2>
      <p class="count-line">
        <?php if ( $responses['comments'] ) : ?>
          <?php echo esc_html( fi_count( $responses['comments'], 'kommentti', 'kommenttia' ) ); ?>
          <?php if ( $responses['fediverse'] ) : ?>
            · <?php the_icon( 'fedi', 'ic-sm' ); ?><?php echo esc_html( fi_number( $responses['fediverse'] ) ); ?> fediversumista
          <?php endif; ?>
        <?php else : ?>
          Ei vielä kommentteja
        <?php endif; ?>
      </p>
    </div>

    <?php if ( have_comments() ) : ?>
      <ol class="comment-list">
        <?php
        wp_list_comments( [
          'style'    => 'ol',
          'type'     => 'comment',
          'callback' => __NAMESPACE__ . '\single_comment',
        ] );
        ?>
      </ol>

      <?php
      the_comments_navigation( [
        'prev_text' => 'Vanhemmat kommentit',
        'next_text' => 'Uudemmat kommentit',
      ] );
      ?>
    <?php elseif ( is_federated() ) : ?>
      <p class="comments-empty">Kukaan ei ole vielä sanonut mitään. Aloita keskustelu vastaamalla omalta Mastodon-tililtäsi.</p>
    <?php endif; ?>

    <?php if ( is_federated() ) : ?>
      <div class="cf-fedi">
        <h3>Vastaa fediversumista</h3>
        <p class="hint">Voit vastata omalta Mastodon-tililtäsi tai miltä tahansa fediversumin palvelimelta. Vastauksesi näkyy täällä muiden kommenttien joukossa.</p>
        <ol class="steps">
          <li>
            <span class="step-n" aria-hidden="true">1</span>
            <div>
              <b>Kopioi kirjoituksen osoite</b>
              <div class="inrow">
                <input class="copybox" value="<?php echo esc_url( $permalink ); ?>" readonly aria-label="Kirjoituksen osoite">
                <button class="btn btn-ghost" type="button" data-copy="<?php echo esc_url( $permalink ); ?>"><?php the_icon( 'copy' ); ?><span>Kopioi</span></button>
              </div>
            </div>
          </li>
          <li>
            <span class="step-n" aria-hidden="true">2</span>
            <div>
              <b>Liitä osoite oman palvelimesi hakuun</b>
              <p>Haku löytää kirjoituksen, ja voit vastata siihen kuten mihin tahansa julkaisuun.</p>
            </div>
          </li>
          <li>
            <span class="step-n" aria-hidden="true">3</span>
            <div>
              <b>Rolle Mastodonissa</b>
              <p><a href="https://mementomori.social/@rolle" rel="me">@rolle@mementomori.social</a></p>
            </div>
          </li>
        </ol>
      </div>
    <?php endif; ?>
  </div>
</section>
