<?php
/**
 * Search dialog. Results come from Algolia as you type (front-end.js); the
 * form itself still works without JavaScript and lands on the search page.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$stats = site_stats();
?>
<dialog class="search-dialog" id="search" aria-label="Haku">
  <div class="sbox">
    <form class="s-input" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
      <?php the_icon( 'search' ); ?>
      <label class="screen-reader-text" for="search-input">Hae Rollemaasta</label>
      <input id="search-input" type="search" name="s" autocomplete="off" enterkeyhint="search" aria-controls="search-results" aria-describedby="search-status" placeholder="<?php echo esc_attr( sprintf( 'Hae %s kirjoituksesta ja %s päivästä', fi_number( $stats['posts'] ), fi_number( $stats['diary'] ) ) ); ?>">
      <button class="x-btn" type="button" aria-label="Sulje haku" data-close-search><?php the_icon( 'close' ); ?></button>
    </form>

    <p class="s-meta meta-text" id="search-status" aria-live="polite"></p>
    <div class="s-results" id="search-results"></div>

    <div class="s-empty" data-search-empty hidden>
      <h2>Viimeisimmät hakusi</h2>
      <ul data-search-recent></ul>
    </div>

    <div class="s-foot meta-text">
      <span><kbd>↑</kbd><kbd>↓</kbd> liiku</span>
      <span><kbd>Enter</kbd> avaa</span>
      <span><kbd>Esc</kbd> sulje</span>
      <a class="all textlink" href="<?php echo esc_url( home_url( '/?satunnainen' ) ); ?>" data-search-all>Satunnainen kirjoitus <?php the_icon( 'shuffle', 'ic-sm' ); ?></a>
    </div>
  </div>
</dialog>
