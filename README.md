# The Purple People Eater

The WordPress theme of [Rollemaa.fi](https://www.rollemaa.fi), a Finnish personal blog with writing since 2005 and a daily diary, Lokikirja, since 2021.

![The front page of rollemaa.fi in dark mode: the post and word counts in a large serif, a bar chart of texts per year below](screenshot.png)

This theme is **not for the public to use**. It is made for my own website, it is in Finnish, and it depends on code that does not work anywhere else. It is here for backup and so you can see how it was done.

The previous theme is [Minimalist Madness](https://github.com/rollecode/minimalistmadness). This repository grew out of it, so its history goes back to 25.3.2020.

## Structure

A block theme with no build step: what is in this repository is what runs.

```
the-purple-people-eater/
├── theme.json         Design tokens, layout sizes and block defaults
├── templates/         Pages as block markup
├── parts/             Header and footer
├── patterns/          Repeating pieces: cards, byline, diary parts
├── css/
│   ├── site.css       The design, also loaded in the editor
│   ├── blocks/        Styles loaded only with their block
│   ├── legacy.css     Markup of posts older than the block editor
│   └── prism.css      Code highlighting, loaded when needed
├── js/
│   ├── front-end.js   Interactions and the dynamic parts of a page
│   ├── gutenberg-editor.js  Editor settings
│   ├── heatmap.js     Writing heatmap on the diary archive
│   └── prism.js       Code highlighting, loaded when needed
├── fonts/             Instrument Serif, Atkinson Hyperlegible Next and Geist
├── svg/               Icon sprite and the diary's mood, device and weather icons
└── images/            Author photo and defaults
```

Core blocks do the work: Query Loop for the lists, post blocks for the texts, core navigation for the menu. `functions.php` loads assets and registers block styles. Posts open in the editor inside their template, so writing looks the same as reading.

Everything that is not presentation lives in the `rollemaa-site` mu-plugin in the site's own private repository: the diary, REST routes, search, comments from the fediverse. A theme switch never takes those with it.

## Credits

The theme started from [Air](https://github.com/digitoimistodude/air), Dude's starter theme, in 2020.
