<?php
/**
 * The day under a diary entry: what Rolle is grateful for, the day's
 * measures as bars and the conditions it was written in.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

$gratitude  = get_post_meta( get_the_ID(), 'gratitude', true );
$scales     = diary_scales( get_the_ID() );
$conditions = diary_conditions( get_the_ID() );

if ( ! $gratitude && ! $scales && ! $conditions ) {
  return;
}
?>
<section class="day" aria-label="<?php echo esc_attr( get_the_title() . ', päivän tiedot' ); ?>">
  <?php if ( $gratitude ) : ?>
    <div class="day-grat">
      <p class="day-label meta-text">Tänään olen kiitollinen</p>
      <p class="day-grat-text"><?php echo wp_kses_post( $gratitude ); ?></p>
    </div>
  <?php endif; ?>

  <?php if ( $scales ) : ?>
    <ul class="day-scales">
      <?php foreach ( $scales as $label => $value ) : ?>
        <li class="is-<?php echo esc_attr( diary_scale_tone( $label, $value ) ); ?>">
          <span class="meta-text"><?php echo esc_html( $label ); ?></span>
          <b><?php echo esc_html( $value ); ?> %</b>
          <span class="day-bar" aria-hidden="true"><i style="width: <?php echo esc_attr( min( 100, $value ) ); ?>%"></i></span>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <?php if ( $conditions ) : ?>
    <p class="day-conds meta-text">
      <?php foreach ( $conditions as $condition ) : ?>
        <span>
          <?php the_diary_icon( $condition['icon'] ); ?>
          <?php if ( ! empty( $condition['url'] ) ) : ?>
            <a href="<?php echo esc_url( $condition['url'] ); ?>"><?php echo esc_html( $condition['text'] ); ?></a>
          <?php else : ?>
            <?php echo esc_html( $condition['text'] ); ?>
          <?php endif; ?>
        </span>
      <?php endforeach; ?>
    </p>
  <?php endif; ?>
</section>
