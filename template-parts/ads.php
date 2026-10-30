<?php
/**
 * Paid ad slot on the front page: the newest published ad for the
 * "etusivu" slot, until its expiry date.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$ads = get_posts( [
  'post_type'      => 'ads',
  'post_status'    => 'publish',
  'posts_per_page' => 1,
  'meta_key'       => 'slotti', // phpcs:ignore WordPress.DB.SlowDBQuery
  'meta_value'     => 'etusivu', // phpcs:ignore WordPress.DB.SlowDBQuery
] );

if ( ! $ads || strtotime( get_post_meta( $ads[0]->ID, 'eraantymispaiva', true ) ) <= time() ) {
  return;
}
?>
<aside class="placement" aria-label="Mainos">
  <?php echo get_post_meta( $ads[0]->ID, 'mainoskoodi', true ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- ad code entered by the site owner ?>
</aside>
