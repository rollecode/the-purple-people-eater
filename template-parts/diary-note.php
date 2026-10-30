<?php
/**
 * What the diary is, until the note is closed once.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

?>
<aside class="explainer read" aria-label="Tietoa lokikirjasta" data-explainer hidden>
  <p><b>Lokikirjasta.</b> Rollemaan kapteenin lokikirja on Rollen kevyt päiväkirja ja päivittäinen kirjoitushaaste. Tavoitteena on kehittää mielenterveyttä, kirjoittamisharrastusta ja madaltaa kynnystä itseilmaisuun. <a href="<?php echo esc_url( get_post_type_archive_link( 'diary' ) ); ?>">Kaikki päivät</a></p>
  <button class="x-btn" type="button" aria-label="Sulje selitys" data-dismiss-explainer><?php the_icon( 'close' ); ?></button>
</aside>
