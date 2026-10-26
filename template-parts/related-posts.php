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
  <div class="related">
    <?php foreach ( $related_posts as $related_id ) : ?>
      <a class="<?php echo has_post_thumbnail( $related_id ) ? 'has-img' : 'is-text'; ?>" href="<?php echo esc_url( get_permalink( $related_id ) ); ?>">
        <?php if ( has_post_thumbnail( $related_id ) ) : ?>
          <span class="sl">
            <?php
            echo get_the_post_thumbnail( $related_id, 'medium_large', [ // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core markup
              'alt'     => '',
              'loading' => 'lazy',
              'sizes'   => '(max-width: 860px) 112px, 240px',
            ] );
            ?>
          </span>
        <?php endif; ?>
        <span class="rel-body">
          <span class="meta-text"><?php echo esc_html( post_date_fi( $related_id ) . ' · ' . reading_minutes( $related_id ) . ' min' ); ?></span>
          <h3><?php echo wp_kses_post( get_the_title( $related_id ) ); ?></h3>
          <?php if ( ! has_post_thumbnail( $related_id ) ) : ?>
            <span class="rel-excerpt"><?php echo esc_html( post_excerpt_text( $related_id ) ); ?></span>
          <?php endif; ?>
        </span>
      </a>
    <?php endforeach; ?>
  </div>
</section>
