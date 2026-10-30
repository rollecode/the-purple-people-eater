<?php
/**
 * Nothing found: in a search, an archive or a diary date.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

?>
<div class="nothing">
  <h2>Tyhjää täynnä</h2>
  <?php if ( is_search() ) : ?>
    <p>Haulla ”<?php echo esc_html( get_search_query() ); ?>” ei löytynyt mitään. Kokeile toista sanaa tai lyhyempää hakua.</p>
  <?php else : ?>
    <p>Täältä ei löydy kirjoituksia. Kokeile hakua tai selaa <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'arkisto' ) ) ); ?>">arkistoa</a>.</p>
  <?php endif; ?>
</div>
