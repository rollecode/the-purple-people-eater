<?php
/**
 * The conversation under a text.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

if ( get_post() && ( is_federated() || post_responses( get_the_ID() )['comments'] ) ) {
  // comments_template() also has to run in the editor preview
  $GLOBALS['withcomments'] = true;
  comments_template();
}
