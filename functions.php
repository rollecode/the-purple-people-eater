<?php
/**
 * The theme is theme.json, templates and patterns. This file only loads the
 * assets; what the site does lives in the rollemaa-site mu-plugin.
 *
 * @package the-purple-people-eater
 */

namespace The_Purple_People_Eater;

const PRELOADED_FONTS = [ 'InstrumentSerif-latin', 'Geist-latin', 'Inter-Bold-latin', 'AtkinsonHyperlegibleNext-latin' ];

add_action( 'after_setup_theme', function () {
  add_editor_style( 'css/site.css' );
} );

add_action( 'wp_enqueue_scripts', function () {
  wp_enqueue_style( 'site', get_theme_file_uri( 'css/site.css' ), [], filemtime( get_theme_file_path( 'css/site.css' ) ) );
  wp_enqueue_script( 'site', get_theme_file_uri( 'js/front-end.js' ), [], filemtime( get_theme_file_path( 'js/front-end.js' ) ), [ 'strategy' => 'defer' ] );
} );

// css/blocks/core-quote.css styles core/quote, and only where a quote renders
add_action( 'init', function () {
  foreach ( glob( get_theme_file_path( 'css/blocks/*.css' ) ) as $file ) {
    $name = basename( $file, '.css' );

    wp_enqueue_block_style( preg_replace( '/-/', '/', $name, 1 ), [
      'handle' => 'theme-' . $name,
      'src'    => get_theme_file_uri( 'css/blocks/' . $name . '.css' ),
      'path'   => $file,
      'ver'    => filemtime( $file ),
    ] );
  }
} );

const BLOCK_STYLES = [
  'core/paragraph' => [ 'boxed' => 'Laatikko' ],
  'core/list'      => [
    'no-bullets'   => 'Ilman listamerkkejä',
    'todo-list'    => 'Todo-lista',
    'green-shades' => 'Vihreät tasot',
    'red-shades'   => 'Punaiset tasot',
  ],
  'core/list-item' => [ 'checked' => 'Tehty tehtävä' ],
];

// Registered here, not in the editor script, so the REST API lists them too
add_action( 'init', function () {
  foreach ( BLOCK_STYLES as $block => $styles ) {
    foreach ( $styles as $name => $label ) {
      register_block_style( $block, [
        'name'  => $name,
        'label' => $label,
      ] );
    }
  }
} );

add_filter( 'wp_preload_resources', function ( $resources ) {
  foreach ( PRELOADED_FONTS as $font ) {
    $resources[] = [
      'href'        => get_theme_file_uri( 'fonts/' . $font . '.woff2' ),
      'as'          => 'font',
      'type'        => 'font/woff2',
      'crossorigin' => 'anonymous',
    ];
  }

  return $resources;
} );

// Before first paint, or the page flashes the wrong theme
add_action( 'wp_head', function () {
  wp_print_inline_script_tag( "try{var t=localStorage.getItem('theme')}catch(e){}document.documentElement.className=(t||matchMedia('(prefers-color-scheme: dark)').matches&&'theme-dark')==='theme-dark'?'theme-dark':'theme-light'" );
  wp_print_script_tag( [
    'defer'       => true,
    'data-domain' => 'rollemaa.fi',
    'src'         => 'https://analytics.dude.fi/js/plausible.js',
  ] );
}, 0 );

add_action( 'enqueue_block_editor_assets', function () {
  wp_enqueue_script( 'theme-editor', get_theme_file_uri( 'js/gutenberg-editor.js' ), [ 'wp-blocks', 'wp-hooks', 'wp-data', 'wp-editor' ], filemtime( get_theme_file_path( 'js/gutenberg-editor.js' ) ), true );
} );

// Texts open in the editor inside their template, as they look on the site
add_filter( 'block_editor_settings_all', function ( $settings, $context ) {
  if ( in_array( $context->post->post_type ?? '', [ 'post', 'page', 'diary' ], true ) ) {
    $settings['defaultRenderingMode'] = 'template-locked';
  }

  return $settings;
}, 10, 2 );
