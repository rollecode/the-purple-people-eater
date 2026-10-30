<?php
/**
 * Lokikirja: the day's date in words, the day's measures and conditions,
 * and the icons for them.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const DIARY_HABITS_TOTAL  = 10;
const DIARY_SCALE_LOW     = 40;
const DIARY_SCALE_HIGH    = 60;
const DIARY_INVERTED      = [ 'Ahdistus' ];
const YEAR_AGO_OPEN_WORDS = 160;

/**
 * "Sunnuntaina 25. lokakuuta 2026": weekday in the essive, month in the
 * partitive, the way the diary has always dated its days.
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function diary_long_date( $post = null ) {
  global $wp_locale;

  // The month from the locale's plain list: 'j. F' would get core's genitive.
  $month = $wp_locale->get_month( get_the_time( 'm', $post ) );

  return ucfirst( get_the_time( 'l', $post ) ) . 'na ' . get_the_time( 'j', $post ) . '. ' . $month . 'ta ' . get_the_time( 'Y', $post );
}

/**
 * Time of writing as "kello 19.32".
 *
 * @param int|\WP_Post|null $post Post, current post by default.
 */
function diary_time( $post = null ) {
  return 'kello ' . get_the_time( 'G.i', $post );
}

/**
 * An icon file from svg/, inline, for the diary's per-value icons (moods,
 * devices, weather, drinks). Nothing when there is no such icon.
 *
 * @param string $name File name without .svg.
 */
function the_diary_icon( $name ) {
  $name = sanitize_file_name( (string) $name );
  $file = get_theme_file_path( 'svg/' . $name . '.svg' );

  if ( '' === $name || ! is_readable( $file ) ) {
    return;
  }

  echo preg_replace( '/<svg\b/', '<svg class="ic" aria-hidden="true" focusable="false"', file_get_contents( $file ), 1 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- theme's own SVG files
}

/**
 * The day's measures in percent, in a fixed order, only those recorded.
 *
 * @param int $post_id Diary entry ID.
 * @return array<string, int> Label => percent.
 */
function diary_scales( $post_id ) {
  $habits = get_post_meta( $post_id, 'habits_percent', true );

  if ( '' === $habits ) {
    $checked = get_post_meta( $post_id, 'habits', true );
    $habits  = is_array( $checked ) && $checked ? count( $checked ) / DIARY_HABITS_TOTAL * 100 : '';
  }

  $scales = [
    'Päivätavoitteet' => $habits,
    'Mieliala'        => get_post_meta( $post_id, 'mood_scale', true ),
    'Energia'         => get_post_meta( $post_id, 'energy_scale', true ),
    'Ahdistus'        => get_post_meta( $post_id, 'anxiety_scale', true ),
    'Tuottavuus'      => get_post_meta( $post_id, 'productivity_scale', true ),
  ];

  // An empty or zero value means the measure was not recorded that day
  return array_map( 'intval', array_filter( $scales ) );
}

/**
 * How a measure went: 'low', 'mid' or 'high', where high is a good day.
 * For anxiety a low value is the good one.
 *
 * @param string $label Measure name from diary_scales().
 * @param int    $value Percent.
 */
function diary_scale_tone( $label, $value ) {
  $tone = $value <= DIARY_SCALE_LOW ? 'low' : ( $value <= DIARY_SCALE_HIGH ? 'mid' : 'high' );

  if ( in_array( $label, DIARY_INVERTED, true ) ) {
    $tone = [ 'low' => 'high', 'mid' => 'mid', 'high' => 'low' ][ $tone ];
  }

  return $tone;
}

/**
 * The day's conditions: mood, device, weather, place, music, drink and the
 * highlight, each with its icon, only those recorded.
 *
 * @param int $post_id Diary entry ID.
 * @return array<int, array{icon:string, text:string, url?:string}>
 */
function diary_conditions( $post_id ) {
  $meta       = function ( $key ) use ( $post_id ) {
    return trim( (string) get_post_meta( $post_id, $key, true ) );
  };
  $conditions = [];

  if ( $meta( 'mood' ) ) {
    $conditions[] = [ 'icon' => $meta( 'mood' ), 'text' => diary_meta_label( 'mood', $meta( 'mood' ) ) ];
  }

  if ( $meta( 'device' ) ) {
    $conditions[] = [ 'icon' => $meta( 'device' ), 'text' => diary_meta_label( 'device', $meta( 'device' ) ) ];
  }

  if ( $meta( 'weather_text' ) ) {
    $conditions[] = [ 'icon' => $meta( 'weather_icon' ), 'text' => trim( diary_temperature( $meta( 'temperature' ) ) . ' ' . $meta( 'weather_text' ) ) ];
  }

  if ( $meta( 'location' ) ) {
    $conditions[] = [ 'icon' => 'location', 'text' => $meta( 'location' ) ];
  }

  if ( $meta( 'np' ) ) {
    $conditions[] = [ 'icon' => 'np', 'text' => $meta( 'np' ), 'url' => $meta( 'np_link' ) ];
  }

  if ( $meta( 'drink_text' ) ) {
    $conditions[] = [ 'icon' => $meta( 'drink_icon' ), 'text' => $meta( 'drink_text' ) ];
  }

  if ( $meta( 'highlight' ) ) {
    $conditions[] = [ 'icon' => 'highlight', 'text' => 'Päivän kohokohta: ' . $meta( 'highlight' ) ];
  }

  return $conditions;
}

/**
 * Temperature the Finnish way, "9,3 °C". Entries store it as typed or as
 * fetched ("23.50", "9.3°C"); anything that is not a number stays as is.
 *
 * @param string $value Stored temperature.
 */
function diary_temperature( $value ) {
  if ( ! preg_match( '/^(-?\d+(?:[.,]\d+)?)\s*°?\s*C?$/u', trim( $value ), $match ) ) {
    return $value;
  }

  return number_format( round( (float) str_replace( ',', '.', $match[1] ), 1 ), 1, ',', '' ) . ' °C';
}
