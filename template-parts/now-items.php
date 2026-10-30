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
      <span class="src"><?php echo esc_html( empty( $track['date'] ) ? 'Last.fm' : 'Last.fm, ' . fi_time_ago( $track['date'] ) ); ?></span>
    </div>
  </li>
  <?php
endif;

if ( ! empty( $now['watched'] ) ) :
  $movie = $now['watched'];
  ?>
  <li>
    <?php the_icon( 'Trakt' === ( $movie['source'] ?? '' ) ? 'trakt' : 'rollekino' ); ?>
    <div>
      <span class="label meta-text">Katsottua</span>
      <a class="what" href="<?php echo esc_url( $movie['url'] ); ?>"><?php echo esc_html( $movie['title'] ); ?></a>
      <span class="src"><?php echo esc_html( ( $movie['source'] ?? 'Rollekino' ) . ', ' . fi_time_ago( $movie['date'] ) ); ?></span>
    </div>
  </li>
  <?php
endif;

if ( ! empty( $now['reading'] ) ) :
  $book = $now['reading'];
  ?>
  <li>
    <?php the_icon( 'book' ); ?>
    <div>
      <span class="label meta-text">Luettua</span>
      <a class="what" href="<?php echo esc_url( $book['url'] ); ?>"><?php echo esc_html( $book['title'] ); ?></a>
      <span class="src">Luku</span>
    </div>
  </li>
  <?php
endif;
