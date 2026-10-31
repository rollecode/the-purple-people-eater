<?php
/**
 * Title: Opening
 * Slug: the-purple-people-eater/opening
 * Inserter: no
 *
 * @package the-purple-people-eater
 */

$icons = get_theme_file_uri( 'svg/icons.svg' );

?>
<!-- wp:html -->
<header class="opening wrap"><h1 class="statement">Rollemaa on Rollen blogi, joka sisältää <em><span data-stat="texts">3319</span> kirjoitusta</em>, eli <em><span data-stat="words">750 976</span> sanaa</em>.</h1><p class="imprint">Rolle Laukkarinen · Jyväskylä · kirjoituksia vuodesta 2005</p><div class="follow-row"><a href="<?php echo esc_url( home_url( '/feed/' ) ); ?>"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#rss"></use></svg>RSS</a><a href="https://mementomori.social/@rolle" rel="me"><svg class="ic" aria-hidden="true"><use href="<?php echo esc_url( $icons ); ?>#masto"></use></svg>@rolle@mementomori.social</a></div></header>
<!-- /wp:html -->
