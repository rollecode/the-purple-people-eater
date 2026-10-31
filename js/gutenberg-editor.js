/**
 * Block styles and editor settings. Buildless, uses editor globals.
 */

wp.blocks.registerBlockStyle('core/paragraph', {
  name: 'boxed',
  label: 'Laatikko',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'no-bullets',
  label: 'Ilman listamerkkejä',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'todo-list',
  label: 'Todo-lista',
});

wp.blocks.registerBlockStyle('core/list-item', {
  name: 'checked',
  label: 'Tehty tehtävä',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'green-shades',
  label: 'Vihreät tasot',
});

wp.blocks.registerBlockStyle('core/list', {
  name: 'red-shades',
  label: 'Punaiset tasot',
});

// The excerpt sits in the template, but it is the text's own and stays editable
wp.hooks.addFilter('editor.postContentBlockTypes', 'the-purple-people-eater', (types) => [ ...types, 'core/post-excerpt' ]);

// Finnish language packs translate this key, and an unknown value empties the excerpt and miscounts words
wp.hooks.addFilter('i18n.gettext_with_context', 'the-purple-people-eater', (translation, text, context) => ('Word count type. Do not translate!' === context ? 'words' : translation));
