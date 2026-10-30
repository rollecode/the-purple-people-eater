<?php
/**
 * One comment in the thread. Fediverse replies show the handle and where
 * they came from; Rolle's own replies are marked as the writer's.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

const COMMENT_CLAMP_CHARS = 900;

/**
 * Mastodon-style handle from a Fediverse profile URL: @user@host.
 *
 * @param string $url Author URL, like https://mementomori.social/@rolle.
 */
function fediverse_handle( $url ) {
  if ( ! preg_match( '#^https?://([^/]+)/@([^/?]+)#', (string) $url, $match ) ) {
    return '';
  }

  return '@' . $match[2] . '@' . $match[1];
}

/**
 * Callback for wp_list_comments(). WordPress closes the <li> after the
 * replies, so this opens it and leaves it open.
 *
 * @param \WP_Comment $comment Comment.
 * @param array       $args    List arguments.
 * @param int         $depth   Nesting depth.
 */
function single_comment( $comment, $args, $depth ) {
  $fediverse = (bool) get_comment_meta( $comment->comment_ID, 'protocol', true );
  $avatar    = get_comment_meta( $comment->comment_ID, 'avatar_url', true );
  $is_author = ( $comment->user_id && (int) get_post_field( 'post_author', $comment->comment_post_ID ) === (int) $comment->user_id )
    || 'https://mementomori.social/@rolle' === untrailingslashit( $comment->comment_author_url );
  $handle    = $fediverse ? fediverse_handle( $comment->comment_author_url ) : '';
  $long      = mb_strlen( wp_strip_all_tags( $comment->comment_content ) ) > COMMENT_CLAMP_CHARS;
  $body_id   = 'comment-body-' . $comment->comment_ID;
  $name      = trim( $comment->comment_author );
  $initial   = '' === $name ? '?' : mb_strtoupper( mb_substr( $name, 0, 1 ) );
  $tone      = 1 + $comment->comment_ID % 4;
  $classes   = [ 'cmt' ];

  if ( $is_author ) {
    $classes[] = 'is-author';
  }
  ?>
  <li <?php comment_class( '', $comment ); ?> id="comment-<?php comment_ID(); ?>">
    <article class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>">
      <header class="cmt-head">
        <?php if ( $is_author ) : ?>
          <img class="av" src="<?php echo esc_url( get_theme_file_uri( 'images/author-info.jpg' ) ); ?>" alt="" width="40" height="40" loading="lazy">
        <?php elseif ( $avatar ) : ?>
          <img class="av" src="<?php echo esc_url( $avatar ); ?>" alt="" width="40" height="40" loading="lazy">
        <?php else : ?>
          <span class="av av<?php echo esc_attr( $tone ); ?>" aria-hidden="true"><?php echo esc_html( $initial ); ?></span>
        <?php endif; ?>

        <div>
          <p class="name">
            <?php echo esc_html( $comment->comment_author ); ?>
            <?php if ( $is_author ) : ?>
              <span class="role">Kirjoittaja</span>
            <?php elseif ( $handle ) : ?>
              <a class="handle" href="<?php echo esc_url( $comment->comment_author_url ); ?>"><?php echo esc_html( $handle ); ?></a>
            <?php endif; ?>
          </p>
          <p class="when">
            <a href="<?php echo esc_url( get_comment_link( $comment ) ); ?>"><time datetime="<?php comment_date( 'c' ); ?>"><?php echo esc_html( get_comment_date( 'j.n.Y', $comment ) . ' klo ' . get_comment_date( 'G.i', $comment ) ); ?></time></a>
            <?php if ( $fediverse ) : ?>
              <span class="via"><?php the_icon( 'masto' ); ?>fediversumista</span>
            <?php endif; ?>
          </p>
        </div>
      </header>

      <?php if ( '0' === $comment->comment_approved ) : ?>
        <p class="awaiting">Kiitos kommentista! Se odottaa hyväksyntää eikä näy vielä muille.</p>
      <?php endif; ?>

      <div class="cmt-body<?php echo $long ? ' is-clamped' : ''; ?>" id="<?php echo esc_attr( $body_id ); ?>">
        <?php comment_text( $comment ); ?>
      </div>

      <?php if ( $long ) : ?>
        <button class="expand" type="button" aria-expanded="false" aria-controls="<?php echo esc_attr( $body_id ); ?>" data-expand>
          <span class="screen-reader-text">Näytä koko kommentti</span><?php the_icon( 'chev' ); ?>
        </button>
      <?php endif; ?>

      <footer class="cmt-actions">
        <?php
        // The plugin's own reply: a remote reply form for visitors.
        if ( $fediverse && class_exists( 'Activitypub\Comment' ) ) {
          echo remote_reply_button( \Activitypub\Comment::comment_reply_link( '', $args, $comment ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- plugin block markup
        }

        edit_comment_link( 'Muokkaa', '<span class="edit-link">', '</span>' );
        ?>
      </footer>
    </article>
  <?php
}

/**
 * The plugin draws its reply control as a link pretending to be a button;
 * make it a real button, which brings Enter and Space with it.
 *
 * @param string $markup Remote reply block markup.
 */
function remote_reply_button( $markup ) {
  return preg_replace_callback( '#<a\s([^>]*class="comment-reply-link activitypub-remote-reply__link"[^>]*)>(.*?)</a>#s', function ( $match ) {
    $attributes = preg_replace( '#\s(role="button"|tabindex="0"|data-wp-on--keydown="[^"]*")#', '', $match[1] );

    return '<button type="button" ' . trim( $attributes ) . '>' . $match[2] . '</button>';
  }, $markup );
}
