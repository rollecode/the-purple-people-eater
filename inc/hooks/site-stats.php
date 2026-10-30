<?php
/**
 * Site-wide counts: texts, words and the per-year shelf. Counting every word
 * takes seconds, so the result is kept until something is published,
 * changed or removed, and then rebuilt in the background.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const SITE_STATS_KEY        = 'rollemaa_site_stats';
const SITE_STATS_BATCH      = 300;
const SITE_STATS_POST_TYPES = [ 'post', 'diary' ];

// Lavender, deep and soft spines in a loose rhythm along the shelf
const SHELF_TONES = [ 'L', 'D', 'S', 'L', 'S', 'D', 'L', 'S' ];

/**
 * Counts for posts and diary entries, total words and, per year, the number
 * of posts and diary entries and the words in each.
 *
 * @param bool $rebuild Count again even if a stored result exists.
 * @return array{posts:int, diary:int, words:int, years:array<int, array{posts:int, diary:int, post_words:int, diary_words:int}>}
 */
function site_stats( $rebuild = false ) {
  $stats = $rebuild ? false : get_transient( SITE_STATS_KEY );
  if ( false !== $stats ) {
    return $stats;
  }

  global $wpdb;

  $stats = [
    'posts' => 0,
    'diary' => 0,
    'words' => 0,
    'years' => [],
  ];

  $types = "'" . implode( "','", SITE_STATS_POST_TYPES ) . "'";

  for ( $offset = 0; ; $offset += SITE_STATS_BATCH ) {
    $rows = $wpdb->get_results( $wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery
      "SELECT post_type, YEAR(post_date) AS year, post_content FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_type IN ({$types}) ORDER BY ID LIMIT %d OFFSET %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
      SITE_STATS_BATCH,
      $offset
    ) );

    if ( empty( $rows ) ) {
      break;
    }

    foreach ( $rows as $row ) {
      $year  = (int) $row->year;
      $type  = 'post' === $row->post_type ? 'posts' : 'diary';
      $words = post_word_count( $row->post_content );

      $stats['years'][ $year ] = $stats['years'][ $year ] ?? [ 'posts' => 0, 'diary' => 0, 'post_words' => 0, 'diary_words' => 0 ];
      $stats['years'][ $year ][ $type ]++;
      $stats['years'][ $year ][ 'posts' === $type ? 'post_words' : 'diary_words' ] += $words;
      $stats[ $type ]++;
      $stats['words'] += $words;
    }
  }

  ksort( $stats['years'] );
  set_transient( SITE_STATS_KEY, $stats );

  return $stats;
}

/**
 * Throw the counts away when a post or diary entry is published, edited
 * while published or unpublished, and count again shortly after.
 */
function expire_site_stats( $new_status, $old_status, $post ) {
  if ( ! in_array( $post->post_type, SITE_STATS_POST_TYPES, true ) ) {
    return;
  }

  if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
    return;
  }

  delete_transient( SITE_STATS_KEY );

  if ( ! wp_next_scheduled( 'rollemaa_rebuild_site_stats' ) ) {
    wp_schedule_single_event( time() + MINUTE_IN_SECONDS, 'rollemaa_rebuild_site_stats' );
  }
}

add_action( 'transition_post_status', __NAMESPACE__ . '\expire_site_stats', 10, 3 );
add_action( 'rollemaa_rebuild_site_stats', function () {
  site_stats( true );
} );
