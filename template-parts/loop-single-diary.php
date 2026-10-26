<?php
/**
 * One lokikirja day: a short note on what the diary is, the entry in the
 * article layout, the day's data, the same day a year ago, the days
 * before and after, and the comments. Included by single-diary.php and the
 * minimalistmadness/loop-single-diary block.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

// On the block template path core has already consumed the singular main
// loop, so rewind before iterating; harmless on the classic path.
rewind_posts();
?>
<main class="site-main" id="content">
  <aside class="explainer read" aria-label="Mikä lokikirja?" data-explainer hidden>
    <p><b>Mikä lokikirja?</b> Rollemaan kapteenin lokikirja on Rollen kevyt päiväkirja ja päivittäinen kirjoitushaaste. Tavoitteena on kehittää mielenterveyttä, kirjoittamisharrastusta ja madaltaa kynnystä itseilmaisuun. <a href="<?php echo esc_url( get_post_type_archive_link( 'diary' ) ); ?>">Kaikki päivät</a></p>
    <button class="x-btn" type="button" aria-label="Sulje selitys" data-dismiss-explainer><?php the_icon( 'close' ); ?></button>
  </aside>

  <?php
  while ( have_posts() ) :
    the_post();
    $responses = post_responses( get_the_ID() );
    $likes     = $responses['likes'] + $responses['boosts'];
    $previous  = get_previous_post();
    $next      = get_next_post();
    ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
      <header class="read diary-head">
        <p class="diary-kicker"><a href="<?php echo esc_url( get_post_type_archive_link( 'diary' ) ); ?>"><?php the_icon( 'logbook', 'ic-sm' ); ?>Lokikirja</a><span aria-hidden="true">·</span><?php the_title(); ?></p>
        <h1><time datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"><?php echo esc_html( diary_long_date() ); ?></time></h1>
        <p class="meta-line meta-text">
          <span><?php echo esc_html( ucfirst( diary_time() ) ); ?></span>
          <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
          <?php if ( $likes ) : ?>
            <span><?php echo esc_html( fi_count( $likes, 'reaktio', 'reaktiota' ) ); ?></span>
          <?php endif; ?>
        </p>
      </header>

      <div class="read">

        <div class="prose">
          <?php the_content(); ?>
        </div>

        <?php
        get_template_part( 'template-parts/diary-data', null, [ 'reactions' => true ] );

        edit_post_link( 'Muokkaa', '<p class="edit-link">', '</p>' );
        get_template_part( 'template-parts/year-since-now' );
        ?>

        <nav class="prevnext" aria-label="Edellinen ja seuraava päivä">
          <?php if ( $previous ) : ?>
            <a href="<?php echo esc_url( get_permalink( $previous ) ); ?>" rel="prev">
              <span class="meta-text">Edellinen · <?php echo esc_html( get_the_time( 'l j.n.', $previous ) ); ?></span>
              <strong><?php echo esc_html( get_the_title( $previous ) ); ?></strong>
            </a>
          <?php endif; ?>

          <?php if ( $next ) : ?>
            <a href="<?php echo esc_url( get_permalink( $next ) ); ?>" rel="next">
              <span class="meta-text">Seuraava · <?php echo esc_html( get_the_time( 'l j.n.', $next ) ); ?></span>
              <strong><?php echo esc_html( get_the_title( $next ) ); ?></strong>
            </a>
          <?php endif; ?>
        </nav>
      </div>

      <?php
      if ( is_federated() || $responses['comments'] ) {
        comments_template();
      }
      ?>
    </article>
  <?php endwhile; ?>
</main>
