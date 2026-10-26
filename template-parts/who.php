<?php
/**
 * Who writes this: photo, a few lines and a link to the about page.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

?>
<section class="wrap who" aria-labelledby="who-title">
  <img src="<?php echo esc_url( get_theme_file_uri( 'images/author-info.jpg' ) ); ?>" alt="Rolle Laukkarinen" width="280" height="280" loading="lazy">
  <div>
    <h2 id="who-title">Kuka Rolle?</h2>
    <?php get_template_part( 'template-parts/author-bio' ); ?>
    <a class="textlink" href="<?php echo esc_url( get_permalink( ABOUT_PAGE_ID ) ); ?>">Lisää Rollesta <?php the_icon( 'arrow' ); ?></a>
  </div>
</section>
