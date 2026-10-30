<?php
/**
 * Main content for the archive-diary view; shares the template part with the
 * classic PHP template so both paths output identical markup.
 *
 * @package the-purple-people-eater
 */

\Air_Light\preview_main_query( 'diary' );

get_template_part( 'template-parts/loop-archive-diary' );
