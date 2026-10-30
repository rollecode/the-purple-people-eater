<?php
/**
 * "Kuka Rolle?": a few words and photos from Instagram.
 *
 * @package the-purple-people-eater
 */

namespace Air_Light;

$photos = [
  [ 'instagram-5.jpg', 750, 'https://www.instagram.com/p/_P_FY3G0Vm', 'Kahvikuppi, jonka pinnalle heijastuu koodia' ],
  [ 'instagram-2.jpg', 1080, 'https://www.instagram.com/p/BWkzo1YH41w', 'Rolle ja Manu-poika hymyilevät' ],
  [ 'instagram-3.jpg', 1080, 'https://www.instagram.com/p/BkvleS7HJWF', 'Rolle ja Veera-vaimo hymyilevät' ],
  [ 'instagram-4.jpg', 750, 'https://www.instagram.com/p/BD0kbXIm0T3', 'Rolle koodaa läppärillä puiston penkillä' ],
  [ 'instagram-1.jpg', 1080, 'https://www.instagram.com/p/BNL6xgrg3iR', 'Taiteellinen tummataustainen potrettikuva Rollesta' ],
];
?>
<section class="wrap who" aria-labelledby="who-title">
  <div class="who-text">
    <h2 id="who-title">Kuka Rolle?</h2>
    <p>Rolle Laukkarinen on paljasjalkainen jyväskyläläinen, nörtti, yrittäjä ja perheenisä, joka on blogannut vuodesta 1999.</p>
    <a class="textlink" href="<?php echo esc_url( get_permalink( ABOUT_PAGE_ID ) ); ?>">Lue lisää <?php the_icon( 'arrow' ); ?></a>
  </div>

  <ul class="who-photos">
    <?php foreach ( $photos as [ $file, $size, $url, $alt ] ) : ?>
      <li>
        <a href="<?php echo esc_url( $url ); ?>">
          <img src="<?php echo esc_url( get_theme_file_uri( 'images/' . $file ) ); ?>" alt="<?php echo esc_attr( $alt ); ?>" width="<?php echo (int) $size; ?>" height="<?php echo (int) $size; ?>" loading="lazy">
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
</section>
