<?php
/**
 * Site footer: the umbrella, a line about the site and every other place
 * Rolle is active, the two ways to follow it, then the copyright and the
 * theme switch. Included by the classic footer.php and the
 * the-purple-people-eater/site-footer block.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$stats     = site_stats();
$elsewhere = [
  [ 'Mastodon', 'https://mementomori.social/@rolle', 'masto' ],
  [ 'Bluesky', 'https://bsky.app/profile/rolle.social', 'bluesky' ],
  [ 'Threads', 'https://www.threads.net/@rolle_', 'threads' ],
  [ 'Instagram', 'https://www.instagram.com/rolle_', 'insta' ],
  [ 'GitHub', 'https://github.com/rollecode', 'github' ],
  [ 'LinkedIn', 'https://www.linkedin.com/in/rolaukka/', 'linkedin' ],
  [ 'Strava', 'https://www.strava.com/athletes/16582440', 'strava' ],
  [ 'Last.fm', 'https://www.last.fm/user/rolle-', 'lastfm' ],
  [ 'Trakt', 'https://trakt.tv/users/rolle', 'trakt' ],
  [ 'Rollekino', 'https://www.rollekino.fi', 'rollekino' ],
];
?>
<footer class="site-foot" id="colophon">
  <div class="inner">
    <div class="foot-top">
      <div class="sign">
        <a class="foot-mark" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Rollemaa, etusivu"><?php the_umbrella(); ?></a>
        <div>
          <p class="foot-line">Rollen blogi ja lokikirja. Kirjoituksia vuodesta 2005,<br>päivittäinen päiväkirja vuodesta 2021.</p>
          <p class="foot-stats meta-text"><?php echo esc_html( sprintf( '%s kirjoitusta · %s lokikirjan päivää · %s sanaa', fi_number( $stats['posts'] ), fi_number( $stats['diary'] ), fi_number( $stats['words'] ) ) ); ?></p>

          <nav class="foot-elsewhere" aria-label="Rolle muualla">
            <ul>
              <?php foreach ( $elsewhere as [ $name, $url, $icon ] ) : ?>
                <li><a href="<?php echo esc_url( $url ); ?>" aria-label="<?php echo esc_attr( $name ); ?>" title="<?php echo esc_attr( $name ); ?>"><?php the_icon( $icon ); ?></a></li>
              <?php endforeach; ?>
            </ul>
          </nav>
        </div>
      </div>

      <div class="foot-follow">
        <a class="btn" href="https://mementomori.social/@rolle" rel="me"><?php the_icon( 'masto' ); ?>Seuraa Mastodonissa</a>
        <a class="btn btn-ghost" href="<?php echo esc_url( get_feed_link() ); ?>"><?php the_icon( 'rss' ); ?>RSS-syöte</a>
      </div>
    </div>

    <div class="foot-base">
      <p>Oikeudet omistaa Rolle Laukkarinen, 1999–<?php echo esc_html( wp_date( 'Y' ) ); ?>.</p>

      <div class="themesw" role="group" aria-label="Väriteema">
        <button type="button" aria-pressed="false" data-theme-set="light"><?php the_icon( 'sun', 'ic-sm' ); ?>Vaalea</button>
        <button type="button" aria-pressed="false" data-theme-set="dark"><?php the_icon( 'moon', 'ic-sm' ); ?>Tumma</button>
        <button type="button" aria-pressed="false" data-theme-set="auto"><?php the_icon( 'auto', 'ic-sm' ); ?>Automaattinen</button>
      </div>
    </div>
  </div>
</footer>
