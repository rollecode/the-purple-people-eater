<?php
/**
 * Enqueue and localize theme scripts and styles
 *
 * @Author: Roni Laukkarinen
 * @Date: 2020-02-20 13:46:50
 * @Last Modified by:   Roni Laukkarinen
 * @Last Modified time: 2022-02-09 11:04:24
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const HEATMAP_DAYS = 400;

/**
 * Fetch a remote /wp-json/words/v1/getposts feed with transient caching.
 *
 * Returns an array of post records (possibly empty). Successful responses are
 * cached for 24h; failed/non-200 responses are cached as empty arrays for 15
 * minutes so a transiently-broken upstream does not get polled on every render.
 */
function fetch_external_words( $url, $cache_key ) {
	$cached = get_transient( $cache_key );
	if ( false !== $cached ) {
		return is_array( $cached ) ? $cached : array();
	}

	$response = wp_remote_get( $url, array( 'timeout' => 5 ) );

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		set_transient( $cache_key, array(), 15 * MINUTE_IN_SECONDS );
		return array();
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $data ) ) {
		set_transient( $cache_key, array(), 15 * MINUTE_IN_SECONDS );
		return array();
	}

	set_transient( $cache_key, $data, DAY_IN_SECONDS );
	return $data;
}

/**
 * Heatmap stuff
 */
/**
 * Diary entries of the heatmap's year, as day => address, so each square
 * can open its day.
 *
 * @return array<string, string> Y-m-d => permalink.
 */
function heatmap_days() {
  $days = [];

  foreach ( get_posts( [
    'post_type'      => 'diary',
    'posts_per_page' => HEATMAP_DAYS,
    'fields'         => 'ids',
    'no_found_rows'  => true,
    'date_query'     => [ [ 'after' => '13 months ago' ] ],
  ] ) as $diary_id ) {
    $days[ get_the_date( 'Y-m-d', $diary_id ) ] = get_permalink( $diary_id );
  }

  return $days;
}

function heatmap_data() {
  global $post;

  // Start local array settings
  $heatmap_args = array(
    'post_type' => 'any',
    'posts_per_page' => 380, // phpcs:ignore
    'no_found_rows' => true,
    'post_status' => 'publish',
  );

  $heatmap_query = get_posts( $heatmap_args );

  // Fetch remote /wp-json/words/v1/getposts feeds and cache them. The same
  // transient key is used for both get_transient() and set_transient() — an
  // earlier version used mismatched keys, which silently disabled the cache
  // and caused every page render to re-hit the upstream endpoints (DEV-1050).
  // Failed fetches are cached as empty arrays for a short window so a single
  // bad upstream does not turn into a per-render polling loop.
  $rollekino_query   = fetch_external_words( 'https://www.rollekino.fi/wp-json/words/v1/getposts', 'rollekino_words_response' );
  $dude_query        = fetch_external_words( 'https://www.dude.fi/wp-json/words/v1/getposts', 'dude_words_response' );
  $rolledesign_query = fetch_external_words( 'https://rolle.design/wp-json/words/v1/getposts', 'rolledesign_words_response' );

  if ( is_array( $heatmap_query ) && is_array( $rollekino_query ) && is_array( $dude_query ) && is_array( $rolledesign_query ) ) {
    $merged = array_merge( $heatmap_query, $rollekino_query, $dude_query, $rolledesign_query );
  } else {
    $merged = $heatmap_query;
  }

  // $heatmap_post_array = array();
  foreach ( $merged as $key => $heatmap_post ) {
		setup_postdata( $heatmap_post );

		// Word count
    if ( is_object( $heatmap_post ) && isset( $heatmap_post->ID ) ) {
      $post_id = $heatmap_post->ID;
      $post_object = get_post( $post_id );
      $content = $post_object->post_content;
      $word_count = post_word_count( $content );
    } elseif ( is_array( $heatmap_post ) && isset( $heatmap_post['post_content'] ) ) {
      $word_count = post_word_count( $heatmap_post['post_content'] );
    } else {
      continue;
    }

    // Timestamps
    if ( is_object( $heatmap_post ) && isset( $heatmap_post->ID ) ) {
      $unix_timestamp = get_post_timestamp( $heatmap_post );
      $day = get_the_time( 'Y-m-d', $post_id );
      $day_in_unix_format = strtotime( get_the_time( 'Y-m-d', $post_id ) );
    } elseif ( is_array( $heatmap_post ) && isset( $heatmap_post['post_date_gmt'] ) ) {
      $unix_timestamp = strtotime( $heatmap_post['post_date_gmt'] );
      $day = gmdate( 'Y-m-d', strtotime( $heatmap_post['post_date_gmt'] ) );
      $day_in_unix_format = strtotime( gmdate( 'Y-m-d', strtotime( $heatmap_post['post_date_gmt'] ) ) );
    } else {
      continue;
    }

    // If same day has multiple posts, combine word counts and show total count for one day
    if ( isset( $heatmap_post_array[ $day_in_unix_format ] ) ) {
      $heatmap_post_array[ $day_in_unix_format ] = $heatmap_post_array[ $day_in_unix_format ] + $word_count;
    } else {
      $heatmap_post_array[ $day_in_unix_format ] = $word_count;
    }
  }

  // Rollemaa data
  return $heatmap_post_array;
}

/**
 * The stylesheets a view needs, in cascade order. Every page gets the shell
 * (base, header, rain, footer, search); the rest load only where their
 * markup renders.
 */
function view_stylesheets() {
  $chunks = [ 'base', 'nav', 'rain', 'footer', 'search-overlay' ];

  $template     = is_page() ? get_page_template_slug( get_queried_object_id() ) : '';
  $archive_page = in_array( $template, [ 'page-archive', 'page-all' ], true );
  $diary        = is_singular( 'diary' ) || is_post_type_archive( 'diary' );
  $listing      = ( is_archive() || is_search() || is_home() ) && ! $diary;

  if ( is_front_page() ) {
    array_push( $chunks, 'shelf', 'front' );
  }

  if ( 'page-archive' === $template ) {
    $chunks[] = 'shelf';
  }

  if ( $listing || $archive_page ) {
    $chunks[] = 'archive';
  }

  if ( ( is_singular() && ! is_front_page() ) || $diary ) {
    array_push( $chunks, 'article', 'content' );
  }

  if ( $diary ) {
    $chunks[] = 'diary';
  }

  if ( ( is_page() && ! is_front_page() ) || is_404() ) {
    $chunks[] = 'page';
  }

  if ( is_singular() || is_search() || is_404() ) {
    $chunks[] = 'forms';
  }

  if ( is_front_page() || is_singular( 'post' ) ) {
    $chunks[] = 'ads';
  }

  return array_unique( $chunks );
}

/**
 * Enqueue scripts and styles.
 */
function enqueue_theme_scripts() {
  foreach ( view_stylesheets() as $chunk ) {
    // The base chunk keeps the historical 'styles' handle: every other
    // stylesheet in the theme declares it as its dependency.
    $handle = 'base' === $chunk ? 'styles' : 'styles-' . $chunk;
    $deps   = 'base' === $chunk ? [] : [ 'styles' ];

    wp_enqueue_style( $handle,
      get_theme_file_uri( get_asset_file( $chunk . '.css' ) ),
      $deps,
      filemtime( get_theme_file_path( get_asset_file( $chunk . '.css' ) ) )
    );
  }

  // Element-level content styles for pre-Gutenberg posts. Block-era posts
  // get the same rules per block, just-in-time and inlined (performance.php);
  // legacy HTML has no block markers, so it loads the full set in one file.
  if ( is_singular() && ! is_front_page() && ! has_blocks( get_queried_object_id() ) ) {
    wp_enqueue_style( 'styles-content-legacy',
      get_theme_file_uri( get_asset_file( 'content-legacy.css' ) ),
      [ 'styles-content' ],
      filemtime( get_theme_file_path( get_asset_file( 'content-legacy.css' ) ) )
    );
  }

  // Code highlighting only on singulars that actually contain code blocks
  if ( is_singular() && false !== strpos( (string) get_post_field( 'post_content', get_queried_object_id() ), '<pre' ) ) {
    wp_enqueue_style( 'styles-prism',
      get_theme_file_uri( get_asset_file( 'prism.css' ) ),
      [ 'styles-content' ],
      filemtime( get_theme_file_path( get_asset_file( 'prism.css' ) ) )
    );
    wp_enqueue_script( 'prism',
      get_theme_file_uri( 'js/prism.js' ),
      [],
      filemtime( get_theme_file_path( 'js/prism.js' ) ),
      true
    );
  }

  // Front-end JS: vanilla and buildless, served as-is from js/front-end.js
  wp_enqueue_script( 'scripts',
    get_theme_file_uri( 'js/front-end.js' ),
    [],
    filemtime( get_theme_file_path( 'js/front-end.js' ) ),
    [
      'in_footer' => true,
      'strategy'  => 'defer',
    ]
  );

  // Writing heatmap only on the diary archive. This also keeps the heavy
  // heatmap_data() query (380 posts + remote feeds) off every other page.
  if ( is_post_type_archive( 'diary' ) && ! is_date() && ! is_paged() ) {
    wp_enqueue_script( 'heatmap',
      get_theme_file_uri( 'js/heatmap.js' ),
      [],
      filemtime( get_theme_file_path( 'js/heatmap.js' ) ),
      true
    );
    wp_localize_script( 'heatmap', 'heatmapdata', heatmap_data() );
    wp_localize_script( 'heatmap', 'heatmapdays', heatmap_days() );
  }

  $config = [
    'rest'    => esc_url_raw( rest_url( 'rollemaa/v1/' ) ),
    'algolia' => [
      'appId'     => ALGOLIA_APP_ID,
      'searchKey' => ALGOLIA_SEARCH_KEY,
      'index'     => algolia_index(),
    ],
    'localDomains' => [ 'rollemaa.test', 'rollemaa.fi', 'www.rollemaa.fi' ],
    'sprite'       => get_theme_file_uri( 'svg/icons.svg' ),
  ];

  if ( is_singular( 'post' ) ) {
    $config['post'] = get_the_ID();
  }

  wp_add_inline_script( 'scripts', 'window.rollemaa = ' . wp_json_encode( $config ) . ';', 'before' );
}

/**
 * Gravity Forms styles only on pages that render a form.
 */
add_action( 'gform_enqueue_scripts', function () {
  wp_enqueue_style( 'styles-gravity-forms',
    get_theme_file_uri( get_asset_file( 'gravity-forms.css' ) ),
    [ 'styles' ],
    filemtime( get_theme_file_path( get_asset_file( 'gravity-forms.css' ) ) )
  );
} );

/**
 * Returns the asset path for a file. Assets are plain, unbuilt files in
 * css/ and js/ nowadays, so this only maps the extension to the directory.
 *
 * @param string $filename File name with the extension
 * @return string file and path of the asset file
 */
function get_asset_file( $filename ) {
  $filetype = pathinfo( $filename )['extension'];

  return "{$filetype}/{$filename}";
} // end get_asset_file
