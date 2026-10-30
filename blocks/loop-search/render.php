<?php
/**
 * Main loop for the search view. Renders the shared template part so the classic PHP templates
 * and the block templates output identical markup.
 *
 * @package the-purple-people-eater
 */

\Air_Light\preview_main_query( 'post' );

get_template_part( 'template-parts/loop-search' );
