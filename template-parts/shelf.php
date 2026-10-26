<?php
/**
 * The shelf: one spine per year. Height follows the number of articles,
 * width the number of words. A year with no articles but a diary shows a
 * lighter spine that leads to the diary.
 *
 * $args['height'] is the tallest spine in pixels.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$max_height = (int) ( $args['height'] ?? 150 );
$years      = site_stats()['years'];

if ( empty( $years ) ) {
  return;
}

$most_posts = max( 1, ...array_column( $years, 'posts' ) );
$spines     = 0;
?>
<ol class="shelf" aria-label="Kirjoitukset vuosittain">
  <?php
  foreach ( $years as $year => $count ) :
    if ( $count['posts'] ) {
      $tone   = SHELF_TONES[ $spines % count( SHELF_TONES ) ];
      $height = round( $max_height * .38 + $count['posts'] / $most_posts * $max_height * .62 );
      $number = $count['posts'];
      $label  = sprintf( '%d: %d kirjoitusta', $year, $count['posts'] );
      $url    = get_year_link( $year );
      $words  = $count['post_words'];
    } elseif ( $count['diary'] ) {
      $tone   = 'S';
      $height = round( $max_height * .6 );
      $number = $count['diary'];
      $label  = sprintf( '%d: lokikirjassa %d päivää', $year, $count['diary'] );
      $url    = home_url( 'lokikirja/' . $year . '/' );
      $words  = $count['diary_words'];
    } else {
      continue;
    }

    $spines++;
    ?>
    <li class="vol" style="--w: <?php echo esc_attr( 40 + round( $words / 1000 ) ); ?>; --h: <?php echo esc_attr( $height ); ?>px">
      <a href="<?php echo esc_url( $url ); ?>" aria-label="<?php echo esc_attr( $label ); ?>">
        <span class="sp <?php echo esc_attr( $tone ); ?>"><span class="n"><?php echo esc_html( $number ); ?></span></span>
        <span class="pl"></span>
        <span class="y"><?php echo esc_html( $year ); ?></span>
      </a>
    </li>
  <?php endforeach; ?>
</ol>
