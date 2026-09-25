import * as React from 'react';

import { Code } from './code';

const sources = import.meta.glob<string>('../../src/components/*.tsx', {
  query: '?raw',
  import: 'default',
});

const guidance: Record<string, string[]> = {
  button: [
    'Use a verb that describes the outcome. Reserve one primary action per section.',
    'Buttons default to type="button". Set type="submit" for form submission. Loading and disabled asChild links block activation.',
    'Use IconButton with a specific label for actions that only show an icon.',
  ],
  composer: [
    'Enter sends; Shift+Enter inserts a line. IME composition does not submit.',
    'Return a promise from onSubmit. The draft clears after success and stays in place after rejection.',
    'Supply onStop when streaming. Surface a clear error through submitErrorText and use onSubmitError for application reporting.',
  ],
  combobox: [
    'Label the trigger with aria-label or a connected FieldLabel. Pass aria-describedby for help and errors.',
    'The combobox trigger opens a search dialog with Enter, Space, or an arrow key; cmdk manages the searchable list inside it. Escape closes and restores focus.',
    'Pass name to include the selected value in FormData. Validate required values in your form; hidden inputs do not support native required validation.',
  ],
  field: [
    'Connect FieldLabel htmlFor to the control id.',
    'Connect hint and error IDs through aria-describedby and set aria-invalid on invalid controls.',
    'Explain how to fix an error. Avoid showing errors before the person has interacted with a field.',
  ],
  input: [
    'Use a persistent label. Placeholders are examples, not labels.',
    'Choose type, inputMode, and autoComplete for the actual data being entered.',
    'Forwarded refs support form libraries and focus restoration.',
  ],
  textarea: [
    'Use a visible label and aria-describedby for help or character limits.',
    'Allow vertical resizing. Avoid a small fixed height for long instructions.',
  ],
  progress: [
    'Provide aria-label or aria-labelledby; the visual fill alone has no accessible name.',
    'value and max use the same units. Finite values are clamped to the valid range.',
    'Omit value or pass null for indeterminate work. Use nearby text to explain what is happening.',
  ],
  'copy-button': [
    'Works without a Toaster: its live status announces success and clipboard failure.',
    'Keep the source text selectable so people can copy manually if clipboard access is blocked.',
    'onCopySuccess and onCopyError let applications report the outcome.',
  ],
  conversation: [
    'New messages follow the scroll only while the reader is at the bottom.',
    'Jump to latest respects reduced motion. Provide a fixed or bounded height for the scroll container.',
    'Use concise completed-message announcements in the app if token-by-token updates are too verbose for a screen reader.',
  ],
  dialog: [
    'Always include DialogTitle. Add DialogDescription when additional context is useful.',
    'Escape closes and focus returns to the trigger. Long content scrolls inside the bounded panel.',
    'Use AlertDialog for a consequential confirmation and make Cancel the safe path.',
  ],
  'alert-dialog': [
    'Include a title, a specific description, and a clearly labeled Cancel action.',
    'Focus starts on Cancel. Explain the consequence in the confirming button label.',
    'Prevent dismissal in your application while a committed mutation is pending.',
  ],
  steps: [
    'current is a zero-based index. Use items.length when all steps are complete.',
    'Keep titles short; longer titles wrap rather than disappearing.',
    'Use vertical orientation for narrow layouts or steps with substantial descriptions.',
  ],
};

const api: Record<string, [string, string, string][]> = {
  button: [
    [
      'variant',
      'default | brand | soft | secondary | outline | ghost | destructive | link',
      'default',
    ],
    ['size', 'xs | sm | default | lg | icon | icon-sm | icon-lg', 'default'],
    ['loading', 'boolean', 'false'],
    ['asChild', 'boolean', 'false'],
    ['type', 'button | submit | reset', 'button'],
  ],
  composer: [
    ['onSubmit', '(text: string) => void | Promise<void>', 'required'],
    ['value / onValueChange', 'controlled text and change handler', 'uncontrolled'],
    ['onSubmitError', '(error: unknown) => void', '—'],
    ['submitErrorText', 'string', 'draft-preserving error message'],
    ['streaming / onStop', 'boolean / () => void', 'false / —'],
  ],
  progress: [
    ['value', 'number | null', 'indeterminate'],
    ['max', 'number', '100'],
  ],
  'copy-button': [
    ['value', 'string', 'required'],
    ['label', 'string', 'Copy'],
    ['onCopySuccess', '() => void', '—'],
    ['onCopyError', '(error: unknown) => void', '—'],
  ],
  combobox: [
    ['options', 'ComboboxOption[]', 'required'],
    ['value', 'string | null', 'required'],
    ['onValueChange', '(value: string | null) => void', 'required'],
    ['onSearchChange', '(search: string) => void; disables client filtering', '—'],
    ['name', 'string; FormData field name', '—'],
    ['clearable', 'boolean', 'true'],
  ],
};

export function ComponentDetails({ name }: { name: string }) {
  const [showSource, setShowSource] = React.useState(false);
  const [source, setSource] = React.useState('// Loading source…');
  React.useEffect(() => {
    if (!showSource) return;
    let active = true;
    const load = sources[`../../src/components/${name}.tsx`];
    if (load)
      void load()
        .then((text) => {
          if (active) setSource(text);
        })
        .catch(() => {
          if (active) setSource('// Source could not load. Refresh to retry.');
        });
    return () => {
      active = false;
    };
  }, [name, showSource]);
  const notes = guidance[name] ?? [
    'Keep labels and status messages understandable without relying on color or icons alone.',
    'Compose this component with the matching Burtson form, feedback, and layout primitives.',
    'Check keyboard navigation and light/dark contrast in the final application context.',
  ];
  return (
    <>
      <section className="mt-10" aria-labelledby="usage-heading">
        <h2 id="usage-heading" className="mb-3 text-xl font-semibold tracking-tight">
          Usage and accessibility
        </h2>
        <ul className="grid list-disc gap-2 pl-5 text-sm leading-6 text-muted-foreground">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>
      {api[name] && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Key props</h2>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{name} properties</caption>
              <thead className="bg-muted">
                <tr>
                  {['Prop', 'Type / behavior', 'Default'].map((heading) => (
                    <th key={heading} scope="col" className="p-3 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {api[name].map(([prop, type, value]) => (
                  <tr key={prop} className="border-t">
                    <th scope="row" className="p-3 font-mono text-xs font-normal">
                      {prop}
                    </th>
                    <td className="p-3 text-muted-foreground">{type}</td>
                    <td className="p-3 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Inherited native and primitive props are included in the TypeScript source below.
          </p>
        </section>
      )}
      <section className="mt-10">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Own the implementation</h2>
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Inspect the exact component used by this preview, including types, variants, and
          dependencies.
        </p>
        <button
          type="button"
          className="mb-3 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          aria-expanded={showSource}
          aria-controls="component-source"
          onClick={() => setShowSource((value) => !value)}
        >
          {showSource ? 'Hide source' : 'View component source'}
        </button>
        <div id="component-source" hidden={!showSource}>
          {showSource && <Code code={source} />}
        </div>
      </section>
    </>
  );
}
