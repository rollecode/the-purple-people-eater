<?php
/**
 * Arkisto: the shelf of years, every year with its counts, the most used
 * keywords and the most read and most commented texts of all time.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

const ARCHIVE_TAGS      = 18;
const ARCHIVE_RANKED    = 30;
const ARCHIVE_RANK_OPEN = 10;
const ALL_POSTS_PAGE_ID = 8609;


$stats     = site_stats();
$tag_count = (int) wp_count_terms( [ 'taxonomy' => 'post_tag' ] );
$tags      = get_terms( [
  'taxonomy' => 'post_tag',
  'orderby'  => 'count',
  'order'    => 'DESC',
  'number'   => ARCHIVE_TAGS,
  'exclude'  => array_filter( [ get_term_by( 'slug', 'twitter-tilapaivitys', 'post_tag' )->term_id ?? 0 ] ),
] );
$top_tag   = $tags ? max( wp_list_pluck( $tags, 'count' ) ) : 1;
$most_read = most_read_query( 'alltime', ARCHIVE_RANKED );
$discussed = get_posts( [
  'post_type'      => 'post',
  'posts_per_page' => ARCHIVE_RANKED,
  'orderby'        => 'comment_count',
  'order'          => 'DESC',
] );

/**
 * Ranked list, the first ARCHIVE_RANK_OPEN visible and the rest behind
 * a "whole list" toggle.
 *
 * @param array<int, array{url:string, title:string, count:int}> $items Items, best first.
 * @param string                                                  $unit  What the number counts.
 */
$ranked = function ( $items, $unit ) {
  $chunks = array_chunk( $items, ARCHIVE_RANK_OPEN );

  $list = function ( $chunk, $start ) {
    ?>
    <ol class="ranked" start="<?php echo esc_attr( $start ); ?>">
      <?php foreach ( $chunk as $i => $item ) : ?>
        <li>
          <span class="pos" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', $start + $i ) ); ?></span>
          <a href="<?php echo esc_url( $item['url'] ); ?>"><?php echo wp_kses_post( $item['title'] ); ?></a>
          <span class="num"><b><?php echo esc_html( fi_number( $item['count'] ) ); ?></b></span>
        </li>
      <?php endforeach; ?>
    </ol>
    <?php
  };

  $list( $chunks[0] ?? [], 1 );

  if ( count( $items ) > ARCHIVE_RANK_OPEN ) {
    echo '<details class="more-ranked"><summary>Koko lista, ' . esc_html( count( $items ) ) . ' kirjoitusta</summary>';
    $list( array_merge( ...array_slice( $chunks, 1 ) ), ARCHIVE_RANK_OPEN + 1 );
    echo '</details>';
  }

  echo '<p class="ranked-unit meta-text">' . esc_html( $unit ) . '</p>';
};
?>
<main class="site-main" id="content">
  <header class="page-hero">
    <div class="inner">
      <h1>Historian lehtien havinaa</h1>
      <p class="intro">Kaikki pelastetut Rollemaan kirjoitukset vuodesta <?php echo esc_html( array_key_first( $stats['years'] ) ); ?> lähtien: <?php echo esc_html( fi_count( $stats['posts'], 'kirjoitus', 'kirjoitusta' ) ); ?>, <?php echo esc_html( fi_number( $stats['diary'] ) ); ?> lokikirjan päivää ja <?php echo esc_html( fi_number( $tag_count ) ); ?> avainsanaa. Selaa vuosittain, avainsanoittain tai lukijoiden suosikkien mukaan.</p>
    </div>
  </header>

  <section class="wrap shelf-wrap shelf-big" aria-labelledby="shelf-title">
    <div class="shelf-meta">
      <h2 id="shelf-title">Kirjoitukset vuosittain</h2>
    </div>
    <?php get_template_part( 'template-parts/shelf', null, [ 'height' => 210 ] ); ?>
  </section>

  <section class="wrap years" aria-labelledby="years-title">
    <h2 class="sec-title" id="years-title">Kaikki vuodet</h2>
    <ol class="year-index">
      <?php
      foreach ( array_reverse( $stats['years'], true ) as $year => $count ) :
        $url   = $count['posts'] ? get_year_link( $year ) : home_url( 'lokikirja/' . $year . '/' );
        $parts = array_filter( [
          $count['posts'] ? fi_count( $count['posts'], 'kirjoitus', 'kirjoitusta' ) : '',
          $count['diary'] ? fi_count( $count['diary'], 'päivä', 'päivää' ) . ' lokikirjassa' : '',
        ] );
        ?>
        <li>
          <a href="<?php echo esc_url( $url ); ?>"><?php echo esc_html( $year ); ?></a>
          <span class="meta-text muted"><?php echo esc_html( implode( ' · ', $parts ) ); ?></span>
          <b><?php echo esc_html( fi_count( $count['post_words'] + $count['diary_words'], 'sana', 'sanaa' ) ); ?></b>
        </li>
      <?php endforeach; ?>
    </ol>
  </section>

  <div class="wrap arch-grid">
    <section aria-labelledby="tags-title">
      <h2 class="h-sec" id="tags-title">Avainsanat</h2>
      <p class="sub"><?php echo esc_html( ARCHIVE_TAGS . ' käytetyintä ' . fi_number( $tag_count ) . ' avainsanasta. Palkki kertoo kirjoitusten määrän.' ); ?></p>
      <ul class="tagbars">
        <?php foreach ( $tags as $tag ) : ?>
          <li>
            <a href="<?php echo esc_url( get_tag_link( $tag ) ); ?>">
              <span class="nm"><?php echo esc_html( $tag->name ); ?></span>
              <span class="meta-text"><?php echo esc_html( $tag->count ); ?></span>
              <span class="b" aria-hidden="true"><i style="width: <?php echo esc_attr( round( $tag->count / $top_tag * 100, 1 ) ); ?>%"></i></span>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </section>

    <div class="ranks">
      <?php if ( $most_read && $most_read->have_posts() ) : ?>
        <section aria-labelledby="most-read-title">
          <h2 class="h-sec" id="most-read-title">Luetuimmat</h2>
          <?php
          $ranked( array_map( function ( $post ) {
            return [
              'url'   => get_permalink( $post ),
              'title' => get_the_title( $post ),
              'count' => (int) most_read_count( $post->ID, 'alltime' ),
            ];
          }, $most_read->posts ), 'Lukukerrat kaikkien aikojen.' );
          ?>
        </section>
      <?php endif; ?>

      <section aria-labelledby="discussed-title">
        <h2 class="h-sec" id="discussed-title">Kommentoiduimmat</h2>
        <?php
        $ranked( array_map( function ( $post ) {
          return [
            'url'   => get_permalink( $post ),
            'title' => get_the_title( $post ),
            'count' => (int) $post->comment_count,
          ];
        }, $discussed ), 'Kommentit kaikkien aikojen.' );
        ?>
      </section>

      <p><a class="textlink" href="<?php echo esc_url( get_permalink( ALL_POSTS_PAGE_ID ) ); ?>">Kaikki kirjoitukset yhdellä sivulla <?php the_icon( 'arrow' ); ?></a></p>
    </div>
  </div>

  <?php if ( get_the_content() ) : ?>
    <div class="read page-body">
      <div class="prose"><?php the_content(); ?></div>
    </div>
  <?php endif; ?>
</main>
