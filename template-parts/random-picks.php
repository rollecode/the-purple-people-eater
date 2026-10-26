<?php
/**
 * Random articles from the archive as list items. The front page renders
 * the first ones; "Arvo uudet" fetches more through rollemaa/v1/random.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$query = random_query();

while ( $query->have_posts() ) :
  $query->the_post();
  ?>
  <li>
    <span class="meta-text"><?php echo esc_html( post_date_fi() . ' · ' . reading_minutes() . ' min' ); ?></span>
    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
  </li>
  <?php
endwhile;

wp_reset_postdata();
