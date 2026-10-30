<?php
/**
 * Advertisement post type
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

/**
 * Registers the Your Post Type post type.
 */
class Diary extends Post_Type {

  public function register() {

    // Modify all the i18ized strings here.
    $generated_labels = [
      'name'                  => _x( 'Lokikirja', 'Post Type General Name', 'the-purple-people-eater' ),
      'singular_name'         => _x( 'Lokikirja', 'Post Type Singular Name', 'the-purple-people-eater' ),
      'menu_name'             => __( 'Lokikirja', 'the-purple-people-eater' ),
      'name_admin_bar'        => __( 'Lokikirja', 'the-purple-people-eater' ),
      'archives'              => __( 'Lokikirja', 'the-purple-people-eater' ),
      'attributes'            => __( 'Lokikirjan attribuutit', 'the-purple-people-eater' ),
      'parent_item_colon'     => __( 'Pääasiallinen merkintä:', 'the-purple-people-eater' ),
      'all_items'             => __( 'Kaikki merkinnät', 'the-purple-people-eater' ),
      'add_new_item'          => __( 'Lisää merkintä', 'the-purple-people-eater' ),
      'add_new'               => __( 'Lisää merkintä', 'the-purple-people-eater' ),
      'new_item'              => __( 'Uusi merkintä', 'the-purple-people-eater' ),
      'edit_item'             => __( 'Muokkaa merkintää', 'the-purple-people-eater' ),
      'update_item'           => __( 'Päivitä merkintää', 'the-purple-people-eater' ),
      'view_item'             => __( 'Katso merkintä', 'the-purple-people-eater' ),
      'view_items'            => __( 'Katso lokikirjamerkintöjä', 'the-purple-people-eater' ),
      'search_items'          => __( 'Etsi lokikirjamerkintöjä', 'the-purple-people-eater' ),
      'not_found'             => __( 'Merkintöjä ei löytynyt.', 'the-purple-people-eater' ),
      'not_found_in_trash'    => __( 'Merkintöjä ei löytynyt.', 'the-purple-people-eater' ),
      'featured_image'        => __( 'Artikkelikuva', 'the-purple-people-eater' ),
      'set_featured_image'    => __( 'Aseta artikkelikuva', 'the-purple-people-eater' ),
      'remove_featured_image' => __( 'Poista artikkelikuva', 'the-purple-people-eater' ),
      'use_featured_image'    => __( 'Käytä artikkelikuvana', 'the-purple-people-eater' ),
      'insert_into_item'      => __( 'Lisää kohteeseen', 'the-purple-people-eater' ),
      'uploaded_to_this_item' => __( 'Lisätty kohteeseen', 'the-purple-people-eater' ),
      'items_list'            => __( 'merkinnät', 'the-purple-people-eater' ),
      'items_list_navigation' => __( 'Merkintöjen selaus', 'the-purple-people-eater' ),
      'filter_items_list'     => __( 'Suodata merkintöjä', 'the-purple-people-eater' ),
    ];

    // Definition of the post type arguments. For full list see:
    // http://codex.wordpress.org/Function_Reference/register_post_type
    $args = [
      'rewrite' => [
        'slug'       => 'lokikirja',
        'with_front' => false,
        'pages'      => true,
        'feeds'      => true,
      ],
      'paged'                 => ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1,
      'label'                 => __( 'Lokikirja', 'the-purple-people-eater' ),
      'description'           => __( 'Merkinnät', 'the-purple-people-eater' ),
      'labels'                => $generated_labels,
      'supports'              => array( 'title', 'editor', 'author', 'revisions', 'post-formats', 'thumbnail', 'custom-fields' ),
      'hierarchical'          => false,
      'public'                => true,
      'show_ui'               => true,
      'show_in_menu'          => true,
      'show_in_rest'          => true,
      'menu_position'         => 1,
      'menu_icon'             => 'data:image/svg+xml;base64,' . base64_encode( '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path fill="currentColor" d="M24 6.278l-11.16 12.722-6.84-6 1.319-1.49 5.341 4.686 9.865-11.196 1.475 1.278zm-22.681 5.232l6.835 6.01-1.314 1.48-6.84-6 1.319-1.49zm9.278.218l5.921-6.728 1.482 1.285-5.921 6.756-1.482-1.313z"/></svg>' ), // phpcs:ignore
      'show_in_admin_bar'     => true,
      'show_in_nav_menus'     => true,
      'can_export'            => true,
      'has_archive'           => true,
      'exclude_from_search'   => false,
      'publicly_queryable'    => true,
      'capability_type'       => 'post',
    ];

    $this->register_wp_post_type( $this->slug, $args );
  }
}
