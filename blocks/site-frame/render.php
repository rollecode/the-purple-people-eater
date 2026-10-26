<?php
/**
 * Site frame: skip link and the .site wrapper around the whole page.
 * $content is the rendered inner blocks (header, content, footer).
 *
 * @package minimalistmadness
 */

?>
<a class="skip-link screen-reader-text" href="#content"><?php echo esc_html( \Air_Light\get_default_localization( 'Skip to content' ) ); ?></a>
<div class="site">
<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>
