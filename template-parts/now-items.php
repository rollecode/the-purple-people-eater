<?php
/**
 * Items of the "Nyt" panel from $args['now'] (see inc/hooks/now.php).
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$now = $args['now'] ?? [];

if ( ! empty( $now['listening'] ) ) :
  $track = $now['listening'];
  ?>
  <li>
    <?php the_icon( 'lastfm' ); ?>
    <div>
      <span class="label meta-text"><?php echo esc_html( $track['playing'] ? 'Soi nyt' : 'Kuunneltua' ); ?></span>
      <a class="what" href="<?php echo esc_url( $track['url'] ); ?>"><?php echo esc_html( $track['artist'] . ' – ' . $track['track'] ); ?></a>
      <span class="src">Last.fm</span>
    </div>
  </li>
  <?php
endif;

if ( ! empty( $now['watched'] ) ) :
  $movie = $now['watched'];
  ?>
  <li>
    <?php the_icon( 'rollekino' ); ?>
    <div>
      <span class="label meta-text">Katsottua</span>
      <a class="what" href="<?php echo esc_url( $movie['url'] ); ?>"><?php echo esc_html( $movie['title'] ); ?></a>
      <span class="src">Rollekino, <?php echo esc_html( wp_date( 'j.n.Y', $movie['date'] ) ); ?></span>
    </div>
  </li>
  <?php
endif;
