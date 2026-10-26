<?php
/**
 * Small facts about a text: date, word count, reading time, excerpt.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

const WORDS_PER_MINUTE = 200;
const EXCERPT_SENTENCES   = 2;
const TEXT_CARD_SENTENCES = 6;
const REACTION_FACES      = 24;

/**
 * Finnish number: four digits stay together (3458), longer ones get
 * a no-break space between groups of three (919 976).
 *
 * @param int $number Number to format.
 */
function fi_number( $number ) {
  $number = (int) $number;

  if ( abs( $number ) < 10000 ) {
    return (string) $number;
  }

  return number_format( $number, 0, ',', "\u{00A0}" );
}

/**
 * Date as d.M.yyyy, the Finnish short form.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function post_date_fi( $post = null ) {
  return get_the_date( 'j.n.Y', $post );
}

/**
 * Word count, cached until the post changes.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function post_words( $post = null ) {
  $post = get_post( $post );
  if ( ! $post ) {
    return 0;
  }

  $key   = 'words_' . $post->ID . '_' . strtotime( $post->post_modified_gmt );
  $words = wp_cache_get( $key, 'rollemaa' );

  if ( false === $words ) {
    $words = post_word_count( $post->post_content );
    wp_cache_set( $key, $words, 'rollemaa', WEEK_IN_SECONDS );
  }

  return (int) $words;
}

/**
 * Reading time in whole minutes, never less than one.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function reading_minutes( $post = null ) {
  return max( 1, (int) ceil( post_words( $post ) / WORDS_PER_MINUTE ) );
}

/**
 * The excerpt if one was written, otherwise the first sentences of the text.
 *
 * @param int|\WP_Post|null $post      Post, current post by default.
 * @param int               $sentences How many sentences at most.
 */
function post_excerpt_text( $post = null, $sentences = EXCERPT_SENTENCES ) {
  $post = get_post( $post );
  if ( ! $post ) {
    return '';
  }

  if ( has_excerpt( $post ) ) {
    return wp_strip_all_tags( get_the_excerpt( $post ) );
  }

  // A space after each block, so list items and paragraphs don't run together.
  $html = preg_replace( '#(</(?:p|li|h[1-6]|div|blockquote|figcaption)>|<br\s*/?>)#i', '$1 ', strip_shortcodes( $post->post_content ) );
  $text = trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( $html ) ) );
  preg_match( '/^(?:.*?[.!?]+(?=\s|$)){1,' . (int) $sentences . '}/u', $text, $match );

  return $match[0] ?? wp_trim_words( $text, 40 );
}

/**
 * Date, reading time and word count as one quiet line.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function the_meta_line( $post = null ) {
  $post = get_post( $post );
  ?>
  <p class="meta-line meta-text">
    <span><time datetime="<?php echo esc_attr( get_the_date( 'c', $post ) ); ?>"><?php echo esc_html( post_date_fi( $post ) ); ?></time></span>
    <span><?php echo esc_html( reading_minutes( $post ) ); ?> min</span>
    <span><?php echo esc_html( fi_number( post_words( $post ) ) ); ?> sanaa</span>
  </p>
  <?php
}

/**
 * Title for the article head. A subtitle after " – " is set in italics.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function the_display_title( $post = null ) {
  $parts = preg_split( '/\s(?:–|&#8211;)\s/u', get_the_title( $post ), 2 );

  if ( 2 === count( $parts ) ) {
    echo wp_kses_post( $parts[0] . ' – <em>' . $parts[1] . '</em>' );
    return;
  }

  echo wp_kses_post( $parts[0] );
}

/**
 * Whether readers can answer the post from the fediverse.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function is_federated( $post = null ) {
  return function_exists( 'Activitypub\is_post_disabled' ) && ! \Activitypub\is_post_disabled( get_post( $post ) );
}

/**
 * Comments, the ones of them that came from the Fediverse, and likes and
 * boosts, which the ActivityPub plugin stores as comments of their own type.
 *
 * @param int $post_id Post ID.
 * @return array{comments:int, fediverse:int, likes:int, boosts:int}
 */
function post_responses( $post_id ) {
  $count = function ( $args ) use ( $post_id ) {
    return (int) get_comments( $args + [
      'post_id' => $post_id,
      'status'  => 'approve',
      'count'   => true,
    ] );
  };

  return [
    'comments'  => $count( [ 'type' => 'comment' ] ),
    'fediverse' => $count( [
      'type'     => 'comment',
      'meta_key' => 'protocol', // phpcs:ignore WordPress.DB.SlowDBQuery
    ] ),
    'likes'     => $count( [ 'type' => 'like' ] ),
    'boosts'    => $count( [ 'type' => 'repost' ] ),
  ];
}

/**
 * Finnish count with the right form: 1 kommentti, 2 kommenttia.
 *
 * @param int    $number   Count.
 * @param string $singular Nominative singular.
 * @param string $plural   Partitive singular, used for any other count.
 */
function fi_count( $number, $singular, $plural ) {
  return fi_number( $number ) . ' ' . ( 1 === (int) $number ? $singular : $plural );
}
