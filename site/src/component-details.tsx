import * as React from 'react';

import ownLicense from '../../LICENSE?raw';
import upstreamLicense from '../../LICENSES/shadcn-MIT.txt?raw';

import { ApiReference } from './api-reference';
import { Code } from './code';

const sources = import.meta.glob<string>('../../src/components/*.tsx', {
  query: '?raw',
  import: 'default',
});

const guidance: Record<string, string[]> = {
  attachment: [
    'Show the state your app reports: queued, uploading, parsing (reading), ready or failed. The component never uploads anything.',
    'Say why a file failed and what to do about it, and offer Retry when a retry can work.',
    'In a Composer, pass attachmentCount so a message with only files can be sent, and canSubmit={false} while a file is still being read.',
  ],
  source: [
    'Number citations in the order they first appear and use the same numbers in the SourceList.',
    'Only http and https URLs become links; anything else is shown as plain text.',
    'The snippet should be the passage the answer relied on, not the start of the document.',
  ],
  'connection-status': [
    'Report state from real checks. Unknown means nobody has checked yet and never shows as connected.',
    'Keep ConnectionBanner mounted; it only appears while offline, reconnecting or failed.',
    'Say what still works while offline, e.g. that messages will send when the connection is back.',
  ],
  'mobile-nav': [
    'Three to five destinations with visible labels. Put settings and administration elsewhere rather than adding tabs.',
    'Use position="fixed" in an app and pad the page bottom by the bar height. The bar adds the safe-area inset itself.',
    'For links, call event.preventDefault() in onValueChange and route with your router.',
  ],
  table: [
    'Give the table a caption or an aria-label, and scope="col" on header cells.',
    'Pass scrollLabel when the table can scroll (narrow screens, a height with stickyHeader): the container becomes a named region that joins the tab order while it overflows, so keyboard users can scroll it.',
    'containerProps reach the scrolling wrapper, for a tabIndex, aria-labelledby or ref of your own.',
  ],
  'data-table': [
    'Controlled: sort, filter and page in your app or on the server and pass the rows to show. The table never reorders rows.',
    'Rows are one tab stop: arrow keys move, Enter runs onRowAction, Space toggles selection.',
    'Select all applies to the rows on this page. Put bulk actions in toolbar and confirm destructive ones with Alert Dialog.',
    'Below cardsBelow (768px by default) the rows are a list of cards, each an article named by its title. Place columns with card: title, subtitle, aside (a status), field, footer or hidden. The title is the open button and covers the card; the checkbox and row actions keep their own 44px targets. Sorting moves to a Sort by menu.',
    'paginate pages in the browser: pass every row and it shows one page with a rows-per-page menu, back to page 1 when filter or sort changes. For server paging pass page, pageCount, onPageChange, and pageSize, onPageSizeChange and totalRows for the menu and the "1–25 of 312" summary.',
    'The table sits in a single minmax(0, 1fr) grid track, so a wide table scrolls inside its frame instead of widening a grid or flex parent.',
  ],
  pagination: [
    'Below 640px the pages collapse to "Page 2 of 13" between two 44px buttons; the summary and page-size menu move under them. The current page is announced when it changes.',
    'usePagination(rows, { resetKey, storageKey }) slices rows, clamps the page, goes back to page 1 when resetKey (search text, a filter) changes and can remember the page size. Spread its paginationProps onto Pagination.',
    'To keep the page in the URL, pass page and onPageChange (and pageSize, onPageSizeChange) from your router: read ?page= with clampPage, write it back with replace, and leave page 1 out of the URL so plain links stay plain.',
    'Server paging: pageWindow({ page, pageSize, total }) and paginationSummary() give the numbers without slicing, or pass total to usePagination.',
  ],
  'checkbox-card': [
    'Use for choices that need a sentence of explanation: roles, permissions, notification types. For short labels a plain Checkbox and Label is enough.',
    'The whole card toggles the checkbox; the title names it and the description describes it for screen readers. Focus shows once, on the card.',
    'Wrap related cards in CheckboxCardGroup so they get a legend. Disabling the group disables every card.',
  ],
  sheet: [
    'Always include SheetTitle. Bottom sheets show a grab bar and keep clear of the home indicator.',
    'showCloseButton={false} when the sheet has its own close control, such as a Done button or a header with a SheetClose, so there are not two.',
  ],
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
    'Pass attachmentCount so a message with only files can be sent, and canSubmit={false} while an attachment is still being read.',
    'Set onAttach to add the paperclip button, drag-and-drop onto the composer and pasting files. The composer only hands files over; upload them in your app and show their state in an AttachmentTray.',
  ],
  'chat-history': [
    'Pass the whole list; grouping (Pinned, Today, Yesterday, Previous 7 days, Older) uses the local calendar. groupConversations is exported for your own views.',
    'One row per chat. Up and Down move between rows, Home and End jump, Enter opens. The row menu offers only the actions you pass handlers for.',
    'Delete is a request: confirm it or offer undo in your app. For thousands of chats, window the rows with renderItems.',
  ],
  'chat-layout': [
    'Put a Conversation and a Composer in children; the composer stays at the bottom. The sidebar is resizable on desktop and a sheet on phones that closes when a chat is picked.',
    'Full screen uses the browser Fullscreen API where allowed and pins the layout over the page otherwise (iOS, iframes). Escape leaves either way and nothing remounts, so drafts and scroll stay put.',
    'useFullscreen(ref) is exported if you need the same behaviour elsewhere.',
  ],
  'audio-player': [
    'The waveform is a slider: arrow keys move 5 seconds, Home and End jump, Space plays and pauses. Its value is read as "0:10 of 1:00".',
    'Pass peaks from your server for long files, or computePeaks(blob) in the browser for short clips.',
    'Offer a transcript for every voice note; people read faster than they listen and some cannot listen at all.',
  ],
  'voice-recorder': [
    'Nothing is recorded until the person presses the microphone, and the browser asks for permission first.',
    'Blocked and unsupported microphones get a sentence that says how to fix it, not a disabled button with no explanation.',
    'Recording uses the recording colour token, not the error colour. Stop hands over a Blob; upload it and show it with VoiceMessage.',
  ],
  'message-actions': [
    'Pass MessageActions to Message actions; it appears on hover and focus, and always on touch screens.',
    'Feedback is controlled: store the rating and pass it back. Clicking the chosen thumb again clears it.',
    'MessageEditor edits a sent message in place: Enter sends (never mid-IME composition), Escape cancels.',
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
    'mobile="sheet" docks the dialog to the bottom edge below 640px, full width with a grab bar, which suits forms on a phone. Larger screens keep the centred window.',
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
    'Below compactBelow (640px by default) horizontal steps collapse to the current title, "Step 2 of 5" and a segmented bar. Screen readers get the current step with its position.',
  ],
};

const api: Record<string, [string, string, string][]> = {
  attachment: [
    ['AttachmentItem: name / size', 'string / number (bytes)', 'required / —'],
    ['state', 'queued | uploading | parsing | ready | failed', 'ready'],
    ['progress / error', 'number 0–100 / string', 'indeterminate / —'],
    ['onRemove / onRetry', '() => void', '—'],
    ['layout', 'chip | row', 'chip'],
    [
      'UploadQueue: files',
      'UploadQueueFile[] { id, name, size?, state, progress?, error? }',
      'required',
    ],
  ],
  source: [
    ['Source', '{ id, title, url?, snippet?, meta?, icon? }', '—'],
    ['SourceCitation: index / source', 'number / Source', 'required'],
    ['SourceList: sources / label', 'Source[] / string', 'required / Sources'],
  ],
  'connection-status': [
    [
      'ConnectionStatus: state',
      'connected | connecting | reconnecting | offline | error | unknown',
      'required',
    ],
    ['SyncStatus: state', 'synced | syncing | pending | offline | error | unknown', 'required'],
    ['lastSynced / pendingCount', 'Date / number', '—'],
    ['detail / onRetry', 'ReactNode (tooltip) / () => void', '—'],
    ['ConnectionBanner: description', 'ReactNode', '—'],
  ],
  'mobile-nav': [
    ['items', 'MobileNavItem[] { id, label, icon, href?, badge? }', 'required'],
    ['value / onValueChange', 'string / (id, event) => void', 'required / —'],
    ['position', 'fixed | static', 'static'],
  ],
  table: [
    ['density', 'compact | default', 'default'],
    ['stickyHeader', 'boolean', 'false'],
    ['scrollLabel', 'string (names the scroll region)', '—'],
    ['containerProps / containerClassName', 'div props / string', '—'],
  ],
  'data-table': [
    ['columns', 'DataTableColumn[] { id, header, cell, sortable?, numeric? }', 'required'],
    ['rows / getRowId / getRowLabel', 'T[] / (row) => string', 'required'],
    ['sort / onSortChange', '{ columnId, direction } | null', '—'],
    ['filter / onFilterChange', 'string / (value) => void', '—'],
    ['selected / onSelectedChange', 'string[] / (ids) => void', '—'],
    ['onRowAction / rowActions', '(row) => void / (row) => ReactNode', '—'],
    ['page / pageCount / onPageChange', 'number / number / (page) => void', '—'],
    [
      'pageSize / pageSizeOptions / onPageSizeChange',
      'number / number[] / (size) => void',
      '— / 25, 50, 100 / —',
    ],
    ['totalRows / rowNoun', 'number (server paging summary) / string ("members")', '—'],
    [
      'paginate',
      'boolean | { pageSize?, pageSizeOptions?, storageKey? }; pages rows in the browser',
      '—',
    ],
    ['cardsBelow', 'sm | md | lg | xl | false', 'md'],
    [
      'column.card',
      'title | subtitle | aside | field | footer | hidden',
      'first column title, others field',
    ],
    ['column.cardLabel / cardCell / cardOnly', 'string / (row) => ReactNode / boolean', '—'],
    ['column.hideBelow', 'sm | md | lg | xl; drops the table column below that width', '—'],
    ['loading / error / onRetry / empty', 'boolean / ReactNode / () => void / ReactNode', '—'],
  ],
  pagination: [
    ['page / pageCount / onPageChange', 'number (1-based) / number / (page) => void', 'required'],
    ['summary', 'ReactNode; worked out from total and pageSize when left out', '—'],
    ['total / pageSize', 'number / number', '—'],
    [
      'pageSizeOptions / onPageSizeChange',
      'number[] / (size) => void; adds the menu',
      '25, 50, 100 / —',
    ],
    [
      'pageSizeLabel / formatPageSize',
      'string / (size) => string',
      'Rows per page / "25 per page"',
    ],
    [
      'usePagination(rows, options)',
      '{ page?, defaultPage?, onPageChange?, pageSize?, defaultPageSize?, onPageSizeChange?, pageSizeOptions?, resetKey?, storageKey?, total? }',
      '—',
    ],
    [
      'returns',
      '{ rows, page, pageCount, pageSize, total, from, to, summary, hasPages, setPage, setPageSize, paginationProps }',
      '—',
    ],
    [
      'helpers',
      'paginate, pageWindow, pageCountFor, clampPage, paginationSummary, paginationRange',
      '—',
    ],
  ],
  steps: [
    ['items / current', 'StepItem[] { title, description? } / number (0-based)', 'required'],
    ['orientation', 'horizontal | vertical', 'horizontal'],
    ['compactBelow', 'sm | md | lg | false', 'sm (horizontal), false (vertical)'],
    ['formatCounter', '(step, total) => string', '"Step 2 of 5"'],
  ],
  dialog: [
    ['DialogContent: showCloseButton', 'boolean', 'true'],
    ['mobile', 'center | sheet; sheet docks to the bottom below 640px', 'center'],
  ],
  sheet: [
    ['SheetContent: side', 'top | right | bottom | left', 'right'],
    ['handle', 'boolean; grab bar', 'true for bottom'],
    ['showCloseButton', 'boolean', 'true'],
  ],
  'checkbox-card': [
    ['CheckboxCard: title / description', 'ReactNode / ReactNode', 'required / —'],
    ['checked / onCheckedChange / disabled', 'Radix Checkbox props', '—'],
    ['cardClassName / className', 'classes for the card / the checkbox', '—'],
    ['CheckboxCardGroup: label / description', 'ReactNode (legend) / ReactNode', 'required / —'],
  ],
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
    ['attachmentCount', 'number; above 0 allows an empty message', '0'],
    ['canSubmit', 'boolean; gate sending without disabling typing', 'true'],
    ['onAttach', '(files: File[]) => void; adds paperclip, drop and paste', '—'],
    [
      'accept / multiple',
      'string / boolean; filters picked, dropped and pasted files',
      'all / true',
    ],
  ],
  'chat-history': [
    ['items', 'ChatHistoryItem[] { id, title, updatedAt, pinned?, preview? }', 'required'],
    ['activeId / onSelect', 'string / (id) => void', 'required'],
    ['onNewChat', '() => void; shows New chat', '—'],
    ['onRename / onDelete / onPinChange', 'row menu actions', '—'],
    ['query / onQueryChange', 'controlled search', 'uncontrolled'],
    ['loading / error / onRetry / empty', 'list states', '—'],
    ['renderItems', '(items, renderItem) => ReactNode; virtualisation hook', 'renders all'],
  ],
  'chat-layout': [
    ['sidebar / details', 'ReactNode columns', '—'],
    ['title / actions', 'ReactNode in the header', '—'],
    ['sidebarOpen / onSidebarOpenChange', 'controlled sidebar', 'uncontrolled, open'],
    ['allowFullscreen / onFullscreenChange', 'boolean / (fullscreen) => void', 'true'],
    ['sidebarSize', "number (px) | '24%'", "'24%'"],
  ],
  'audio-player': [
    ['src', 'string', 'required'],
    ['peaks', 'number[] 0–1; see computePeaks', 'progress bar'],
    ['title', 'string; names the controls', 'Audio'],
    ['duration', 'number (s) before metadata loads', '—'],
    ['transcript / downloadName', 'ReactNode / string', '—'],
    ['variant', "'default' | 'compact' (VoiceMessage)", 'default'],
  ],
  'voice-recorder': [
    ['onRecorded', '({ blob, mimeType, durationMs }) => void', 'required'],
    ['onCancel / onStateChange', '() => void / (state) => void', '—'],
    ['maxDurationMs', 'number', '300000'],
    ['mimeType', 'preferred container if supported', 'browser default'],
  ],
  'message-actions': [
    ['copyText', 'string; shows Copy', '—'],
    ['onRegenerate / onEdit', '() => void', '—'],
    ['feedback / onFeedback', "'up' | 'down' | null / (value) => void", '—'],
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
          if (active)
            setSource(
              '/*\n' +
                ownLicense +
                '\nAdapted portions: shadcn/ui\n' +
                upstreamLicense +
                '\n*/\n' +
                text,
            );
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
      <ApiReference name={name} />
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
