<?php
/**
 * Who wrote the text, when and how it was received.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( get_post() ) {
  get_template_part( 'template-parts/byline', null, [ 'responses' => post_responses( get_the_ID() ) ] );
}
