<?php
/**
 * "Nyt" on the front page: the latest scrobble from Last.fm and the latest
 * film on Rollekino. Pages render whatever is cached and never wait for
 * the outside services; the browser asks the endpoint for a fresh copy.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

const NOW_CACHE_KEY = 'rollemaa_now';
const NOW_CACHE_TTL = 5 * MINUTE_IN_SECONDS;
const NOW_ROLLEKINO = 'https://www.rollekino.fi/wp-json/wp/v2/movie?per_page=1&_fields=title,link,date';

/**
 * What Rolle listens to and last watched.
 *
 * @param bool $fetch Ask the services when the cache is empty.
 * @return array{listening?:array, watched?:array}|null Null when nothing is cached and $fetch is false.
 */
function now_data( $fetch ) {
  $now = get_transient( NOW_CACHE_KEY );
  if ( false !== $now || ! $fetch ) {
    return false === $now ? null : $now;
  }

  $now    = [];
  $config = qp_config();

  if ( $config['lastfm_key'] ) {
    $track = qp_lastfm( $config['lastfm_user'], $config['lastfm_key'] );
    if ( $track && $track['track'] ) {
      $now['listening'] = $track;
    }
  }

  $response = wp_remote_get( NOW_ROLLEKINO, [ 'timeout' => 3 ] );
  $movies   = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );
  if ( ! empty( $movies[0]['title']['rendered'] ) ) {
    $now['watched'] = [
      'title' => html_entity_decode( $movies[0]['title']['rendered'], ENT_QUOTES, 'UTF-8' ),
      'url'   => $movies[0]['link'],
      'date'  => strtotime( $movies[0]['date'] ),
    ];
  }

  set_transient( NOW_CACHE_KEY, $now, NOW_CACHE_TTL );

  return $now;
}

function register_now_api() {
  register_rest_route( 'rollemaa/v1', '/now', [
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      ob_start();
      get_template_part( 'template-parts/now-items', null, [ 'now' => now_data( true ) ] );

      return new \WP_REST_Response( [ 'html' => trim( ob_get_clean() ) ] );
    },
  ] );
}
