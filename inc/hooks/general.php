<?php
/**
 * General hooks.
 *
 * @package minimalistmadness
 * @Author: Niku Hietanen
 * @Date: 2020-02-20 13:46:50
 * @Last Modified by:   Roni Laukkarinen
 * @Last Modified time: 2022-11-01 11:29:39
 */

namespace Air_Light;

// "Kuka Rolle?", the about page
const ABOUT_PAGE_ID = 2768;

const AUTHOR_BORN = '1988-11-01';

// Articles older than this get the "Arkistomatskua" note
const ARCHIVE_NOTE_AFTER_YEARS = 2;

/**
 * Enable all views
 */
remove_action( 'template_redirect', __NAMESPACE__ . '\air_helper_disable_views' );

/**
 * Enable author view for ActivityPub
 */
// add_filter( 'air_helper_disable_views_author', '__return_false' );

/**
 * Enable users endpoint view for ActivityPub
 */
remove_filter( 'rest_endpoints', __NAMESPACE__ . '\air_helper_disable_rest_endpoints' );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function widgets_init() {
  register_sidebar( array(
    'name'          => esc_html__( 'Sidebar', 'minimalistmadness' ),
    'id'            => 'sidebar-1',
    'description'   => esc_html__( 'Add widgets here.', 'minimalistmadness' ),
    'before_widget' => '<section id="%1$s" class="widget %2$s">',
    'after_widget'  => '</section>',
    'before_title'  => '<h2 class="widget-title">',
    'after_title'   => '</h2>',
  ) );
} // end widgets_init

/**
 * Number of words in post content: runs of letters and digits, 0,5 being
 * one. str_word_count() knows only ASCII, so it split every word with ä or ö.
 *
 * @param string $content The post content.
 * @return int Number of words in the content.
 */
function post_word_count( $content ) {
  // Tags out before entities are decoded, or a written &lt; would eat text
  $text = html_entity_decode( wp_strip_all_tags( strip_shortcodes( $content ), true ), ENT_QUOTES, 'UTF-8' );

  return (int) preg_match_all( '/[\p{L}\p{N}](?:[\p{L}\p{N}\'’-]|(?<=\p{N})[.,](?=\p{N}))*/u', $text );
}

/**
 * Fix ActivityPub avatar caching.
 *
 * Clear stale avatar URL meta entries that point to remote URLs,
 * so the ActivityPub plugin re-downloads and caches them locally.
 * Runs daily via wp_cron.
 */
function rollemaa_refresh_activitypub_avatars() {
  global $wpdb;

  // Get site URL to identify locally cached avatars
  $site_url = home_url();

  // Delete avatar URL meta entries pointing to remote (non-local) URLs
  // These are stale and will be re-fetched and cached locally on next access
  $wpdb->query( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
    $wpdb->prepare(
      "DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_activitypub_avatar_url' AND meta_value NOT LIKE %s",
      $wpdb->esc_like( $site_url ) . '%'
    )
  );
}

// Schedule daily avatar refresh
add_action( 'rollemaa_refresh_avatars', __NAMESPACE__ . '\rollemaa_refresh_activitypub_avatars' );

if ( ! wp_next_scheduled( 'rollemaa_refresh_avatars' ) ) {
  wp_schedule_event( time(), 'daily', 'rollemaa_refresh_avatars' );
}

// Also clear stale avatar meta when an actor is updated, to force re-cache
add_action( 'save_post_ap_actor', function( $post_id ) {
  delete_post_meta( $post_id, '_activitypub_avatar_url' );
}, 5 );

/**
 * Rolle's age in whole years, now or at a given moment.
 *
 * @param \DateTimeInterface|null $at Moment, now by default.
 */
function author_age( $at = null ) {
  $born = new \DateTimeImmutable( AUTHOR_BORN, wp_timezone() );

  return $born->diff( $at ?? current_datetime() )->y;
}

/**
 * /?satunnainen sends the visitor to a random article. The query string
 * keeps the page cache out of it, so every visit draws again.
 */
function redirect_to_random_post() {
  if ( ! isset( $_GET['satunnainen'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    return;
  }

  $query = random_query();
  $url   = $query->have_posts() ? get_permalink( $query->posts[0] ) : home_url( '/' );

  nocache_headers();
  wp_safe_redirect( $url, 302 );
  exit;
}
