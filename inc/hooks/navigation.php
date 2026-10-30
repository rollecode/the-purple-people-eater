<?php
/**
 * Main navigation: mark the section the visitor is in, not only the exact
 * page. An article belongs to Blogi, a diary entry to Lokikirja.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

/**
 * The menu item a view belongs to, as the item's URL.
 */
function current_section_url() {
  if ( is_singular( 'diary' ) || is_post_type_archive( 'diary' ) ) {
    return get_post_type_archive_link( 'diary' );
  }

  if ( is_singular( 'post' ) || is_home() || is_front_page() || is_category() || is_tag() || is_date() ) {
    return home_url( '/' );
  }

  return '';
}

function mark_current_section( $atts, $item ) {
  $section = current_section_url();

  if ( $section && untrailingslashit( $item->url ) === untrailingslashit( $section ) ) {
    $atts['aria-current'] = 'page';
  }

  return $atts;
}

add_filter( 'nav_menu_link_attributes', __NAMESPACE__ . '\mark_current_section', 10, 2 );

/**
 * Articles with a featured image open on the photo, and the header sits on
 * top of it in white.
 */
function has_photo_hero() {
  return is_text_view( 'post' ) && has_post_thumbnail();
}
