/**
 * Editor settings. Buildless, uses editor globals.
 */

// The excerpt sits in the template, but it is the text's own and stays editable
wp.hooks.addFilter('editor.postContentBlockTypes', 'the-purple-people-eater', (types) => [ ...types, 'core/post-excerpt' ]);

// Finnish language packs translate this key, and an unknown value empties the excerpt and miscounts words
wp.hooks.addFilter('i18n.gettext_with_context', 'the-purple-people-eater', (translation, text, context) => ('Word count type. Do not translate!' === context ? 'words' : translation));
