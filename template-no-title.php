<?php
/**
 * A page whose title stays out of sight: the content opens itself.
 *
 * Template Name: Ei otsikkoa
 *
 * @package minimalistmadness
 */

namespace Air_Light;

the_post();
get_header();

get_template_part( 'template-parts/loop-page' );

get_footer();
