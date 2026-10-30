<?php
/**
 * @package the-purple-people-eater
 * @Author: Niku Hietanen
 * @Date: 2020-02-18 15:06:45
 * @Last Modified by: Niku Hietanen
 * @Last Modified time: 2020-02-18 15:07:08
 **/

namespace Air_Light;

/**
 * Registers the Your Post Type post type.
 */
class Your_Post_Type extends Post_Type {

  public function register() {

    // Modify all the i18ized strings here.
    $generated_labels = [
      'menu_name'          => __( 'Your Post Type', 'the-purple-people-eater' ),
      'name'               => _x( 'Your Post Types', 'post type general name', 'the-purple-people-eater' ),
      'singular_name'      => _x( 'Your Post Type', 'post type singular name', 'the-purple-people-eater' ),
      'name_admin_bar'     => _x( 'Your Post Type', 'add new on admin bar', 'the-purple-people-eater' ),
      'add_new'            => _x( 'Add New', 'thing', 'the-purple-people-eater' ),
      'add_new_item'       => __( 'Add New Your Post Type', 'the-purple-people-eater' ),
      'new_item'           => __( 'New Your Post Type', 'the-purple-people-eater' ),
      'edit_item'          => __( 'Edit Your Post Type', 'the-purple-people-eater' ),
      'view_item'          => __( 'View Your Post Type', 'the-purple-people-eater' ),
      'all_items'          => __( 'All Your Post Types', 'the-purple-people-eater' ),
      'search_items'       => __( 'Search Your Post Types', 'the-purple-people-eater' ),
      'parent_item_colon'  => __( 'Parent Your Post Types:', 'the-purple-people-eater' ),
      'not_found'          => __( 'No your post types found.', 'the-purple-people-eater' ),
      'not_found_in_trash' => __( 'No your post types found in Trash.', 'the-purple-people-eater' ),
    ];

    // Definition of the post type arguments. For full list see:
    // http://codex.wordpress.org/Function_Reference/register_post_type
    $args = [
      'labels'              => $generated_labels,
      'description'         => '',
      'rewrite'             => [
        'slug' => 'your-post-type',
      ],
      'supports'            => [ 'title', 'editor', 'thumbnail' ],
      'taxonomies'          => [],
      'show_in_menu'        => true,
      'public'              => true,
      'exclude_from_search' => false,
    ];

    $this->register_wp_post_type( $this->slug, $args );
  }
}
