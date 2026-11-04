<?php
/**
 * The theme is theme.json, templates and patterns. This file only loads the
 * assets; what the site does lives in the rollemaa-site mu-plugin.
 *
 * @package the-purple-people-eater
 */

namespace The_Purple_People_Eater;

const MODULES_ON_EVERY_PAGE = [ 'lib', 'theme-switch', 'expand', 'nav-current', 'logo-rain', 'phone-menu', 'site-head', 'search' ];
const PRELOADED_FONTS = [ 'InstrumentSerif-latin', 'Geist-latin', 'Inter-Bold-latin', 'AtkinsonHyperlegibleNext-latin' ];

// assets/css/<name>.css in cascade order, each loaded only on the templates it styles. Styles that
// override core block CSS of the same weight stay here, after it, not in assets/css/blocks
const STYLES = [
  'site'      => [ '*' ],
  'pager'     => [ 'index', 'archive', 'search', 'archive-diary', 'front-page' ],
  'article'   => [ 'single' ],
  'rain'      => [ '*' ],
  'search'    => [ '*' ],
  'shelf'     => [ 'front-page', 'page-archive' ],
  'front'     => [ 'front-page' ],
  'picks'     => [ 'front-page', '404' ],
  'listings'  => [ 'index', 'archive', 'search' ],
  'arkisto'   => [ 'page-archive' ],
  'all-posts' => [ 'page-all' ],
  'cover'     => [ 'single', 'archive-diary' ],
  'comments'  => [ 'single', 'single-diary' ],
  'reactions' => [ 'single', 'single-diary', 'archive-diary' ],
  'prose'     => [ 'single', 'single-diary', 'archive-diary', 'page', 'template-info', 'template-no-title' ],
  'diary'     => [ 'archive-diary', 'single-diary' ],
  'heatmap'   => [ 'archive-diary' ],
  'pages'     => [ 'page', 'template-info', 'template-no-title', 'page-all', 'page-archive' ],
  'masthead'  => [ 'template-info' ],
  'notfound'  => [ '404' ],
  'bigsearch' => [ 'search', '404' ],
];

// Only needed once someone opens search or hovers the logo, so they never hold up the page
const ASYNC_STYLES = [ 'rain', 'search' ];

add_action( 'after_setup_theme', function () {
  add_editor_style( array_map( fn( $name ) => 'assets/css/' . $name . '.css', [ ...array_keys( STYLES ), 'editor' ] ) );
} );

add_action( 'wp_enqueue_scripts', function () {
  $here = [ '*', explode( '//', $GLOBALS['_wp_current_template_id'] ?? '' )[1] ?? '' ];

  foreach ( STYLES as $name => $where ) {
    if ( ! array_intersect( $where, $here ) ) {
      continue;
    }

    $file = 'assets/css/' . $name . '.css';
    wp_enqueue_style( 'theme-' . $name, get_theme_file_uri( $file ), [], filemtime( get_theme_file_path( $file ) ), in_array( $name, ASYNC_STYLES, true ) ? 'print' : 'all' );
  }

  foreach ( glob( get_theme_file_path( 'assets/js/modules/*.js' ) ) as $file ) {
    $name = basename( $file, '.js' );

    wp_register_script_module( 'theme/' . $name, get_theme_file_uri( 'assets/js/modules/' . $name . '.js' ), [], filemtime( $file ) );
  }

  $modules = array_map( fn( $file ) => [
    'id'     => 'theme/' . basename( $file, '.js' ),
    'import' => in_array( basename( $file, '.js' ), MODULES_ON_EVERY_PAGE, true ) ? 'static' : 'dynamic',
  ], glob( get_theme_file_path( 'assets/js/modules/*.js' ) ) );

  wp_enqueue_script_module( 'theme/main', get_theme_file_uri( 'assets/js/main.js' ), $modules, filemtime( get_theme_file_path( 'assets/js/main.js' ) ) );

  // Posts from before the block editor still carry the markup of their old themes
  if ( is_singular() && ! has_blocks( get_queried_object() ) ) {
    wp_enqueue_style( 'legacy', get_theme_file_uri( 'assets/css/legacy.css' ), [ 'theme-site' ], filemtime( get_theme_file_path( 'assets/css/legacy.css' ) ) );

    // Their code blocks are plain HTML, so no core/code block loads this
    if ( str_contains( get_queried_object()->post_content, 'wp-block-code' ) ) {
      wp_enqueue_style( 'theme-core-code', get_theme_file_uri( 'assets/css/blocks/core-code.css' ), [ 'theme-site' ], filemtime( get_theme_file_path( 'assets/css/blocks/core-code.css' ) ) );
    }
  }
} );

add_filter( 'style_loader_tag', function ( $tag, $handle ) {
  if ( in_array( substr( $handle, strlen( 'theme-' ) ), ASYNC_STYLES, true ) ) {
    $tag = str_replace( " media='print'", " media='print' onload=\"this.media='all'\"", $tag );
  }

  return $tag;
}, 10, 2 );

// assets/css/blocks/core-quote.css styles core/quote, and only where a quote renders
add_action( 'init', function () {
  foreach ( glob( get_theme_file_path( 'assets/css/blocks/*.css' ) ) as $file ) {
    $name = basename( $file, '.css' );

    wp_enqueue_block_style( preg_replace( '/-/', '/', $name, 1 ), [
      'handle' => 'theme-' . $name,
      'src'    => get_theme_file_uri( 'assets/css/blocks/' . $name . '.css' ),
      'path'   => $file,
      'ver'    => filemtime( $file ),
    ] );
  }
} );

const CALLOUT_STYLES = [
  'callout-info'     => 'Info',
  'callout-warning'  => 'Varoitus',
  'callout-critical' => 'Kriittinen',
];

const BLOCK_STYLES = [
  'core/paragraph' => [ 'boxed' => 'Laatikko' ] + CALLOUT_STYLES,
  'core/group'     => CALLOUT_STYLES,
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

// theme.json can hide core's default presets but not stop printing them; no text uses them
add_filter( 'wp_theme_json_data_default', function ( $theme_json ) {
  $data = $theme_json->get_data();

  unset( $data['settings']['color']['palette'], $data['settings']['color']['gradients'], $data['settings']['color']['duotone'], $data['settings']['typography']['fontSizes'], $data['settings']['spacing']['spacingSizes'], $data['settings']['shadow']['presets'], $data['settings']['dimensions']['aspectRatios'] );

  return new \WP_Theme_JSON_Data( $data, 'default' );
} );

add_filter( 'wp_preload_resources', function ( $resources ) {
  foreach ( PRELOADED_FONTS as $font ) {
    $resources[] = [
      'href'        => get_theme_file_uri( 'assets/fonts/' . $font . '.woff2' ),
      'as'          => 'font',
      'type'        => 'font/woff2',
      'crossorigin' => 'anonymous',
    ];
  }

  return $resources;
} );

// The sprite is cached for a year, so a new icon needs a new URL
add_filter( 'theme_file_uri', function ( $url, $file ) {
  return 'assets/svg/icons.svg' === $file ? $url . '?ver=' . filemtime( get_theme_file_path( $file ) ) : $url;
}, 10, 2 );

// The logo umbrella as it tilts on hover. The Site Icon stays for the fediverse profile and wp-admin
remove_action( 'wp_head', 'wp_site_icon', 99 );

add_action( 'wp_head', function () {
  printf( '<link rel="icon" href="%s" sizes="32x32">' . "\n", esc_url( get_theme_file_uri( 'assets/images/favicon.png' ) ) );
  printf( '<link rel="icon" href="%s" type="image/svg+xml">' . "\n", esc_url( get_theme_file_uri( 'assets/images/favicon.svg' ) ) );
  printf( '<link rel="apple-touch-icon" href="%s">' . "\n", esc_url( get_theme_file_uri( 'assets/images/apple-touch-icon.png' ) ) );
} );

// Before first paint, or the page flashes the wrong theme
add_action( 'wp_head', function () {
  $nineties = get_theme_file_uri( 'assets/css/90s.css' ) . '?ver=' . filemtime( get_theme_file_path( 'assets/css/90s.css' ) );
  wp_print_inline_script_tag( "try{var t=localStorage.getItem('theme')}catch(e){}var d=document.documentElement;d.dataset.nineties='" . esc_js( $nineties ) . "';if('theme-90s'===t){d.className=t;document.write('<link rel=\"stylesheet\" data-nineties href=\"'+d.dataset.nineties+'\">')}else{d.className=(t||matchMedia('(prefers-color-scheme: dark)').matches&&'theme-dark')==='theme-dark'?'theme-dark':'theme-light'}" );
  wp_print_script_tag( [
    'defer'       => true,
    'data-domain' => 'rollemaa.fi',
    'src'         => 'https://analytics.dude.fi/js/plausible.js',
  ] );
}, 0 );

add_action( 'enqueue_block_editor_assets', function () {
  foreach ( glob( get_theme_file_path( 'assets/js/editor/*.js' ) ) as $file ) {
    $name = basename( $file, '.js' );

    wp_enqueue_script( 'theme-editor-' . $name, get_theme_file_uri( 'assets/js/editor/' . $name . '.js' ), [ 'wp-block-editor', 'wp-blocks', 'wp-compose', 'wp-hooks', 'wp-data', 'wp-editor', 'wp-plugins', 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-rich-text' ], filemtime( $file ), true );
  }
} );

// Texts open in the editor inside their template, as they look on the site
add_filter( 'block_editor_settings_all', function ( $settings, $context ) {
  if ( in_array( $context->post->post_type ?? '', [ 'post', 'page', 'diary' ], true ) ) {
    $settings['defaultRenderingMode'] = 'template-locked';
  }

  return $settings;
}, 10, 2 );
