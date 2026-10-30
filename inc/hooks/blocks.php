<?php
/**
 * Theme blocks and the head script shared by classic and block template
 * rendering paths.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

/**
 * Register the theme's dynamic blocks: every block.json under blocks/,
 * server rendered, no build step.
 */
function register_theme_blocks() {
  foreach ( glob( get_theme_file_path( 'blocks/*/block.json' ) ) as $block ) {
    register_block_type( $block );
  }
}

/**
 * Listing blocks read the main query, which the editor's preview request
 * doesn't have.
 *
 * @param string $post_type Post type to list.
 */
function preview_main_query( $post_type ) {
  if ( wp_is_serving_rest_request() ) {
    $GLOBALS['wp_query'] = new \WP_Query( [ 'post_type' => $post_type, 'posts_per_page' => 10 ] );
  }
}

/**
 * Core post blocks carry the text in the templates, so the post editor shows
 * the real page. These keep their output the same as the site's own markup.
 */
function render_display_title( $html ) {
  return preg_replace_callback( '#(<h1[^>]*>).*?(</h1>)#s', function ( $match ) {
    return $match[1] . wp_kses_post( display_title() ) . $match[2];
  }, $html );
}

/**
 * Legacy class and page links for the text.
 *
 * @param string $html Block output.
 */
function render_text( $html ) {
  if ( ! has_blocks() ) {
    $tags = new \WP_HTML_Tag_Processor( $html );
    $tags->next_tag();
    $tags->add_class( 'legacy' );
    $html = $tags->get_updated_html();
  }

  return $html . wp_link_pages( [
    'before' => '<nav class="page-links meta-text" aria-label="Kirjoituksen sivut">',
    'after'  => '</nav>',
    'echo'   => false,
  ] );
}

/**
 * The hero photo is the first thing on the page and decorative: the title
 * lies on it.
 *
 * @param string $html Block output.
 */
function render_hero_image( $html ) {
  $tags = new \WP_HTML_Tag_Processor( $html );

  if ( $tags->next_tag( 'img' ) ) {
    $tags->set_attribute( 'alt', '' );
    $tags->set_attribute( 'loading', 'eager' );
    $tags->set_attribute( 'fetchpriority', 'high' );
    $tags->set_attribute( 'sizes', '100vw' );
  }

  return $tags->get_updated_html();
}

/**
 * Open posts in the editor with their template around them.
 *
 * @param array                    $settings Editor settings.
 * @param \WP_Block_Editor_Context $context  Editor context.
 */
function show_template_in_editor( $settings, $context ) {
  if ( ! empty( $context->post ) && in_array( $context->post->post_type, [ 'post', 'page', 'diary' ], true ) ) {
    $settings['defaultRenderingMode'] = 'template-locked';
  }

  return $settings;
}

/**
 * Apply the dark/light theme class before first paint to avoid a flash of
 * the wrong theme. Printed at the very top of <head> on both rendering
 * paths (classic header.php and the block template canvas).
 */
function print_theme_prepaint_script() {
  ?>
  <script>
    (function () {
      var theme = null;
      try {
        theme = localStorage.getItem('theme');
      } catch (error) {}
      if (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'theme-dark';
      }
      document.documentElement.className = 'theme-dark' === theme ? 'theme-dark' : 'theme-light';
    })();
  </script>
  <script defer data-domain="rollemaa.fi" src="https://analytics.dude.fi/js/plausible.js"></script>
  <?php
}
