<?php
/**
 * After a day: its data, the same day a year ago, the days around it.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$previous = get_previous_post();
$next     = get_next_post();

get_template_part( 'template-parts/diary-data', null, [ 'reactions' => true ] );

edit_post_link( 'Muokkaa', '<p class="edit-link">', '</p>' );
get_template_part( 'template-parts/year-since-now' );
?>

<nav class="prevnext" aria-label="Edellinen ja seuraava päivä">
  <?php if ( $previous ) : ?>
    <a href="<?php echo esc_url( get_permalink( $previous ) ); ?>" rel="prev">
      <span class="meta-text">Edellinen · <?php echo esc_html( get_the_time( 'l j.n.', $previous ) ); ?></span>
      <strong><?php echo esc_html( get_the_title( $previous ) ); ?></strong>
    </a>
  <?php endif; ?>

  <?php if ( $next ) : ?>
    <a href="<?php echo esc_url( get_permalink( $next ) ); ?>" rel="next">
      <span class="meta-text">Seuraava · <?php echo esc_html( get_the_time( 'l j.n.', $next ) ); ?></span>
      <strong><?php echo esc_html( get_the_title( $next ) ); ?></strong>
    </a>
  <?php endif; ?>
</nav>
