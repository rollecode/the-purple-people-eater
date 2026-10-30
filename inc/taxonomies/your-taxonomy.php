<?php
/**
 * @package the-purple-people-eater
 * @Author: Niku Hietanen
 * @Date: 2020-02-18 15:05:35
 * @Last Modified by: Niku Hietanen
 * @Last Modified time: 2020-02-18 15:06:07
 */

namespace Air_Light;

/**
 * Registers the Your Taxonomy taxonomy.
 *
 * @param Array $post_types Optional. Post types in
 * which the taxonomy should be registered.
 */
class Your_Taxonomy extends Taxonomy {


  public function register( array $post_types = [] ) {
    // Taxonomy labels.
    $labels = [
      'name'                  => _x( 'Your Taxonomies', 'Taxonomy plural name', 'the-purple-people-eater' ),
      'singular_name'         => _x( 'Your Taxonomy', 'Taxonomy singular name', 'the-purple-people-eater' ),
      'search_items'          => __( 'Search Your Taxonomies', 'the-purple-people-eater' ),
      'popular_items'         => __( 'Popular Your Taxonomies', 'the-purple-people-eater' ),
      'all_items'             => __( 'All Your Taxonomies', 'the-purple-people-eater' ),
      'parent_item'           => __( 'Parent Your Taxonomy', 'the-purple-people-eater' ),
      'parent_item_colon'     => __( 'Parent Your Taxonomy', 'the-purple-people-eater' ),
      'edit_item'             => __( 'Edit Your Taxonomy', 'the-purple-people-eater' ),
      'update_item'           => __( 'Update Your Taxonomy', 'the-purple-people-eater' ),
      'add_new_item'          => __( 'Add New Your Taxonomy', 'the-purple-people-eater' ),
      'new_item_name'         => __( 'New Your Taxonomy', 'the-purple-people-eater' ),
      'add_or_remove_items'   => __( 'Add or remove Your Taxonomies', 'the-purple-people-eater' ),
      'choose_from_most_used' => __( 'Choose from most used Taxonomies', 'the-purple-people-eater' ),
      'menu_name'             => __( 'Your Taxonomy', 'the-purple-people-eater' ),
    ];

    $args = [
      'labels'            => $labels,
      'public'            => true,
      'show_in_nav_menus' => true,
      'show_admin_column' => true,
      'hierarchical'      => false,
      'show_tagcloud'     => true,
      'show_ui'           => true,
      'query_var'         => true,
      'rewrite'           => [
        'slug' => 'your-taxonomy',
      ],
      'query_var'         => true,
    ];

    $this->register_wp_taxonomy( $this->slug, $post_types, $args );
  }

}
