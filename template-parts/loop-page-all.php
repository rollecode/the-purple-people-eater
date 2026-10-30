<?php
/**
 * Every article on one page, by year and month, newest first, with the
 * years in a rail that stays in view.
 *
 * @package minimalistmadness
 */

namespace Air_Light;


$posts_by_month = [];
$all_posts      = get_posts( [
  'post_type'              => 'post',
  'post_status'            => 'publish',
  'posts_per_page'         => -1,
  'orderby'                => 'date',
  'order'                  => 'DESC',
  'update_post_meta_cache' => false,
  'update_post_term_cache' => false,
] );

foreach ( $all_posts as $item ) {
  $posts_by_month[ get_the_time( 'Y', $item ) ][ get_the_time( 'n', $item ) ][] = $item;
}
?>
<main class="site-main" id="content">
  <header class="page-hero">
    <div class="inner">
      <h1>Kaikki <em><?php echo esc_html( fi_number( count( $all_posts ) ) ); ?></em> kirjoitusta</h1>
    </div>
  </header>

  <div class="wrap all-posts">
    <nav class="all-years" aria-label="Vuodet">
      <ol>
        <?php foreach ( $posts_by_month as $year => $months ) : ?>
          <li><a href="#year-<?php echo esc_attr( $year ); ?>"><?php echo esc_html( $year ); ?> <span class="meta-text"><?php echo esc_html( array_sum( array_map( 'count', $months ) ) ); ?></span></a></li>
        <?php endforeach; ?>
      </ol>
    </nav>

    <div class="all-body">
      <?php foreach ( $posts_by_month as $year => $months ) : ?>
        <section class="all-year" id="year-<?php echo esc_attr( $year ); ?>" aria-labelledby="year-title-<?php echo esc_attr( $year ); ?>">
          <h2 class="all-year-title" id="year-title-<?php echo esc_attr( $year ); ?>"><?php echo esc_html( $year ); ?></h2>
          <?php foreach ( $months as $month => $items ) : ?>
            <h3 class="all-month"><?php echo esc_html( ucfirst( $GLOBALS['wp_locale']->get_month( $month ) ) ); ?></h3>
            <ul class="all-list">
              <?php foreach ( $items as $item ) : ?>
                <li>
                  <time class="meta-text" datetime="<?php echo esc_attr( get_the_date( 'c', $item ) ); ?>"><?php echo esc_html( get_the_time( 'j.n.', $item ) ); ?></time>
                  <a href="<?php echo esc_url( get_permalink( $item ) ); ?>"><?php echo wp_kses_post( get_the_title( $item ) ); ?></a>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php endforeach; ?>
        </section>
      <?php endforeach; ?>
    </div>
  </div>
</main>
