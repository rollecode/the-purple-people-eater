<?php
/**
 * The written excerpt, nothing when there is none.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( has_excerpt() ) {
  printf( '<p %s>%s</p>', get_block_wrapper_attributes(), esc_html( get_the_excerpt() ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
