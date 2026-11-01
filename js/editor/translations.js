// Finnish language packs translate this key, and an unknown value empties the excerpt and miscounts words
wp.hooks.addFilter('i18n.gettext_with_context', 'the-purple-people-eater', (translation, text, context) => ('Word count type. Do not translate!' === context ? 'words' : translation));

// Short units as on the site (rollemaa-site mu-plugin, ngettext)
wp.hooks.addFilter('i18n.ngettext', 'the-purple-people-eater', (translation, single, plural, number) => {
  if ('%s minute' === single) {
    return '%s min';
  }

  // The number goes in already formatted: as fi_number() in PHP, no separator under five digits
  if ('%s word' === single) {
    const count = Number(number);
    const formatted = count < 10000 ? String(count) : count.toLocaleString('fi-FI');

    return 1 === count ? `${formatted} sana` : `${formatted} sanaa`;
  }

  return translation;
});
