<?php
/**
 * "Nyt" on the front page: the latest scrobble from Last.fm, the latest
 * watched film or episode from Trakt, or the latest Rollekino film when
 * Trakt does not answer, and the book on Rolle's public Luku profile. Pages
 * render whatever is cached and never wait for the outside services; the
 * browser asks the endpoint for a fresh copy.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const NOW_CACHE_KEY = 'rollemaa_now';
const NOW_CACHE_TTL = 5 * MINUTE_IN_SECONDS;
const NOW_ROLLEKINO = 'https://www.rollekino.fi/wp-json/wp/v2/movie?per_page=1&_fields=title,link,date';
const NOW_TRAKT     = 'https://api.trakt.tv/users/rolle/history?limit=1';
const NOW_LUKU      = 'https://luku.app/api/profile/rolle';
const LUKU_PROFILE  = 'https://luku.app/u/rolle';

/**
 * What Rolle listens to and last watched.
 *
 * @param bool $fetch Ask the services when the cache is empty.
 * @return array{listening?:array, watched?:array, reading?:array}|null Null when nothing is cached and $fetch is false.
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

  $watched = trakt_watched() ?? rollekino_watched();
  if ( $watched ) {
    $now['watched'] = $watched;
  }

  $reading = luku_reading();
  if ( $reading ) {
    $now['reading'] = $reading;
  }

  set_transient( NOW_CACHE_KEY, $now, NOW_CACHE_TTL );

  return $now;
}

/**
 * The latest film or episode in Rolle's Trakt history.
 *
 * @return array{title:string, url:string, date:int, source:string}|null
 */
function trakt_watched() {
  $key = getenv( 'TRAKT_API_KEY' );
  if ( ! $key ) {
    return null;
  }

  $response = wp_remote_get( NOW_TRAKT, [
    'timeout' => 3,
    'headers' => [
      'Content-Type'      => 'application/json',
      'trakt-api-version' => '2',
      'trakt-api-key'     => $key,
    ],
  ] );

  if ( is_wp_error( $response ) || \WP_Http::OK !== wp_remote_retrieve_response_code( $response ) ) {
    return null;
  }

  $item = json_decode( wp_remote_retrieve_body( $response ), true )[0] ?? null;

  if ( 'episode' === ( $item['type'] ?? '' ) ) {
    $show    = $item['show'];
    $episode = $item['episode'];

    return [
      'title'  => sprintf( '%s, kausi %d, jakso %d', $show['title'], $episode['season'], $episode['number'] ),
      'url'    => sprintf( 'https://trakt.tv/shows/%s/seasons/%d/episodes/%d', $show['ids']['slug'], $episode['season'], $episode['number'] ),
      'date'   => strtotime( $item['watched_at'] ),
      'source' => 'Trakt',
    ];
  }

  if ( 'movie' === ( $item['type'] ?? '' ) ) {
    return [
      'title'  => sprintf( '%s (%d)', $item['movie']['title'], $item['movie']['year'] ),
      'url'    => 'https://trakt.tv/movies/' . $item['movie']['ids']['slug'],
      'date'   => strtotime( $item['watched_at'] ),
      'source' => 'Trakt',
    ];
  }

  return null;
}

/**
 * The latest film reviewed on Rollekino.
 *
 * @return array{title:string, url:string, date:int, source:string}|null
 */
function rollekino_watched() {
  $response = wp_remote_get( NOW_ROLLEKINO, [ 'timeout' => 3 ] );
  $movies   = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );

  if ( empty( $movies[0]['title']['rendered'] ) ) {
    return null;
  }

  return [
    'title'  => html_entity_decode( $movies[0]['title']['rendered'], ENT_QUOTES, 'UTF-8' ),
    'url'    => $movies[0]['link'],
    'date'   => strtotime( $movies[0]['date'] ),
    'source' => 'Rollekino',
  ];
}

/**
 * The book Rolle touched last. Luku's public profile lists them newest first.
 *
 * @return array{title:string, url:string}|null
 */
function luku_reading() {
  $response = wp_remote_get( NOW_LUKU, [ 'timeout' => 3 ] );
  $profile  = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );
  $book     = $profile['reading'][0] ?? null;

  if ( empty( $book['title'] ) ) {
    return null;
  }

  return [
    'title' => $book['title'] . ' – ' . $book['author'],
    'url'   => LUKU_PROFILE,
  ];
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
