<?php
/**
 * Endpoints the front page asks for more of. They return HTML rendered by
 * the same template parts as the page, so a loaded card is the same card.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

const CARDS_PER_PAGE = 6;
const RANDOM_PICKS   = 4;

/**
 * Articles for the front page feed. The newest is the lead card, so the
 * grid starts from the second.
 *
 * @param int $offset How many grid posts are already shown.
 */
function feed_query( $offset ) {
  return new \WP_Query( [
    'post_type'           => 'post',
    'post_status'         => 'publish',
    'posts_per_page'      => CARDS_PER_PAGE,
    'offset'              => 1 + $offset,
    'ignore_sticky_posts' => true,
  ] );
}

/**
 * Random older articles. Skips the everyday tags kuulumiset and elämä,
 * whose posts say little out of context, and the first two years.
 */
function random_query() {
  return new \WP_Query( [
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => RANDOM_PICKS,
    'orderby'        => 'rand',
    'no_found_rows'  => true,
    'tag__not_in'    => [ 79, 7 ],
    'date_query'     => [
      [
        'after'     => '2007-01-01',
        'inclusive' => true,
      ],
    ],
  ] );
}

function register_feed_api() {
  register_rest_route( 'rollemaa/v1', '/cards', [
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'args'                => [
      'offset' => [
        'type'    => 'integer',
        'minimum' => 0,
        'default' => 0,
      ],
    ],
    'callback'            => function ( \WP_REST_Request $request ) {
      $query  = feed_query( (int) $request['offset'] );
      $shown  = (int) $request['offset'] + $query->post_count;
      $total  = max( 0, $query->found_posts - 1 );

      ob_start();
      while ( $query->have_posts() ) {
        $query->the_post();
        get_template_part( 'template-parts/card' );
      }
      wp_reset_postdata();

      return new \WP_REST_Response( [
        'html' => trim( ob_get_clean() ),
        'done' => $shown >= $total,
      ] );
    },
  ] );

  register_rest_route( 'rollemaa/v1', '/random', [
    'methods'             => 'GET',
    'permission_callback' => '__return_true',
    'callback'            => function () {
      ob_start();
      get_template_part( 'template-parts/random-picks' );

      $response = new \WP_REST_Response( [ 'html' => trim( ob_get_clean() ) ] );
      $response->header( 'Cache-Control', 'no-store' );

      return $response;
    },
  ] );
}
