<?php
/**
 * Lokikirja: what it is, a year of writing as a heatmap, then the days,
 * newest first. Date archives (/lokikirja/2025/10/) list just those days.
 * Included by archive-diary.php and the minimalistmadness/loop-archive-diary block.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$stats = site_stats();
$first = get_posts( [
  'post_type'      => 'diary',
  'posts_per_page' => 1,
  'order'          => 'ASC',
  'no_found_rows'  => true,
] );
?>
<main class="site-main" id="content">
  <header class="read art-head">
    <h1 class="cover-title">Lokikirja</h1>

    <?php if ( is_date() ) : ?>
      <p class="standfirst">
        <?php
        if ( is_day() ) {
          echo esc_html( diary_long_date( $GLOBALS['wp_query']->posts[0] ?? null ) );
        } elseif ( is_month() ) {
          echo esc_html( ucfirst( get_the_time( 'F Y' ) ) );
        } else {
          echo esc_html( 'Vuosi ' . get_the_time( 'Y' ) );
        }
        ?>
      </p>
    <?php else : ?>
      <p class="standfirst">Rollemaan kapteenin lokikirja on Rollen kevyt päiväkirja ja päivittäinen kirjoitushaaste. Tavoitteena on kehittää mielenterveyttä, kirjoittamisharrastusta ja madaltaa kynnystä itseilmaisuun.</p>
      <p class="dmeta meta-text">
        <?php echo esc_html( fi_number( $stats['diary'] ) ); ?> merkintää
        <?php if ( $first ) : ?>
          · <?php echo esc_html( post_date_fi( $first[0] ) ); ?> alkaen
        <?php endif; ?>
      </p>
    <?php endif; ?>
  </header>

  <?php if ( ! is_date() && ! is_paged() ) : ?>
    <div class="diary-heat">
      <div class="heat-scroll" tabindex="0" role="region" aria-label="Kirjoituskalenteri: sanat päivittäin viimeisen vuoden ajalta. Päivien välillä nuolinäppäimillä.">
        <div class="heat" id="heatmap"></div>
      </div>
    </div>
  <?php endif; ?>

  <div class="read dentries">
    <?php
    if ( have_posts() ) {
      while ( have_posts() ) {
        the_post();
        get_template_part( 'template-parts/content-diary' );
      }

      the_pager( 'Vanhemmat päivät', 'Uudemmat päivät' );
    } else {
      get_template_part( 'template-parts/content', 'none' );
    }
    ?>
  </div>
</main>
