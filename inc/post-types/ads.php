<?php
/**
 * Advertisement post type
 *
 * @package the-purple-people-eater
 */

// Register Custom Post Type
function ads() {

  $labels = array(
    'name'                  => _x( 'Mainokset', 'Post Type General Name', 'the-purple-people-eater' ),
    'singular_name'         => _x( 'Mainos', 'Post Type Singular Name', 'the-purple-people-eater' ),
    'menu_name'             => __( 'Mainokset', 'the-purple-people-eater' ),
    'name_admin_bar'        => __( 'Mainokset', 'the-purple-people-eater' ),
    'archives'              => __( 'Mainos-arkistot', 'the-purple-people-eater' ),
    'attributes'            => __( 'Mainoksen attribuutit', 'the-purple-people-eater' ),
    'parent_item_colon'     => __( 'Isäntämainos:', 'the-purple-people-eater' ),
    'all_items'             => __( 'Kaikki mainokset', 'the-purple-people-eater' ),
    'add_new_item'          => __( 'Lisää mainos', 'the-purple-people-eater' ),
    'add_new'               => __( 'Lisää mainos', 'the-purple-people-eater' ),
    'new_item'              => __( 'Uusi mainos', 'the-purple-people-eater' ),
    'edit_item'             => __( 'Muokkaa mainosta', 'the-purple-people-eater' ),
    'update_item'           => __( 'Päivitä mainos', 'the-purple-people-eater' ),
    'view_item'             => __( 'Katso mainos', 'the-purple-people-eater' ),
    'view_items'            => __( 'Katso mainoksia', 'the-purple-people-eater' ),
    'search_items'          => __( 'Etsi mainos', 'the-purple-people-eater' ),
    'not_found'             => __( 'Ei löydy', 'the-purple-people-eater' ),
    'not_found_in_trash'    => __( 'Ei löydy roskista', 'the-purple-people-eater' ),
    'featured_image'        => __( 'Artikkelikuva', 'the-purple-people-eater' ),
    'set_featured_image'    => __( 'Aseta artikkelikuva', 'the-purple-people-eater' ),
    'remove_featured_image' => __( 'Poista artikkelikuva', 'the-purple-people-eater' ),
    'use_featured_image'    => __( 'Käytä artikkelikuvana', 'the-purple-people-eater' ),
    'insert_into_item'      => __( 'Lisää kohteeseen', 'the-purple-people-eater' ),
    'uploaded_to_this_item' => __( 'Lisätty kohteeseen', 'the-purple-people-eater' ),
    'items_list'            => __( 'Mainoslista', 'the-purple-people-eater' ),
    'items_list_navigation' => __( 'Mainoslistan navigointi', 'the-purple-people-eater' ),
    'filter_items_list'     => __( 'Suodata listaa', 'the-purple-people-eater' ),
  );
  $args = array(
    'label'                 => __( 'Mainos', 'the-purple-people-eater' ),
    'description'           => __( 'Ad slots', 'the-purple-people-eater' ),
    'labels'                => $labels,
    'supports'              => array( 'title', 'revisions', 'post-formats', 'custom-fields' ),
    'hierarchical'          => false,
    'public'                => false,
    'show_ui'               => true,
    'show_in_menu'          => true,
    'menu_position'         => 5,
    'menu_icon'             => 'dashicons-forms',
    'show_in_admin_bar'     => true,
    'show_in_nav_menus'     => true,
    'can_export'            => true,
    'has_archive'           => false,
    'exclude_from_search'   => false,
    'publicly_queryable'    => false,
    'capability_type'       => 'page',
  );
  register_post_type( 'ads', $args );

}
add_action( 'init', 'ads', 0 );
