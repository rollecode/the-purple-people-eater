<?php
/**
 * Date, reading time and length on the featured image.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( ! has_photo_hero() ) {
  return;
}
?>
<p class="hero-foot meta-line meta-text">
  <span><?php echo esc_html( post_date_fi() ); ?></span>
  <span><?php echo esc_html( reading_minutes() ); ?> min</span>
  <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
</p>
