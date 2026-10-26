<?php
/**
 * One text in a listing (archives and search): the date line with its
 * length, the title and opening lines, and the image on the right when the
 * post has one.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$is_diary = 'diary' === get_post_type();
$types    = [
  'post'  => 'Artikkeli',
  'diary' => 'Lokikirja',
  'page'  => 'Sivu',
];
?>
<li class="row<?php echo has_post_thumbnail() ? ' has-thumb' : ''; ?>">
  <div>
    <p class="meta-line meta-text">
      <?php if ( is_search() ) : ?>
        <span><?php echo esc_html( $types[ get_post_type() ] ?? '' ); ?></span>
      <?php endif; ?>
      <span><time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( post_date_fi() ); ?></time></span>
      <span><?php echo esc_html( $is_diary ? diary_time() : reading_minutes() . ' min' ); ?></span>
      <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
    </p>
    <h2 class="row-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
    <p class="excerpt"><?php echo esc_html( post_excerpt_text() ); ?></p>
  </div>

  <?php if ( has_post_thumbnail() ) : ?>
    <a class="row-thumb" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
      <?php
      the_post_thumbnail( 'medium', [
        'alt'     => '',
        'loading' => 'lazy',
        'sizes'   => '(max-width: 860px) 96px, 200px',
      ] );
      ?>
    </a>
  <?php endif; ?>
</li>
