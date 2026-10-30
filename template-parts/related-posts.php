<?php
/**
 * "Lue myös": the articles that share the most keywords with this one.
 * $related_posts comes from the_related_posts().
 *
 * @package minimalistmadness
 */

namespace Air_Light;

if ( empty( $related_posts ) ) {
  return;
}
?>
<section aria-labelledby="related-title">
  <h2 id="related-title">Lue myös</h2>
  <ul class="related">
    <?php foreach ( $related_posts as $related_id ) : ?>
      <li>
        <span class="meta-text"><?php echo esc_html( post_date_fi( $related_id ) . ' · ' . reading_minutes( $related_id ) . ' min' ); ?></span>
        <a href="<?php echo esc_url( get_permalink( $related_id ) ); ?>"><?php echo wp_kses_post( get_the_title( $related_id ) ); ?></a>
      </li>
    <?php endforeach; ?>
  </ul>
</section>
