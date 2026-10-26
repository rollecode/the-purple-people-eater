<?php
/**
 * One day in the lokikirja list: the date line with how the day was
 * received, the whole entry and the day's data. Read in the same column
 * and type as the articles.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$responses = post_responses( get_the_ID() );
$likes     = $responses['likes'] + $responses['boosts'];
$anchor    = 'paiva-' . get_post_field( 'post_name' );
?>
<article id="<?php echo esc_attr( $anchor ); ?>" <?php post_class( 'dentry' ); ?>>
  <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
  <p class="dmeta meta-text">
    <time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( diary_long_date() ); ?></time>
    · <?php echo esc_html( diary_time() ); ?>
    · <?php echo esc_html( fi_number( post_words() ) ); ?> sanaa
    <?php if ( $likes ) : ?>
      · <?php echo esc_html( fi_count( $likes, 'reaktio', 'reaktiota' ) ); ?>
    <?php endif; ?>
    <?php if ( $responses['comments'] ) : ?>
      · <a href="<?php echo esc_url( get_permalink() . '#comments' ); ?>"><?php echo esc_html( fi_count( $responses['comments'], 'kommentti', 'kommenttia' ) ); ?></a>
    <?php endif; ?>
  </p>

  <div class="prose">
    <?php the_content(); ?>
  </div>

  <?php get_template_part( 'template-parts/diary-data' ); ?>
</article>
