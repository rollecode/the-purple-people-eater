<?php
/**
 * Page not found: say so plainly, offer search, and a few random texts
 * from the archive. Included by 404.php and the minimalistmadness/loop-404 block.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

?>
<main class="site-main" id="content">
  <div class="nf">
    <div>
      <p class="big" aria-hidden="true">404</p>
      <h1>Sivua ei löytynyt</h1>
      <p>Hakemaasi sivua ei ole olemassa, tai sen osoite on muuttunut. Kokeile hakua tai valitse jokin kirjoitus arkistosta.</p>
      <form class="bigsearch" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <label class="screen-reader-text" for="not-found-search">Hae Rollemaasta</label>
        <input id="not-found-search" type="search" name="s" placeholder="Hae Rollemaasta">
        <button class="btn" type="submit"><?php the_icon( 'search' ); ?>Hae</button>
      </form>
      <p class="meta-text muted">Virhe 404 · <a href="<?php echo esc_url( home_url( '/' ) ); ?>">Etusivulle</a></p>
    </div>

    <section class="right" aria-labelledby="not-found-random">
      <h2 class="h-sec" id="not-found-random">Satunnaisia kirjoituksia arkistosta</h2>
      <ul class="picks picks-stack" id="random-picks" aria-live="polite">
        <?php get_template_part( 'template-parts/random-picks' ); ?>
      </ul>
      <div>
        <button class="btn btn-ghost" type="button" data-shuffle aria-controls="random-picks"><?php the_icon( 'shuffle' ); ?>Arvo uudet</button>
      </div>
    </section>
  </div>
</main>
