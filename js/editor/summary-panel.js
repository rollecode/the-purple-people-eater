// AI summary (rollemaa-site summary.php): edit by hand, or have Gemini write it on the server
wp.plugins.registerPlugin('rollemaa-summary', {
  render: () => {
    const { createElement: el, useState } = wp.element;
    const { useSelect, useDispatch } = wp.data;
    const { TextareaControl, Button, Notice } = wp.components;
    const { postId, postType, summary } = useSelect((select) => {
      const editor = select('core/editor');

      return {
        postId: editor.getCurrentPostId(),
        postType: editor.getCurrentPostType(),
        summary: editor.getEditedPostAttribute('meta')?.rollemaa_summary ?? '',
      };
    }, []);
    const { editPost } = useDispatch('core/editor');
    const [ busy, setBusy ] = useState(false);
    const [ error, setError ] = useState('');

    if ('post' !== postType) {
      return null;
    }

    const write = () => {
      setBusy(true);
      setError('');
      wp.apiFetch({ path: `/rollemaa/v1/summary/${postId}`, method: 'POST' })
        .then((response) => editPost({ meta: { rollemaa_summary: response.summary } }))
        .catch((failure) => setError(failure.message))
        .finally(() => setBusy(false));
    };

    return el(wp.editor.PluginDocumentSettingPanel, { name: 'rollemaa-summary', title: 'Juttu tiivistettynä' },
      el(TextareaControl, {
        label: 'Tiivistelmä',
        hideLabelFromVision: true,
        value: summary,
        rows: 6,
        onChange: (value) => editPost({ meta: { rollemaa_summary: value } }),
        help: 'Näkyy artikkelin alussa suljettuna laatikkona. Tyhjä piilottaa sen.',
      }),
      error && el(Notice, { status: 'error', isDismissible: false }, error),
      el(Button, { variant: 'secondary', isBusy: busy, disabled: busy, onClick: write }, summary ? 'Kirjoita uudelleen tekoälyllä' : 'Kirjoita tekoälyllä'));
  },
});
