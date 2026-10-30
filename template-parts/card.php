<?php
/**
 * Post card: the image when the post has one, then the date line, the
 * title and the excerpt. Without an image the card is all type. Front page grid, the load-more endpoint and the lead
 * card ($args['lead']) all render through this file.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$lead    = ! empty( $args['lead'] );
$heading = $args['heading'] ?? 'h3';
?>
<article class="card<?php echo $lead ? ' card-lead' : ''; ?><?php echo has_post_thumbnail() ? '' : ' is-text'; ?>" data-post-id="<?php the_ID(); ?>">
  <?php if ( has_post_thumbnail() ) : ?>
    <a class="card-img" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
      <?php
      the_post_thumbnail( 'large', [
        'alt'     => '',
        'loading' => 'lazy',
        'sizes'   => $lead ? '(max-width: 1100px) 100vw, 740px' : '(max-width: 860px) 100vw, 640px',
      ] );
      ?>
    </a>
  <?php endif; ?>

  <div class="card-body">
    <?php the_meta_line(); ?>
    <<?php echo esc_html( $heading ); ?> class="card-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></<?php echo esc_html( $heading ); ?>>
    <p class="excerpt"><?php echo esc_html( post_excerpt_text( null, has_post_thumbnail() ? EXCERPT_SENTENCES : TEXT_CARD_SENTENCES ) ); ?></p>

    <?php if ( $lead ) : ?>
      <a class="btn" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">Lue kokopitkä <?php the_icon( 'arrow' ); ?></a>
    <?php endif; ?>
  </div>
</article>
