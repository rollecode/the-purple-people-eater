<?php
/**
 * What follows an article: when it was published and how long it is, the
 * keywords, reactions from the Fediverse, sharing and related articles.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$responses = $args['responses'];
$permalink = get_permalink();
$tags      = get_the_tags();
$share_url = 'https://share.joinmastodon.org/#text=' . rawurlencode( get_the_title() . ' ' . $permalink );
?>
<footer class="endmatter">
  <div class="colophon">
    <p class="colophon-line meta-text">
      <span><b>Julkaistu</b> <?php echo esc_html( post_date_fi() ); ?></span>
      <span class="sep" aria-hidden="true">·</span>
      <span><?php echo esc_html( fi_number( post_words() ) ); ?> sanaa</span>
      <span class="sep" aria-hidden="true">·</span>
      <span>lukuaika <?php echo esc_html( reading_minutes() ); ?> min</span>
    </p>

    <?php if ( $tags ) : ?>
      <p class="keywords">
        <span class="screen-reader-text">Avainsanat: </span>
        <?php
        echo wp_kses_post( implode( ', ', array_map( function ( $tag ) {
          return '<a href="' . esc_url( get_tag_link( $tag ) ) . '" rel="tag">' . esc_html( $tag->name ) . '</a>';
        }, $tags ) ) );
        ?>
      </p>
    <?php endif; ?>
  </div>

  <?php if ( is_text_view( 'post' ) ) : ?>
    <section aria-labelledby="reactions-title">
      <h2 id="reactions-title">Reaktiot fediversumissa</h2>
      <?php get_template_part( 'template-parts/reactions' ); ?>
      <p class="fedi-note">Tykkää, boostaa tai vastaa omalta Mastodon-tililtäsi: hae palvelimesi haulla tämän kirjoituksen osoite. Reaktiot päivittyvät tänne. Rolle Mastodonissa: <a href="https://mementomori.social/@rolle" rel="me">@rolle@mementomori.social</a>.</p>
    </section>

    <section aria-labelledby="share-title">
      <h2 id="share-title">Jaa ja seuraa</h2>
      <div class="share">
        <a class="btn" href="<?php echo esc_url( $share_url ); ?>"><?php the_icon( 'masto' ); ?>Jaa Mastodonissa</a>
        <a class="btn btn-ghost" href="https://mementomori.social/@rolle" rel="me"><?php the_icon( 'masto' ); ?>Seuraa Rollea</a>
        <button class="btn btn-ghost" type="button" data-copy="<?php echo esc_url( $permalink ); ?>"><?php the_icon( 'link' ); ?><span>Kopioi linkki</span></button>
        <a class="btn btn-ghost" href="<?php echo esc_url( get_feed_link() ); ?>"><?php the_icon( 'rss' ); ?>RSS</a>
      </div>
    </section>

    <?php the_related_posts(); ?>
  <?php endif; ?>
</footer>
