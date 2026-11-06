// A sticky gauge from AI positive to AI critical; each h2 section gets a score (js/modules/stance-meter.js moves the dot)
// Editor scripts share one global scope, so this one keeps its names in a block
{
  const SCORE = { min: -2, max: 2, step: 0.5 };
  const INTRO = '';

  const plainText = (html) => new DOMParser().parseFromString(String(html), 'text/html').body.textContent.trim();

  const headingsOf = (blocks) => blocks.flatMap((block) => {
    const inner = headingsOf(block.innerBlocks);
    const isSection = 'core/heading' === block.name && 2 === (block.attributes.level ?? 2);

    return isSection ? [ plainText(block.attributes.content), ...inner ] : inner;
  });

  const Edit = ({ attributes: { stops }, setAttributes }) => {
    const { createElement: el, Fragment } = wp.element;
    const { InspectorControls, useBlockProps } = wp.blockEditor;
    const { PanelBody, RangeControl } = wp.components;
    // The post's own blocks; the block editor's tree is the template around them
    const headings = wp.data.useSelect((select) => headingsOf(select('core/editor').getEditorBlocks()), []);
    const sections = [ INTRO, ...headings ];
    const scored = sections.filter((name) => undefined !== stops[name]).length;
    const setScore = (name, score) => setAttributes({ stops: { ...stops, [name]: score } });

    return el(Fragment, null,
      el(InspectorControls, null,
        el(PanelBody, { title: 'Osioiden sävy' },
          sections.map((name) => el(RangeControl, {
            key: name || 'intro',
            label: name || 'Alku',
            help: '2 on myönteinen, -2 kriittinen',
            value: stops[name] ?? 0,
            onChange: (score) => setScore(name, score ?? 0),
            ...SCORE,
          })))),
      el('div', useBlockProps({ className: 'stance-meter-editor' }),
        el('strong', null, 'AI-mittari'),
        el('span', null, ` ${scored}/${sections.length} osiota pisteytetty. Pisteet sivupalkissa.`)));
  };

  const save = ({ attributes: { stops } }) => {
    const { createElement: el } = wp.element;

    return el('aside', { ...wp.blockEditor.useBlockProps.save({ className: 'stance-meter' }), 'data-stops': JSON.stringify(stops), 'aria-hidden': 'true' },
      el('span', { className: 'stance-label' }, 'AI-myönteinen'),
      el('span', { className: 'stance-track' }, el('span', { className: 'stance-dot' })),
      el('span', { className: 'stance-label' }, 'AI-kriittinen'));
  };

  wp.blocks.registerBlockType('the-purple-people-eater/stance-meter', {
    apiVersion: 3,
    title: 'AI-mittari',
    description: 'Sivussa pysyvä mittari, joka seuraa tekstin sävyä tekoälyyn osio kerrallaan.',
    category: 'widgets',
    icon: 'performance',
    supports: { html: false, multiple: false, customClassName: false },
    attributes: { stops: { type: 'object', default: {} } },
    edit: Edit,
    save,
  });
}
