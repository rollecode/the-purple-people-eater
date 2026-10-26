<?php
/**
 * Every article on one page, by year and month, newest first.
 *
 * Template Name: Kaikki kirjoitukset
 *
 * @package minimalistmadness
 */

namespace Air_Light;

the_post();
get_header();

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
    <?php foreach ( $posts_by_month as $year => $months ) : ?>
      <section class="all-year" aria-labelledby="year-<?php echo esc_attr( $year ); ?>">
        <h2 class="sec-title" id="year-<?php echo esc_attr( $year ); ?>"><?php echo esc_html( $year ); ?></h2>
        <?php foreach ( $months as $month => $items ) : ?>
          <h3 class="all-month"><?php echo esc_html( ucfirst( date_i18n( 'F', mktime( 0, 0, 0, $month, 1, $year ) ) ) ); ?></h3>
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
</main>
<?php
get_footer();
