<?php
/**
 * Page numbers for archives, search and the diary, with the way back to
 * newer and on to older texts.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

/**
 * @param string $older Label for the next page, which holds older texts.
 * @param string $newer Label for the previous page.
 */
function the_pager( $older = 'Vanhempia', $newer = 'Uudempia' ) {
  global $wp_query;

  if ( $wp_query->max_num_pages < 2 ) {
    return;
  }

  $pages = paginate_links( [
    'type'      => 'array',
    'prev_next' => false,
    'mid_size'  => 1,
    'end_size'  => 1,
    'current'   => max( 1, get_query_var( 'paged' ) ),
    'total'     => $wp_query->max_num_pages,
  ] );

  $newer_url = get_previous_posts_page_link();
  $older_url = get_next_posts_page_link();
  $paged     = max( 1, get_query_var( 'paged' ) );
  ?>
  <nav class="pager" aria-label="Sivutus">
    <?php if ( $paged > 1 ) : ?>
      <a class="newer" href="<?php echo esc_url( $newer_url ); ?>"><?php the_icon( 'arrow-l' ); ?><?php echo esc_html( $newer ); ?></a>
    <?php endif; ?>

    <?php echo wp_kses_post( implode( '', $pages ) ); ?>

    <?php if ( $paged < $wp_query->max_num_pages ) : ?>
      <a class="older" href="<?php echo esc_url( $older_url ); ?>"><?php echo esc_html( $older ); ?><?php the_icon( 'arrow' ); ?></a>
    <?php endif; ?>
  </nav>
  <?php
}
