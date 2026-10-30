<?php
/**
 * The featured image's caption as a credit.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$caption = has_photo_hero() ? wp_get_attachment_caption( get_post_thumbnail_id() ) : '';

if ( $caption ) {
  printf( '<span class="credit">%s</span>', esc_html( $caption ) );
}
