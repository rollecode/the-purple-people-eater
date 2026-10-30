<?php
/**
 * The title for screen readers on a page that hides it.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

if ( get_post() && ! page_has_own_title() ) {
  printf( '<h1 class="screen-reader-text">%s</h1>', esc_html( get_the_title() ) );
}
