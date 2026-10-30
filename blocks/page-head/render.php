<?php
/**
 * A page's title large, unless the content opens with its own.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

if ( get_post() && page_has_own_title() ) {
  return;
}
?>
<header class="page-hero">
<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</header>
