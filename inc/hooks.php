<?php
/**
 * Hooks
 *
 * All hooks that are run in the theme are listed here
 *
 * @Author:		Roni Laukkarinen
 * @Date:   		2022-09-19 11:07:30
 * @Last Modified by:   Roni Laukkarinen
 * @Last Modified time: 2022-11-01 11:21:48
 *
 * @package minimalistmadness
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 */

namespace Air_Light;

/**
 * General hooks
 */
require get_theme_file_path( 'inc/hooks/general.php' );
add_action( 'widgets_init', __NAMESPACE__ . '\widgets_init' );
add_action( 'template_redirect', __NAMESPACE__ . '\redirect_to_random_post', 0 );

// Comments arrive only as fediverse replies, so WordPress' own form stays shut
add_filter( 'comments_open', '__return_false' );

/**
 * Site-wide counts and the main navigation
 */
require get_theme_file_path( 'inc/hooks/site-stats.php' );
require get_theme_file_path( 'inc/hooks/navigation.php' );

/**
 * Tweets without X's script
 */
require get_theme_file_path( 'inc/hooks/embeds.php' );
add_filter( 'embed_oembed_html', __NAMESPACE__ . '\drop_tweet_script' );
add_filter( 'the_content', __NAMESPACE__ . '\drop_tweet_script', 30 );

/**
 * Names for unnamed frames and image links in content
 */
require get_theme_file_path( 'inc/hooks/accessibility.php' );
add_filter( 'embed_oembed_html', __NAMESPACE__ . '\title_embed_frames' );
add_filter( 'the_content', __NAMESPACE__ . '\title_embed_frames', 30 );
add_filter( 'the_content', __NAMESPACE__ . '\name_image_links', 30 );

/**
 * Side notes in the margin of long articles
 */
require get_theme_file_path( 'inc/hooks/side-notes.php' );
add_filter( 'the_content', __NAMESPACE__ . '\add_side_notes', 20 );
add_action( LINK_PREVIEW_EVENT, __NAMESPACE__ . '\fetch_link_preview' );

/**
 * Scripts and styles associated hooks
 */
require get_theme_file_path( 'inc/hooks/scripts-styles.php' );
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\enqueue_theme_scripts' );

/**
 * Performance associated hooks
 */
require get_theme_file_path( 'inc/hooks/performance.php' );

/**
 * Theme blocks and the shared head script
 */
require get_theme_file_path( 'inc/hooks/blocks.php' );
add_action( 'init', __NAMESPACE__ . '\register_theme_blocks' );
add_action( 'wp_head', __NAMESPACE__ . '\print_theme_prepaint_script', 0 );

/**
 * Diary metadata (core-native replacement for ACF)
 */
require get_theme_file_path( 'inc/hooks/diary-meta.php' );
add_action( 'init', __NAMESPACE__ . '\register_diary_meta' );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_diary_meta_panel' );

/**
 * Diary REST API for the MCP server
 */
require get_theme_file_path( 'inc/hooks/diary-api.php' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_diary_api' );

/**
 * Gutenberg associated hooks
 */
require get_theme_file_path( 'inc/hooks/gutenberg.php' );
add_filter( 'allowed_block_types_all', __NAMESPACE__ . '\allowed_block_types', 10, 2 );
add_filter( 'use_block_editor_for_post_type', __NAMESPACE__ . '\use_block_editor_for_post_type', 10, 2 );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\register_block_editor_assets' );
add_action( 'after_setup_theme', __NAMESPACE__ . '\add_editor_stylesheets' );
add_filter( 'block_editor_settings_all', __NAMESPACE__ . '\show_template_in_editor', 10, 2 );
add_filter( 'render_block_core/post-title', __NAMESPACE__ . '\render_display_title' );
add_filter( 'render_block_core/post-content', __NAMESPACE__ . '\render_text' );
add_filter( 'render_block_core/post-featured-image', __NAMESPACE__ . '\render_hero_image' );

/**
 * Front page endpoints: more cards, random picks, the "Nyt" panel
 */
require get_theme_file_path( 'inc/hooks/rest-api.php' );
require get_theme_file_path( 'inc/hooks/now.php' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_feed_api' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_now_api' );

/**
 * Most read posts
 */
require get_theme_file_path( 'inc/hooks/most-read.php' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_most_read_api' );

/**
 * Algolia search index sync
 */
require get_theme_file_path( 'inc/hooks/algolia.php' );
require get_theme_file_path( 'inc/hooks/related-posts.php' );
add_action( 'wp_after_insert_post', __NAMESPACE__ . '\algolia_sync_post', 10, 2 );
add_action( 'before_delete_post', __NAMESPACE__ . '\algolia_sync_deleted', 10, 2 );
if ( defined( 'WP_CLI' ) && WP_CLI ) {
  \WP_CLI::add_command( 'rollemaa-algolia reindex', __NAMESPACE__ . '\algolia_reindex' );
}

/**
 * Add required attributes to Gravity Forms fields to enable native validation
 */
add_filter( 'gform_field_content', __NAMESPACE__ . '\add_custom_attr', 10, 5 );
function add_custom_attr( $field_content, $field, $value, $form_id ) {

  // Add type attribute to file upload button, otherwise it tries to send
  if ( 'fileupload' === $field->type ) {
    $field_content = str_replace( '<button', '<button type="button"', $field_content );
  }

  // Add required to get native HTML validation instead of GF jQuery version
  if ( true === $field->isRequired ) { // phpcs:ignore
    $field_content = str_replace( 'type=', 'required type=', $field_content );
  }

  return $field_content;
 }

/**
 * Change gravity forms input to button that validates natively (remove onclick and onkeypress events)
 */
add_filter( 'gform_submit_button', __NAMESPACE__ . '\form_submit_button', 10, 2 );
function form_submit_button( $button, $form ) {
  return "<button type='submit' class='button gform_button' id='gform_submit_button_{$form['id']}'>Lähetä</button>";
}

/**
* Gravity Forms Scroll To Anchor Tag
*
* @link https://docs.gravityforms.com/gform_confirmation_anchor/
*/
add_filter( 'gform_confirmation_anchor', '__return_true' );
