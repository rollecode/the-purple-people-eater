<?php
/**
 * Article head. With a featured image the photo fills the first screen and
 * the title sits on it; without one there is no hero at all, the title
 * just opens the reading column.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

if ( has_photo_hero() ) :
  $caption = wp_get_attachment_caption( get_post_thumbnail_id() );
  ?>
  <header class="photo-hero">
    <?php
    the_post_thumbnail( 'full', [
      'alt'           => '',
      'loading'       => 'eager',
      'fetchpriority' => 'high',
      'sizes'         => '100vw',
    ] );
    ?>
    <div class="ph-text">
      <h1 class="cover-title"><?php the_display_title(); ?></h1>
      <?php if ( has_excerpt() ) : ?>
        <p class="standfirst"><?php echo esc_html( get_the_excerpt() ); ?></p>
      <?php endif; ?>
      <p class="hero-foot meta-line meta-text">
        <span><?php echo esc_html( post_date_fi() ); ?></span>
        <span><?php echo esc_html( reading_minutes() ); ?> min</span>
        <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
      </p>
    </div>
    <?php if ( $caption ) : ?>
      <span class="credit"><?php echo esc_html( $caption ); ?></span>
    <?php endif; ?>
  </header>
<?php else : ?>
  <header class="read art-head">
    <h1 class="cover-title"><?php the_display_title(); ?></h1>
    <?php if ( has_excerpt() ) : ?>
      <p class="standfirst"><?php echo esc_html( get_the_excerpt() ); ?></p>
    <?php endif; ?>
  </header>
<?php endif; ?>
