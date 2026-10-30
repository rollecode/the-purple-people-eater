<?php
/**
 * Note on old articles: when it was written and how old Rolle was then.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( ! is_text_view( 'post' ) ) {
  return;
}

$written = get_post_datetime();
$now     = current_datetime();
$ago     = $written->diff( $now )->y;

if ( $ago < ARCHIVE_NOTE_AFTER_YEARS ) {
  return;
}

$age = author_age( $written );
?>
<aside class="archive-note" aria-label="Arkistomatskua">
  <span class="yr" aria-hidden="true"><?php echo esc_html( $written->format( 'Y' ) ); ?></span>
  <p><b>Arkistomatskua.</b> Kirjoitettu <?php echo esc_html( wp_date( 'F', $written->getTimestamp() ) ); ?>ssa <?php echo esc_html( $written->format( 'Y' ) ); ?>, <?php echo esc_html( fi_number_words( $ago ) ); ?> vuotta sitten. Olin kirjoittamishetkellä <?php echo esc_html( $age ); ?>-vuotias.</p>
</aside>
