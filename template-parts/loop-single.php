<?php
/**
 * An article: the head (on its photo, or plain when there is none), the
 * byline, the text and what follows it. Included by single.php and the
 * minimalistmadness/loop-single block.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

// On the block template path core has already consumed the singular main
// loop, so rewind before iterating; harmless on the classic path.
rewind_posts();
?>
<main class="site-main" id="content">
  <?php
  while ( have_posts() ) :
    the_post();
    $responses = post_responses( get_the_ID() );
    ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
      <?php get_template_part( 'template-parts/hero-single' ); ?>

      <div class="read">
        <?php
        get_template_part( 'template-parts/byline', null, [ 'responses' => $responses ] );
        get_template_part( 'template-parts/archive-note' );
        ?>

        <div class="prose<?php echo has_blocks() ? '' : ' legacy'; ?>">
          <?php
          the_content();
          wp_link_pages( [
            'before' => '<nav class="page-links meta-text" aria-label="Kirjoituksen sivut">',
            'after'  => '</nav>',
          ] );
          ?>
        </div>

        <?php
        edit_post_link( 'Muokkaa', '<p class="edit-link">', '</p>' );
        get_template_part( 'template-parts/endmatter', null, [ 'responses' => $responses ] );
        ?>
      </div>

      <?php
      if ( is_federated() || $responses['comments'] ) {
        comments_template();
      }
      ?>
    </article>
  <?php endwhile; ?>
</main>
