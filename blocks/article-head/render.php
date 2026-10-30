<?php
/**
 * Article head: on the featured image when there is one, otherwise plain.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

?>
<header class="<?php echo has_photo_hero() ? 'photo-hero' : 'read art-head'; ?>">
<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</header>
