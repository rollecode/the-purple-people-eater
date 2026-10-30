<?php
/**
 * Main loop for the archive view. Renders the shared template part so the classic PHP templates
 * and the block templates output identical markup.
 *
 * @package minimalistmadness
 */

\Air_Light\preview_main_query( 'post' );

get_template_part( 'template-parts/loop-archive' );
