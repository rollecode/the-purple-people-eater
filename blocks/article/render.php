<?php
/**
 * The article element around a post, with its post classes.
 *
 * @package minimalistmadness
 */

namespace Air_Light;

?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</article>
