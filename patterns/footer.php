<?php
/**
 * Title: Footer
 * Slug: the-purple-people-eater/footer
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:group {"tagName":"footer","anchor":"colophon","className":"site-foot"} -->
<footer id="colophon" class="wp-block-group site-foot"><!-- wp:group {"className":"inner"} -->
<div class="wp-block-group inner"><!-- wp:group {"className":"foot-top"} -->
<div class="wp-block-group foot-top"><!-- wp:group {"className":"sign"} -->
<div class="wp-block-group sign"><!-- wp:html -->
<a class="foot-mark" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Rollemaa, etusivu"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a1 1 0 0 0 1 1h8v6a3 3 0 0 0 6 0 1 1 0 0 0-2 0 1 1 0 0 1-2 0v-6h8a1 1 0 0 0 1-1A10 10 0 0 0 12 2zm-7.94 9a8 8 0 0 1 15.88 0z"/></svg></a>
<!-- /wp:html -->

<!-- wp:group -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"foot-line"} -->
<p class="foot-line">Rollen blogi ja lokikirja. Kirjoituksia vuodesta 2005,<br>päivittäinen päiväkirja vuodesta 2021.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"foot-stats meta-text"} -->
<p class="foot-stats meta-text"><span data-stat="posts">1629</span> kirjoitusta · <span data-stat="diary">1690</span> lokikirjan päivää · <span data-stat="words">750 976</span> sanaa</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<nav class="foot-elsewhere" aria-label="Rolle muualla"><ul><li><a href="https://mementomori.social/@rolle" aria-label="Mastodon" title="Mastodon"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#masto"></use></svg></a></li><li><a href="https://bsky.app/profile/rolle.social" aria-label="Bluesky" title="Bluesky"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#bluesky"></use></svg></a></li><li><a href="https://www.threads.net/@rolle_" aria-label="Threads" title="Threads"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#threads"></use></svg></a></li><li><a href="https://www.instagram.com/rolle_" aria-label="Instagram" title="Instagram"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#insta"></use></svg></a></li><li><a href="https://github.com/rollecode" aria-label="GitHub" title="GitHub"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#github"></use></svg></a></li><li><a href="https://www.linkedin.com/in/rolaukka/" aria-label="LinkedIn" title="LinkedIn"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#linkedin"></use></svg></a></li><li><a href="https://www.strava.com/athletes/16582440" aria-label="Strava" title="Strava"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#strava"></use></svg></a></li><li><a href="https://www.last.fm/user/rolle-" aria-label="Last.fm" title="Last.fm"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#lastfm"></use></svg></a></li><li><a href="https://trakt.tv/users/rolle" aria-label="Trakt" title="Trakt"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#trakt"></use></svg></a></li><li><a href="https://www.rollekino.fi" aria-label="Rollekino" title="Rollekino"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#rollekino"></use></svg></a></li></ul></nav>
<!-- /wp:html --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:html -->
<div class="foot-follow"><a class="btn" href="https://mementomori.social/@rolle" rel="me"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#masto"></use></svg>Seuraa Mastodonissa</a><a class="btn btn-ghost" href="<?php echo esc_url( home_url( '/feed/' ) ); ?>"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#rss"></use></svg>RSS-syöte</a></div>
<!-- /wp:html --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"foot-base"} -->
<div class="wp-block-group foot-base"><!-- wp:paragraph -->
<p>Oikeudet omistaa Rolle Laukkarinen, 1999–2026.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="themesw" role="group" aria-label="Väriteema"><button type="button" aria-pressed="false" data-theme-set="light"><svg class="ic ic-sm" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#sun"></use></svg>Vaalea</button><button type="button" aria-pressed="false" data-theme-set="dark"><svg class="ic ic-sm" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#moon"></use></svg>Tumma</button><button type="button" aria-pressed="false" data-theme-set="auto"><svg class="ic ic-sm" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#auto"></use></svg>Automaattinen</button></div>
<!-- /wp:html --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></footer>
<!-- /wp:group -->
