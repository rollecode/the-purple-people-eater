<?php
/**
 * Side notes for long articles. The first link of a paragraph gets a note
 * in the margin: for a text on this site its date, length and opening, for
 * an outside page its title, site and description. When the text has few
 * links, notes point to older texts on the same subject.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const SIDE_NOTES_MIN_WORDS = 1200;
const SIDE_NOTES_MAX       = 6;
const SIDE_NOTES_FILL      = 3;
const SIDE_NOTES_GAP       = 3;
const SIDE_NOTE_CHARS      = 140;
const SITE_HOST            = 'rollemaa.fi';
const LINK_PREVIEW_KEY     = 'rollemaa_preview_';
const LINK_PREVIEW_EVENT   = 'rollemaa_fetch_preview';
const LINK_PREVIEW_BYTES   = 300000;

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
  $seen  = [];

  $content = preg_replace_callback( '#<p\b[^>]*>.*?</p>#s', function ( $paragraph ) use ( &$count, &$since, &$seen ) {
    $since++;

    if ( $count >= SIDE_NOTES_MAX || $since < SIDE_NOTES_GAP ) {
      return $paragraph[0];
    }

    if ( ! preg_match( '#<a\s[^>]*href="(https?://[^"]+)"[^>]*>.*?</a>#s', $paragraph[0], $link ) ) {
      return $paragraph[0];
    }

    // One note per address, however often the text links to it
    $url = strtok( html_entity_decode( $link[1] ), '#' );
    if ( isset( $seen[ $url ] ) ) {
      return $paragraph[0];
    }

    $seen[ $url ] = true;
    $note         = side_note( $url, $count + 1 );
    if ( ! $note ) {
      return $paragraph[0];
    }

    $count++;
    $since = 0;

    $ref = '<sup class="ref" aria-hidden="true">' . $count . '</sup>';

    return $note . str_replace( $link[0], $link[0] . $ref, $paragraph[0] );
  }, $content );

  if ( $count < SIDE_NOTES_FILL ) {
    $content = renumber_side_notes( add_topic_notes( $content, $count ) );
  }

  return $content;
}

/**
 * Number the notes, and the marks in the text that point to them, in the
 * order they appear.
 *
 * @param string $content Content with notes.
 */
function renumber_side_notes( $content ) {
  preg_match_all( '#<span class="n" aria-hidden="true">(\d+)</span>#', $content, $numbers );
  $order = array_flip( $numbers[1] );

  return preg_replace_callback( '#(<span class="n" aria-hidden="true">|<sup class="ref" aria-hidden="true">)(\d+)<#', function ( $match ) use ( $order ) {
    return $match[1] . ( $order[ $match[2] ] + 1 ) . '<';
  }, $content );
}

/**
 * One note for a link. Nothing for images, files and pages of this site
 * that are not texts.
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

  if ( $post_id && get_the_ID() !== $post_id && 'publish' === get_post_status( $post_id ) ) {
    return post_note( $post_id, $number );
  }

  if ( ! $host || $is_ours ) {
    return '';
  }

  // A bare address says nothing the link doesn't, so wait for the page's title
  $preview = link_preview( $url );
  if ( empty( $preview['title'] ) ) {
    return '';
  }

  return side_note_markup(
    $number,
    $preview['site'] ?? $host,
    $url,
    $preview['title'],
    $preview['text'] ?? ''
  );
}

/**
 * A note about a text on this site.
 *
 * @param int    $post_id Linked post.
 * @param int    $number  Note number.
 * @param string $label   Label, by default by whether it is older or newer.
 */
function post_note( $post_id, $number, $label = '' ) {
  if ( '' === $label ) {
    $label = get_post_time( 'U', true, $post_id ) < get_post_time( 'U', true, get_the_ID() ) ? 'Arkistosta' : 'Lue myös';
  }

  return side_note_markup(
    $number,
    $label,
    get_permalink( $post_id ),
    get_the_title( $post_id ),
    post_excerpt_text( $post_id, 1 ),
    sprintf( '%s, %s', post_date_fi( $post_id ), fi_count( post_words( $post_id ), 'sana', 'sanaa' ) )
  );
}

/**
 * Notes to older texts on the same subject, spread evenly over a text
 * whose own links gave too few notes.
 *
 * @param string $content Content with the link notes.
 * @param int    $count   Notes so far.
 */
function add_topic_notes( $content, $count ) {
  $topics = topic_post_ids( get_the_ID(), SIDE_NOTES_FILL - $count );
  if ( ! $topics ) {
    return $content;
  }

  $paragraphs = preg_match_all( '#<p\b[^>]*>.*?</p>#s', $content );
  $every      = max( SIDE_NOTES_GAP, intdiv( $paragraphs, count( $topics ) + 1 ) );
  $index      = 0;

  return preg_replace_callback( '#<p\b[^>]*>.*?</p>#s', function ( $paragraph ) use ( &$index, &$count, &$topics, $every ) {
    $index++;

    if ( ! $topics || 0 !== $index % $every || false !== strpos( $paragraph[0], 'class="ref"' ) ) {
      return $paragraph[0];
    }

    $count++;

    return post_note( array_shift( $topics ), $count, 'Samasta aiheesta' ) . $paragraph[0];
  }, $content );
}

/**
 * Older posts sharing a keyword, leaving out the ones "Lue myös" shows.
 *
 * @param int $post_id Post.
 * @param int $limit   How many.
 */
function topic_post_ids( $post_id, $limit ) {
  $tags = wp_get_post_tags( $post_id, [ 'fields' => 'ids' ] );
  if ( ! $tags || $limit < 1 ) {
    return [];
  }

  return get_posts( [
    'post_type'      => 'post',
    'fields'         => 'ids',
    'posts_per_page' => $limit,
    'tag__in'        => $tags,
    'post__not_in'   => array_merge( [ $post_id ], related_post_ids( $post_id ) ),
    'date_query'     => [ [ 'before' => get_the_date( 'Y-m-d', $post_id ) ] ],
    'orderby'        => 'comment_count',
    'no_found_rows'  => true,
  ] );
}

/**
 * Note markup.
 *
 * @param int    $number Note number.
 * @param string $label  What kind of note.
 * @param string $url    Link.
 * @param string $title  Link text.
 * @param string $text   A sentence about it.
 * @param string $about  Date and length, for texts on this site.
 */
function side_note_markup( $number, $label, $url, $title, $text = '', $about = '' ) {
  return sprintf(
    '<div class="mnote" role="note"><span class="n" aria-hidden="true">%1$d</span><b>%2$s</b> <a href="%3$s">%4$s</a>%5$s%6$s</div>',
    $number,
    esc_html( $label ),
    esc_url( $url ),
    esc_html( wp_strip_all_tags( $title ) ),
    $about ? '<span class="about">' . esc_html( $about ) . '</span>' : '',
    $text ? '<span class="snippet">' . esc_html( mb_strimwidth( wp_strip_all_tags( $text ), 0, SIDE_NOTE_CHARS, '…' ) ) . '</span>' : ''
  );
}

/**
 * What an outside page says about itself. Pages never wait for it: an
 * unknown address is fetched in the background and shows up on a later
 * visit.
 *
 * @param string $url Page address.
 * @return array{title?:string, site?:string, text?:string}|null
 */
function link_preview( $url ) {
  $preview = get_transient( LINK_PREVIEW_KEY . md5( $url ) );
  if ( false !== $preview ) {
    return $preview;
  }

  if ( ! wp_next_scheduled( LINK_PREVIEW_EVENT, [ $url ] ) ) {
    wp_schedule_single_event( time(), LINK_PREVIEW_EVENT, [ $url ] );
  }

  return null;
}

/**
 * Fetch and keep a page's title, site name and description. Wikipedia
 * gets its own summary, which reads better than its meta tags.
 *
 * @param string $url Page address.
 */
function fetch_link_preview( $url ) {
  $preview = [];

  if ( preg_match( '#^https?://(\w+)\.(?:m\.)?wikipedia\.org/wiki/([^?\#]+)#', $url, $wiki ) ) {
    $response = wp_remote_get( sprintf( 'https://%s.wikipedia.org/api/rest_v1/page/summary/%s', $wiki[1], $wiki[2] ), [ 'timeout' => 5 ] );
    $summary  = is_wp_error( $response ) ? null : json_decode( wp_remote_retrieve_body( $response ), true );

    if ( ! empty( $summary['title'] ) ) {
      $preview = [
        'title' => $summary['title'],
        'site'  => 'Wikipedia',
        'text'  => $summary['extract'] ?? '',
      ];
    }
  } else {
    $response = wp_remote_get( $url, [
      'timeout'             => 5,
      'limit_response_size' => LINK_PREVIEW_BYTES,
      'user-agent'          => 'Mozilla/5.0 (compatible; Rollemaa)',
    ] );

    if ( ! is_wp_error( $response ) && \WP_Http::OK === wp_remote_retrieve_response_code( $response ) ) {
      $preview = page_meta( wp_remote_retrieve_body( $response ) );
    }
  }

  // A failed page is asked again tomorrow, a found one next month
  set_transient( LINK_PREVIEW_KEY . md5( $url ), $preview, $preview ? MONTH_IN_SECONDS : DAY_IN_SECONDS );
}

/**
 * Title, site name and description from a page's head.
 *
 * @param string $html Page.
 */
function page_meta( $html ) {
  $meta = function ( $name ) use ( $html ) {
    if ( preg_match( '#<meta[^>]+(?:property|name)=["\']' . preg_quote( $name, '#' ) . '["\'][^>]+content=["\']([^"\']*)#i', $html, $match )
      || preg_match( '#<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' . preg_quote( $name, '#' ) . '["\']#i', $html, $match ) ) {
      return trim( html_entity_decode( $match[1], ENT_QUOTES, 'UTF-8' ) );
    }

    return '';
  };

  $title = $meta( 'og:title' );
  if ( '' === $title && preg_match( '#<title[^>]*>(.*?)</title>#is', $html, $match ) ) {
    $title = trim( html_entity_decode( $match[1], ENT_QUOTES, 'UTF-8' ) );
  }

  return array_filter( [
    'title' => $title,
    'site'  => $meta( 'og:site_name' ),
    'text'  => $meta( 'og:description' ) ? $meta( 'og:description' ) : $meta( 'description' ),
  ] );
}
