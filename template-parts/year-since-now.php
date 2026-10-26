<?php
/**
 * The diary entry written on this day a year ago, if there is one.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$written  = get_post_datetime();
$year_ago = new \WP_Query( [
  'post_type'      => 'diary',
  'post_status'    => 'publish',
  'posts_per_page' => 1,
  'no_found_rows'  => true,
  'date_query'     => [
    [
      'year'  => (int) $written->format( 'Y' ) - 1,
      'month' => (int) $written->format( 'n' ),
      'day'   => (int) $written->format( 'j' ),
    ],
  ],
] );

if ( ! $year_ago->have_posts() ) {
  return;
}

$year_ago->the_post();
?>
<aside class="yearago" aria-labelledby="year-ago-title">
  <p class="yearago-label meta-text"><?php the_icon( 'clock', 'ic-sm' ); ?>Vuosi sitten tänä päivänä</p>
  <h2 id="year-ago-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
  <p class="dmeta meta-text"><?php echo esc_html( diary_long_date() . ' · ' . diary_time() ); ?></p>
  <div class="yearago-text">
    <?php the_content(); ?>
  </div>
  <a class="textlink" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">Lue koko päivä <?php the_icon( 'arrow' ); ?></a>
</aside>
<?php
wp_reset_postdata();
