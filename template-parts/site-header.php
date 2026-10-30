<?php
/**
 * Site head: the rain behind the logo, navigation, logo and search button,
 * then the search dialog.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

?>
<div class="rain-wrapper" aria-hidden="true">
  <div class="rain front-row"></div>
  <div class="rain back-row"></div>
</div>

<header class="site-head<?php echo has_photo_hero() ? ' on-photo' : ''; ?>">
  <div class="bar">
    <nav class="nav" aria-label="Päävalikko">
      <?php
      wp_nav_menu( [
        'theme_location' => 'primary',
        'container'      => false,
        'depth'          => 1,
        'menu_class'     => 'nav-list',
        'fallback_cb'    => false,
      ] );
      ?>
    </nav>

    <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home" aria-label="Rollemaa, etusivu"><?php the_umbrella(); ?>Rollemaa</a>

    <button class="search-btn" type="button" aria-label="Haku (pikanäppäin /)" aria-haspopup="dialog" aria-controls="search" data-open-search>
      <?php the_icon( 'search' ); ?>
      <span class="lbl" aria-hidden="true">Haku</span>
      <kbd aria-hidden="true">/</kbd>
    </button>
  </div>
</header>

<?php get_template_part( 'template-parts/search-dialog' ); ?>
