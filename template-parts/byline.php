<?php
/**
 * Byline: who wrote it, when, how long it takes, how it was received. The
 * resume box is filled by front-end.js when this text was left unfinished.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$responses = $args['responses'];
$reactions = $responses['likes'] + $responses['boosts'];
$full_name = trim( get_the_author_meta( 'first_name' ) . ' ' . get_the_author_meta( 'last_name' ) );
$author    = '' === $full_name ? get_the_author() : $full_name;
?>
<div class="byline">
  <img src="<?php echo esc_url( get_theme_file_uri( 'images/author-info.jpg' ) ); ?>" alt="" width="60" height="60">
  <div>
    <p class="who-line">Kirjoittanut <strong><?php echo esc_html( $author ); ?></strong></p>
    <p class="meta">
      <span><?php the_icon( 'cal', 'ic-sm' ); ?><time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( post_date_fi() ); ?></time></span>
      <span><?php the_icon( 'clock', 'ic-sm' ); ?><?php echo esc_html( reading_minutes() ); ?> min</span>
      <span>
        <?php the_icon( 'comment', 'ic-sm' ); ?>
        <?php if ( $responses['comments'] ) : ?>
          <a href="#comments"><?php echo esc_html( fi_count( $responses['comments'], 'kommentti', 'kommenttia' ) ); ?></a>
        <?php else : ?>
          Ei kommentteja
        <?php endif; ?>
      </span>
      <?php if ( $reactions ) : ?>
        <span><?php the_icon( 'heart', 'ic-sm' ); ?><?php echo esc_html( fi_count( $reactions, 'reaktio', 'reaktiota' ) ); ?></span>
      <?php endif; ?>
    </p>
  </div>

  <?php if ( is_singular( 'post' ) ) : ?>
    <div class="resume" data-resume hidden>
      <span class="resume-flag" aria-hidden="true"></span>
      <div class="resume-text">
        <span data-resume-text></span>
        <span class="resume-bar" aria-hidden="true"><i></i></span>
      </div>
      <a href="#" data-resume-go>Jatka, <span data-resume-pct></span> %</a>
    </div>
  <?php endif; ?>
</div>
