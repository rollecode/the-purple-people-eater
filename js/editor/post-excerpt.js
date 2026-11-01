// The excerpt sits in the template, but it is the text's own and stays editable
wp.hooks.addFilter('editor.postContentBlockTypes', 'the-purple-people-eater', (types) => [ ...types, 'core/post-excerpt' ]);
