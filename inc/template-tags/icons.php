<?php
/**
 * Line icons from the svg/icons.svg sprite. The sprite is one cached file,
 * so a page carries only <use> references.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

/**
 * Icon markup. Decorative by default; pass a label when the icon is the
 * only thing that names a control.
 *
 * @param string $name  Symbol id in the sprite.
 * @param string $class Extra classes, for example 'ic-sm'.
 * @param string $label Accessible name, empty for decorative icons.
 */
function get_icon( $name, $class = '', $label = '' ) {
  static $sprite = null;

  if ( null === $sprite ) {
    $sprite = get_theme_file_uri( 'svg/icons.svg' ) . '?v=' . filemtime( get_theme_file_path( 'svg/icons.svg' ) );
  }

  $a11y = '' === $label ? 'aria-hidden="true"' : 'role="img" aria-label="' . esc_attr( $label ) . '"';

  return sprintf(
    '<svg class="%s" %s><use href="%s#%s"></use></svg>',
    esc_attr( trim( 'ic ' . $class ) ),
    $a11y,
    esc_url( $sprite ),
    esc_attr( $name )
  );
}

function the_icon( $name, $class = '', $label = '' ) {
  echo get_icon( $name, $class, $label ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in get_icon()
}

/**
 * The umbrella from the logo, filled, as a standalone mark.
 *
 * @param string $class Classes for the svg.
 */
function the_umbrella( $class = '' ) {
  printf(
    '<svg class="%s" aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a1 1 0 0 0 1 1h8v6a3 3 0 0 0 6 0 1 1 0 0 0-2 0 1 1 0 0 1-2 0v-6h8a1 1 0 0 0 1-1A10 10 0 0 0 12 2zm-7.94 9a8 8 0 0 1 15.88 0z"/></svg>',
    esc_attr( $class )
  );
}
