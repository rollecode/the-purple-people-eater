<?php
/**
 * What follows an article.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( get_post() ) {
  edit_post_link( 'Muokkaa', '<p class="edit-link">', '</p>' );
  get_template_part( 'template-parts/endmatter', null, [ 'responses' => post_responses( get_the_ID() ) ] );
}
