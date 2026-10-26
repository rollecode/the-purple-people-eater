<?php
/**
 * Listings: keyword, category, year, month, day and author archives, and
 * search results. A heading that says what is listed, the texts as rows,
 * page numbers. Included by archive.php, search.php, index.php and their
 * blocks.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

global $wp_query;

$total = (int) $wp_query->found_posts;
$term  = get_search_query();

if ( is_search() ) {
  $count_type = function ( $type ) use ( $term ) {
    $query = new \WP_Query( [
      's'              => $term,
      'post_type'      => $type,
      'post_status'    => 'publish',
      'posts_per_page' => 1,
      'fields'         => 'ids',
    ] );

    return (int) $query->found_posts;
  };

  $current = get_query_var( 'post_type' );
  $current = in_array( $current, [ 'post', 'diary' ], true ) ? $current : '';
  $filters = [
    ''      => [ 'Kaikki', $count_type( 'any' ) ],
    'post'  => [ 'Artikkelit', $count_type( 'post' ) ],
    'diary' => [ 'Lokikirja', $count_type( 'diary' ) ],
  ];
}
?>
<main class="site-main" id="content">
  <div class="wrap">
    <header class="results-head">
      <?php if ( is_search() ) : ?>
        <h1>Haku: <em><?php echo esc_html( $term ); ?></em></h1>

        <form class="bigsearch" role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
          <label class="screen-reader-text" for="search-page-input">Hakusana</label>
          <input id="search-page-input" type="search" name="s" value="<?php echo esc_attr( $term ); ?>">
          <button class="btn" type="submit"><?php the_icon( 'search' ); ?>Hae</button>
        </form>

        <nav class="filters" aria-label="Rajaa hakutuloksia">
          <?php foreach ( $filters as $type => [ $label, $count ] ) : ?>
            <a href="<?php echo esc_url( add_query_arg( array_filter( [ 's' => $term, 'post_type' => $type ] ), home_url( '/' ) ) ); ?>"<?php echo $type === $current ? ' aria-current="page"' : ''; ?>>
              <?php echo esc_html( $label ); ?> <span class="meta-text"><?php echo esc_html( fi_number( $count ) ); ?></span>
            </a>
          <?php endforeach; ?>
        </nav>
      <?php else : ?>
        <h1>
          <?php
          if ( is_tag() ) {
            echo 'Avainsana: <em>' . esc_html( single_tag_title( '', false ) ) . '</em>';
          } elseif ( is_category() ) {
            echo 'Kategoria: <em>' . esc_html( single_cat_title( '', false ) ) . '</em>';
          } elseif ( is_day() ) {
            echo esc_html( get_the_time( 'j.n.Y' ) );
          } elseif ( is_month() ) {
            echo esc_html( ucfirst( get_the_time( 'F' ) ) ) . ' <em>' . esc_html( get_the_time( 'Y' ) ) . '</em>';
          } elseif ( is_year() ) {
            echo 'Vuosi <em>' . esc_html( get_the_time( 'Y' ) ) . '</em>';
          } elseif ( is_author() ) {
            echo 'Kirjoittaja: <em>' . esc_html( get_the_author() ) . '</em>';
          } else {
            echo 'Kirjoitukset';
          }
          ?>
        </h1>
        <p class="intro meta-text"><?php echo esc_html( fi_count( $total, 'kirjoitus', 'kirjoitusta' ) ); ?></p>
        <?php if ( is_tag() || is_category() ) : ?>
          <?php the_archive_description( '<div class="archive-description">', '</div>' ); ?>
        <?php endif; ?>
      <?php endif; ?>
    </header>

    <?php if ( have_posts() ) : ?>
      <ol class="rows">
        <?php
        while ( have_posts() ) {
          the_post();
          get_template_part( 'template-parts/row' );
        }
        ?>
      </ol>
      <?php the_pager(); ?>
    <?php else : ?>
      <?php get_template_part( 'template-parts/content', 'none' ); ?>
    <?php endif; ?>
  </div>
</main>
