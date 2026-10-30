<?php
/**
 * Likes and boosts from the fediverse: the faces of the people and the
 * counts, in the theme's own type instead of the plugin's block.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$reactions = get_comments( [
  'post_id' => get_the_ID(),
  'type'    => [ 'like', 'repost' ],
  'status'  => 'approve',
  'orderby' => 'comment_date_gmt',
  'order'   => 'ASC',
] );

if ( ! $reactions ) {
  return;
}

$types  = array_count_values( wp_list_pluck( $reactions, 'comment_type' ) );
$counts = array_filter( [
  ! empty( $types['like'] ) ? fi_count( $types['like'], 'tykkäys', 'tykkäystä' ) : '',
  ! empty( $types['repost'] ) ? fi_count( $types['repost'], 'boostaus', 'boostausta' ) : '',
] );

// One face per person, however many ways they reacted
$people = [];
foreach ( $reactions as $reaction ) {
  $people[ $reaction->comment_author_url ] ??= $reaction;
}
?>
<div class="rx">
  <ul class="rx-faces" aria-label="Reagoineet">
    <?php foreach ( array_slice( $people, 0, REACTION_FACES ) as $person ) : ?>
      <li>
        <a href="<?php echo esc_url( $person->comment_author_url ); ?>" title="<?php echo esc_attr( $person->comment_author ); ?>">
          <img src="<?php echo esc_url( get_avatar_url( $person, [ 'size' => 64 ] ) ); ?>" alt="<?php echo esc_attr( $person->comment_author ); ?>" width="32" height="32" loading="lazy">
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
  <p class="rx-count meta-text"><?php the_icon( 'heart', 'ic-sm' ); ?><?php echo esc_html( implode( ' · ', $counts ) ); ?></p>
</div>
