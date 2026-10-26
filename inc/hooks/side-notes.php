<?php
/**
 * Side notes for long articles: the first link of a paragraph gets a note
 * in the margin, with what the linked text is when it is on this site.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

const SIDE_NOTES_MIN_WORDS = 1200;
const SIDE_NOTES_MAX       = 6;
const SIDE_NOTES_GAP       = 3;
const SITE_HOST            = 'rollemaa.fi';

/**
 * Add the notes before the paragraphs whose links they describe.
 *
 * @param string $content Post content, blocks already rendered.
 */
function add_side_notes( $content ) {
  if ( ! is_singular( 'post' ) || ! in_the_loop() || ! is_main_query() || post_words() < SIDE_NOTES_MIN_WORDS ) {
    return $content;
  }

  $count = 0;
  $since = SIDE_NOTES_GAP;

  return preg_replace_callback( '#<p\b[^>]*>.*?</p>#s', function ( $paragraph ) use ( &$count, &$since ) {
    $since++;

    if ( $count >= SIDE_NOTES_MAX || $since < SIDE_NOTES_GAP ) {
      return $paragraph[0];
    }

    if ( ! preg_match( '#<a\s[^>]*href="(https?://[^"]+)"[^>]*>.*?</a>#s', $paragraph[0], $link ) ) {
      return $paragraph[0];
    }

    $note = side_note( html_entity_decode( $link[1] ), $count + 1 );
    if ( ! $note ) {
      return $paragraph[0];
    }

    $count++;
    $since = 0;

    $ref = '<sup class="ref" aria-hidden="true">' . $count . '</sup>';

    return $note . str_replace( $link[0], $link[0] . $ref, $paragraph[0] );
  }, $content );
}

/**
 * One note: a text on this site with its date and length, or the site of
 * an outside page. Nothing for links to images or files.
 *
 * @param string $url    Link address.
 * @param int    $number Note number.
 */
function side_note( $url, $number ) {
  if ( preg_match( '/\.(jpe?g|png|gif|webp|avif|pdf|zip|mp3|mp4)(\?|$)/i', $url ) ) {
    return '';
  }

  // Old posts link to rollemaa.fi with or without www, whatever the site runs on now
  $home    = wp_parse_url( home_url(), PHP_URL_HOST );
  $host    = preg_replace( '/^www\./', '', (string) wp_parse_url( $url, PHP_URL_HOST ) );
  $is_ours = in_array( $host, [ SITE_HOST, preg_replace( '/^www\./', '', $home ) ], true );
  $post_id = $is_ours ? url_to_postid( preg_replace( '#^https?://[^/]+#', untrailingslashit( home_url() ), $url ) ) : 0;
  $current = get_the_ID();

  if ( $post_id && $post_id !== $current && 'publish' === get_post_status( $post_id ) ) {
    $label = get_post_time( 'U', true, $post_id ) < get_post_time( 'U', true, $current ) ? 'Arkistosta' : 'Lue myös';
    $about = sprintf( '%s, %s', post_date_fi( $post_id ), fi_count( post_words( $post_id ), 'sana', 'sanaa' ) );
    $title = get_the_title( $post_id );
    $url   = get_permalink( $post_id );
  } else {
    if ( ! $host || $is_ours ) {
      return '';
    }

    $label = 'Linkki';
    $about = '';
    $title = $host;
  }

  return sprintf(
    '<div class="mnote" role="note"><span class="n" aria-hidden="true">%1$d</span><b>%2$s</b> <a href="%3$s">%4$s</a>%5$s</div>',
    $number,
    esc_html( $label ),
    esc_url( $url ),
    esc_html( wp_strip_all_tags( $title ) ),
    $about ? '<span class="about">' . esc_html( $about ) . '</span>' : ''
  );
}
