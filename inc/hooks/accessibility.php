<?php
/**
 * Names for things the content leaves unnamed: embedded frames and images
 * that are links but have no alt text.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

/**
 * Give embedded frames a title from the site they come from. Runs on oEmbed
 * output and on the content, which has frames pasted in by hand too.
 *
 * @param string $html Markup with frames.
 */
function title_embed_frames( $html ) {
  $tags = new \WP_HTML_Tag_Processor( $html );

  while ( $tags->next_tag( 'iframe' ) ) {
    if ( $tags->get_attribute( 'title' ) ) {
      continue;
    }

    $host = preg_replace( '/^www\./', '', (string) wp_parse_url( (string) $tags->get_attribute( 'src' ), PHP_URL_HOST ) );
    $tags->set_attribute( 'title', '' === $host ? 'Upotus' : 'Upotus: ' . $host );
  }

  return $tags->get_updated_html();
}

/**
 * A linked image without alt text leaves the link nameless; name it.
 *
 * @param string $content Rendered post content.
 */
function name_image_links( $content ) {
  return preg_replace_callback( '#<a\b([^>]*)>(\s*<img\b[^>]*\balt=""[^>]*>\s*)</a>#i', function ( $match ) {
    if ( false !== stripos( $match[1], 'aria-label' ) ) {
      return $match[0];
    }

    $label = preg_match( '/href="[^"]+\.(jpe?g|png|gif|webp|avif)"/i', $match[1] ) ? 'Kuva isompana' : 'Kuvan linkki';

    return '<a' . $match[1] . ' aria-label="' . esc_attr( $label ) . '">' . $match[2] . '</a>';
  }, $content );
}
