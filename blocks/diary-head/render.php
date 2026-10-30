<?php
/**
 * A day's head: the diary's mark and the date.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( get_post() ) {
  get_template_part( 'template-parts/diary-head' );
}
