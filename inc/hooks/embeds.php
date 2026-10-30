<?php
/**
 * Tweets stay as the quotes WordPress saved, styled by the theme: no script
 * from X, so nothing tracks the reader and deleted tweets still read.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

/**
 * Drop X's widget script from embeds and content.
 *
 * @param string $html Markup.
 */
function drop_tweet_script( $html ) {
  return preg_replace( '#<script[^>]*platform\.twitter\.com/widgets\.js[^>]*>\s*</script>#i', '', $html );
}
