<?php
/**
 * A page: the title large, then the content in the reading column. When the
 * content opens with its own h1, or the "Ei otsikkoa" template is chosen,
 * the title is left to screen readers. Included by page.php,
 * template-no-title.php and the minimalistmadness/loop-page block.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$own_title  = false !== stripos( get_post_field( 'post_content' ), '<h1' );
$hide_title = $own_title || 'template-no-title.php' === get_page_template_slug();
?>
<main class="site-main" id="content">
  <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <?php if ( $hide_title && ! $own_title ) : ?>
      <h1 class="screen-reader-text"><?php the_title(); ?></h1>
    <?php elseif ( ! $hide_title ) : ?>
      <header class="page-hero">
        <div class="inner">
          <h1><?php the_display_title(); ?></h1>
          <?php if ( has_excerpt() ) : ?>
            <p class="intro"><?php echo esc_html( get_the_excerpt() ); ?></p>
          <?php endif; ?>
        </div>
      </header>
    <?php endif; ?>

    <div class="read page-body">
      <div class="prose<?php echo has_blocks() ? '' : ' legacy'; ?>">
        <?php the_content(); ?>
      </div>
      <?php edit_post_link( 'Muokkaa', '<p class="edit-link">', '</p>' ); ?>
    </div>
  </article>
</main>
