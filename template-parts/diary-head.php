<?php
/**
 * A day's head: the diary's mark, the date and the facts.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$responses = post_responses( get_the_ID() );
$likes     = $responses['likes'] + $responses['boosts'];
?>
<header class="read diary-head">
  <p class="diary-kicker"><a href="<?php echo esc_url( get_post_type_archive_link( 'diary' ) ); ?>"><?php the_icon( 'logbook', 'ic-sm' ); ?>Lokikirja</a><span aria-hidden="true">·</span><?php the_title(); ?></p>
  <h1><time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( diary_long_date() ); ?></time></h1>
  <p class="meta-line meta-text">
    <span><?php echo esc_html( ucfirst( diary_time() ) ); ?></span>
    <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
    <?php if ( $likes ) : ?>
      <span><?php echo esc_html( fi_count( $likes, 'reaktio', 'reaktiota' ) ); ?></span>
    <?php endif; ?>
  </p>
</header>
