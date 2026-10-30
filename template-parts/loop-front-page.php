<?php
/**
 * Front page: the word count and the shelf on the plain page, the newest
 * article, the ones before it, the week's most read, what Rolle listens to
 * and watches, random finds from the archive and who writes all this.
 * Included by front-page.php and the the-purple-people-eater/loop-front-page block.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$stats = site_stats();
$lead  = new \WP_Query( [
  'post_type'           => 'post',
  'post_status'         => 'publish',
  'posts_per_page'      => 1,
  'no_found_rows'       => true,
  'ignore_sticky_posts' => true,
] );
$feed  = feed_query( 0 );
$top   = most_read_query( 'week', 4 );
$now   = now_data( false );
?>
<main class="site-main" id="content">

  <header class="opening wrap">
    <h1 class="statement">Rollemaa on Rollen blogi, joka sisältää <em><?php echo esc_html( fi_number( $stats['posts'] + $stats['diary'] ) ); ?> kirjoitusta</em>, eli <em><?php echo esc_html( fi_number( $stats['words'] ) ); ?> sanaa</em>.</h1>
    <p class="imprint">Rolle Laukkarinen · Jyväskylä · kirjoituksia vuodesta <?php echo esc_html( array_key_first( $stats['years'] ) ); ?></p>
    <div class="follow-row">
      <a href="<?php echo esc_url( get_feed_link() ); ?>"><?php the_icon( 'rss' ); ?>RSS</a>
      <a href="https://mementomori.social/@rolle" rel="me"><?php the_icon( 'masto' ); ?>@rolle@mementomori.social</a>
    </div>
  </header>

  <section class="wrap shelf-wrap" aria-labelledby="shelf-title">
    <div class="shelf-meta">
      <h2 id="shelf-title">Kirjoitukset vuosittain</h2>
      <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'arkisto' ) ) ); ?>">Selaa arkistoa</a>
    </div>
    <?php get_template_part( 'template-parts/shelf', null, [ 'height' => 150 ] ); ?>
  </section>

  <section class="wrap posts" aria-labelledby="latest-title">
    <h2 class="sec-title" id="latest-title">Uusin kokopitkä</h2>
    <?php
    while ( $lead->have_posts() ) {
      $lead->the_post();
      get_template_part( 'template-parts/card', null, [ 'lead' => true ] );
    }
    wp_reset_postdata();
    ?>

    <?php if ( $feed->have_posts() ) : ?>
      <h2 class="sec-title sec-title-next" id="feed-title">Edelliset kokopitkät</h2>
      <div class="cards" id="feed" data-feed>
        <?php
        while ( $feed->have_posts() ) {
          $feed->the_post();
          get_template_part( 'template-parts/card' );
        }
        wp_reset_postdata();
        ?>
      </div>

      <?php if ( $feed->found_posts > 1 + CARDS_PER_PAGE ) : ?>
        <div class="loadmore">
          <button class="btn btn-ghost" type="button" data-load-more aria-controls="feed">Näytä lisää kirjoituksia <?php the_icon( 'chev' ); ?></button>
          <span class="meta-text muted" data-feed-count aria-live="polite"><?php echo esc_html( sprintf( '%d / %s', 1 + $feed->post_count, fi_number( $stats['posts'] ) ) ); ?></span>
        </div>
      <?php endif; ?>
    <?php endif; ?>
  </section>

  <?php include get_theme_file_path( 'template-parts/ads.php' ); ?>

  <div class="wrap duo">
    <?php if ( $top && $top->have_posts() ) : ?>
      <section aria-labelledby="top-title">
        <h2 class="h-sec" id="top-title">Viikon luetuimmat</h2>
        <p class="sub">Lukukerrat viimeisen seitsemän päivän ajalta.</p>
        <ol class="chart">
          <?php
          $trend_labels = [
            'up'   => 'nousussa',
            'flat' => 'ennallaan',
            'down' => 'laskussa',
          ];

          while ( $top->have_posts() ) :
            $top->the_post();
            $trend = most_read_trend( get_the_ID() );
            ?>
            <li>
              <span class="pos" aria-hidden="true"><?php echo esc_html( $top->current_post + 1 ); ?></span>
              <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              <span class="reads meta-text"><?php the_icon( $trend, 'ic-sm', $trend_labels[ $trend ] ); ?><?php echo esc_html( fi_number( most_read_count( get_the_ID(), 'week' ) ) ); ?><span class="screen-reader-text"> lukukertaa</span></span>
            </li>
          <?php endwhile; ?>
        </ol>
      </section>
      <?php
      wp_reset_postdata();
    endif;
    ?>

    <aside class="now" aria-labelledby="now-title" data-now<?php echo empty( $now ) ? ' hidden' : ''; ?>>
      <h2 id="now-title">Nyt</h2>
      <p class="sub">Viimeksi kuunneltu, katsottu ja luettu.</p>
      <ul data-now-items>
        <?php get_template_part( 'template-parts/now-items', null, [ 'now' => $now ] ); ?>
      </ul>
    </aside>
  </div>

  <section class="wrap shuffle" aria-labelledby="random-title">
    <div class="shuffle-head">
      <h2 class="h-sec" id="random-title">Satunnaisia kirjoituksia arkistosta</h2>
      <button class="btn btn-ghost" type="button" data-shuffle aria-controls="random-picks"><?php the_icon( 'shuffle' ); ?>Arvo uudet</button>
    </div>
    <ul class="picks" id="random-picks" aria-live="polite">
      <?php get_template_part( 'template-parts/random-picks' ); ?>
    </ul>
  </section>

  <?php get_template_part( 'template-parts/who' ); ?>

</main>
