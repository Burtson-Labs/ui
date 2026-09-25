import * as React from 'react';

import { Code } from './code';

const sources = import.meta.glob<string>('../../src/components/*.tsx', {
  query: '?raw',
  import: 'default',
});

const guidance: Record<string, string[]> = {
  resizable: [
    'Give every panel an id and every handle an aria-label naming what it resizes.',
    'Arrow keys move a focused handle, Home and End jump to the limits, Enter collapses a collapsible panel. Double-click resets.',
    'The pointer is captured while dragging, so moving over an iframe or terminal keeps resizing. Persist sizes from onLayoutChanged.',
  ],
  'tree-view': [
    'Controlled: pass expanded and selected ids and update them in the callbacks. Ids must be stable across renders.',
    'One tab stop. Up and Down move, Right expands or enters, Left collapses or goes to the parent, Home and End, and typing jumps by label. Enter runs onAction.',
    'Typing in an input inside a row (rename) never moves focus. If the focused row is removed, focus moves to its parent or neighbour.',
  ],
  'editor-tabs': [
    'onClose is a request: for a dirty tab, ask to save or discard and only then remove it from tabs.',
    'Left and Right move focus, Enter opens, Delete asks to close, Ctrl+Shift+PageUp and PageDown reorder. Middle-click closes; drag reorders.',
    'Unsaved state is announced with the tab name. The strip scrolls and keeps the active tab in view.',
  ],
  'context-menu': [
    'Opens at the pointer on right-click, and from the keyboard with the context-menu key or Shift+F10 on the focused target.',
    'Keep the same command names and shortcuts as the menubar and palette.',
  ],
  menubar: [
    'Left and Right move between menus, Down opens one. Once a menu is open, hovering another trigger switches to it.',
    'Show shortcuts with MenubarShortcut; handle the shortcut itself in your command layer.',
  ],
  tour: [
    'Start tours from a button, never during typing, a running task or a permission prompt. Store completion yourself, keyed by tour id and revision.',
    'Mark targets with TourAnchor or tourTarget(id). Use prepare to open a panel first; a target that never appears shows the step centred (or skip it with missingTarget="skip").',
    'Escape ends the tour unless the person is typing in a field or editor. Focus returns to what started it. Spotlight is informational and never takes focus.',
  ],
  'onboarding-checklist': [
    'Mark an item done from a real event, such as a repository opening, not from a click on the list.',
    'Keep it to a few meaningful tasks and let people dismiss it. Persisting the dismissal is up to the app.',
  ],
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
  resizable: [
    ['orientation', 'horizontal | vertical', 'horizontal'],
    ['layout / onLayoutChange', 'Record<panelId, percent> and handler', 'uncontrolled'],
    ['onLayoutChanged', '(layout, { isUserInteraction }) => void; persist here', '—'],
    ['Panel: minSize / maxSize / collapsible', 'number (px) or "20%"', '0 / 100% / false'],
    ['ResizeHandle: aria-label / withHandle', 'string (required) / boolean', '— / false'],
  ],
  'tree-view': [
    [
      'nodes',
      'TreeNode[] { id, label, children?, hasChildren?, loading?, icon?, meta? }',
      'required',
    ],
    ['expanded / onExpandedChange', 'string[] / (ids) => void', 'required'],
    ['selected / onSelectedChange', 'string[] / (ids) => void', 'required'],
    ['selectionMode', 'single | multiple', 'single'],
    ['onAction', '(id) => void; Enter and double-click', '—'],
    ['actionOnClick', 'boolean; a plain click on a leaf runs onAction', 'false'],
    ['expandOnClick', 'boolean; a plain click toggles a folder', 'true for single'],
    ['indentGuides', 'boolean; ancestor lines on hover', 'false'],
    ['onLoadChildren', '(id) => void', '—'],
    ['renderLabel', '(node) => ReactNode; e.g. a rename input', 'label'],
    ['density', 'compact | default', 'default'],
  ],
  'editor-tabs': [
    ['tabs', 'EditorTab[] { id, label, description?, dirty?, closeable?, preview? }', 'required'],
    ['activeId / onActiveChange', 'string | null / (id) => void', 'required'],
    ['onClose', '(id) => void; a request, the app decides', '—'],
    ['onMove', '(id, toIndex) => void; pointer drag or Ctrl+Shift+PageUp/Down', '—'],
    ['actions', 'ReactNode; right-hand buttons', '—'],
  ],
  tour: [
    ['steps', 'TourStep[] { id, target?, title, content, side?, prepare? }', 'required'],
    ['open / step / onStepChange', 'boolean / number / (step) => void', 'required'],
    ['onEnd', "(reason: 'complete' | 'skip' | 'close' | 'escape', step) => void", 'required'],
    ['missingTarget', 'center | skip', 'center'],
    ['waitMs', 'number; how long to wait for a late target', '2000'],
    ['dim', 'boolean', 'true'],
  ],
  'onboarding-checklist': [
    ['items', 'ChecklistItem[] { id, title, description?, done, action? }', 'required'],
    ['onDismiss', '() => void', '—'],
    ['complete', 'ReactNode; shown once every item is done', '—'],
  ],
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
