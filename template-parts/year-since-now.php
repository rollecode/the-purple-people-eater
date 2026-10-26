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
$long = post_words() > YEAR_AGO_OPEN_WORDS;
?>
<aside class="yearago" aria-labelledby="year-ago-title">
  <p class="yearago-label meta-text"><?php the_icon( 'clock', 'ic-sm' ); ?>Vuosi sitten tänä päivänä</p>
  <h2 id="year-ago-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
  <p class="dmeta meta-text"><?php echo esc_html( diary_long_date() . ' · ' . diary_time() ); ?></p>
  <div class="prose yearago-text<?php echo $long ? ' is-clamped' : ''; ?>" id="year-ago-text">
    <?php the_content(); ?>
  </div>

  <?php if ( $long ) : ?>
    <button class="btn btn-ghost yearago-more" type="button" aria-expanded="false" aria-controls="year-ago-text" data-expand data-more="Näytä koko päivä" data-less="Näytä vähemmän">
      <span class="lbl">Näytä koko päivä</span><?php the_icon( 'chev' ); ?>
    </button>
  <?php endif; ?>
</aside>
<?php
wp_reset_postdata();
