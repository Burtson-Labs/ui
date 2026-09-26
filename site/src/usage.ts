/**
 * Per-component guidance for the docs: when to reach for it, when not to,
 * and what it does for keyboard and screen-reader users. Kept short; the
 * prop tables and source are on the same page.
 */
export interface Usage {
  /** Situations this component is for. */
  use: string[];
  /** Situations it is the wrong tool for, and what to use instead. */
  avoid: string[];
  /** Keyboard, screen-reader and touch behaviour worth knowing. */
  a11y: string[];
}

export const usage: Record<string, Usage> = {
  accordion: {
    use: [
      'A list of headings where one section at a time matters: FAQs, settings groups, a long form split into parts.',
    ],
    avoid: [
      'Content people need to compare side by side; show it all. Navigation between pages: use Tabs or links.',
    ],
    a11y: [
      'Each trigger is a button in a heading; Up, Down, Home and End move between them, Enter or Space toggles. The panel is hidden from screen readers while closed.',
    ],
  },
  alert: {
    use: [
      'A status message that belongs to the page or section: a failed sync, a plan limit, a maintenance notice.',
    ],
    avoid: [
      'A response to something the person just did: use a Toast. A decision they have to make: use an Alert Dialog.',
    ],
    a11y: [
      'Rendered with role="alert", so screen readers announce it when it appears. Keep it to a title and one or two sentences; put the action in a Button after the description.',
    ],
  },
  'alert-dialog': {
    use: ['A yes-or-no question before something consequential: delete, revoke, send to everyone.'],
    avoid: [
      'Any dialog with a form or more than two actions: use Dialog. A notice that needs no answer: use Alert or Toast.',
    ],
    a11y: [
      'Focus starts on Cancel and stays inside; Escape cancels; clicking outside does nothing. Say the consequence in the confirming button ("Delete 3 keys"), not "OK".',
    ],
  },
  'app-shell': {
    use: [
      'The frame of an app: a sticky header, an optional sidebar and the main area. Your router and state go inside.',
    ],
    avoid: [
      'A marketing page or the docs site, which want their own layout. For the full Burtson app frame with navigation, auth and a command menu, use @burtson-labs/app-shell.',
    ],
    a11y: [
      'Renders landmarks (header, aside, main) so screen readers can jump between them. Give the sidebar an aria-label when there is more than one aside.',
    ],
  },
  attachment: {
    use: [
      'Files on their way into a message: the tray under a Composer, or a list of uploads with progress.',
    ],
    avoid: [
      'Files that are already part of a sent message: use MessageAttachments. A file picker: that is the Composer’s paperclip or your own input.',
    ],
    a11y: [
      'State changes are announced politely with the file name. Remove and Retry are named buttons ("Remove brief.pdf"). Failures say why in words the person can act on.',
    ],
  },
  'audio-player': {
    use: ['A voice note or recording inside a chat, with a waveform, speed and a transcript.'],
    avoid: ['Music or long-form audio with chapters; use a full player. Video.'],
    a11y: [
      'The waveform is a slider: arrow keys move 5 seconds, Home and End jump, Space plays and pauses; its value is read as "0:10 of 1:00". Offer a transcript for every voice note.',
    ],
  },
  avatar: {
    use: ['A person or organisation next to their name: a message, a member row, an account menu.'],
    avoid: [
      'Decorative images or product logos; use an img. Status alone; pair it with Status or a Badge.',
    ],
    a11y: [
      'Pass alt to AvatarImage when the name is not next to it; leave it empty when it is, so the name is not read twice. The fallback initials are plain text.',
    ],
  },
  badge: {
    use: ['A short status or count beside a title: Passing, Invited, 3 new. Tags and categories.'],
    avoid: [
      'Something clickable; use a Button (size="xs") or a link. Long text; a Badge does not wrap.',
    ],
    a11y: [
      'Colour is never the only signal: the text says the state. Status text is darkened in light mode so it reads at 4.5:1 on its tint. With asChild it takes on the child’s role.',
    ],
  },
  breadcrumb: {
    use: [
      'Where a page sits in a hierarchy two or more levels deep: Home / Agents / release-captain.',
    ],
    avoid: [
      'A flat app with a sidebar, where it repeats the nav. A single level; use a back link.',
    ],
    a11y: [
      'A nav labelled "Breadcrumb"; the current page carries aria-current="page" and is not a link. Separators are hidden from screen readers.',
    ],
  },
  button: {
    use: [
      'An action: save, send, delete, open. One primary per section; the rest secondary, outline or ghost.',
    ],
    avoid: [
      'Navigation to another page; use a link, or Button asChild around your router’s Link so it looks the same. A choice between options; use Tabs, RadioGroup or Select.',
    ],
    a11y: [
      'Defaults to type="button" so it never submits a form by accident. loading sets aria-busy and blocks activation, including on an asChild link. 44px on touch screens; pointer-coarse:min-h-8 opts a dense one out.',
    ],
  },
  card: {
    use: [
      'A bounded unit of content with its own title: a record, a setting group, a chart. Five variants for hierarchy, three densities.',
    ],
    avoid: [
      'Wrapping every section of a page; use headings and space. Nesting cards inside cards.',
    ],
    a11y: [
      'A Card is a plain div; give it a heading (CardTitle renders a div: wrap or replace it with an h2/h3 as the page demands). Interactive cards still need a real link or button inside.',
    ],
  },
  'chat-history': {
    use: [
      'The list of past conversations in a chat app: grouped by day, pinned first, searchable, with rename and delete.',
    ],
    avoid: [
      'A general list of records; use DataTable or a plain list. Threads inside one conversation.',
    ],
    a11y: [
      'One tab stop per row: Up and Down move, Home and End jump, Enter opens. The row menu is named for its chat ("Actions for Fuel surcharge"). Rename happens in place; Escape keeps the old title.',
    ],
  },
  'chat-layout': {
    use: [
      'The chat app frame: resizable history sidebar, conversation, optional details column and full screen.',
    ],
    avoid: ['A page that merely contains a chat panel; place Conversation and Composer directly.'],
    a11y: [
      'The sidebar is an aside with a label, a sheet on phones that closes when a chat is picked. Escape leaves full screen. Nothing remounts when the layout changes, so focus and drafts stay put.',
    ],
  },
  checkbox: {
    use: ['Independent yes/no choices, alone or several at once: options, filters, "select all".'],
    avoid: [
      'One choice from a set; use RadioGroup. A setting that takes effect immediately; use Switch.',
    ],
    a11y: [
      'Space toggles; the mixed state reads as "mixed". Wrap it in a Label or use CheckboxRow so the text is the target too. A 44px hit area on touch screens without changing the layout.',
    ],
  },
  'checkbox-card': {
    use: ['Choices that need a sentence each: roles, permissions, notification types.'],
    avoid: [
      'Short labels; a plain Checkbox and Label is enough. One choice from a set; use RadioCard.',
    ],
    a11y: [
      'The whole card toggles the checkbox; the title names it and the description describes it. Focus shows once, on the card. CheckboxCardGroup gives the set a legend, and disabling the group disables every card.',
    ],
  },
  collapsible: {
    use: ['One section that expands and collapses: advanced options, a nav group, a long log.'],
    avoid: [
      'Several sections where one at a time should be open; use Accordion. Content that is essential; do not hide it.',
    ],
    a11y: [
      'The trigger reports aria-expanded; the content is removed from the tree while closed. Put a visible label on the trigger that says what opens.',
    ],
  },
  combobox: {
    use: [
      'One value from a long or remote list: a person, a customer, a model. Typing filters; onSearchChange asks a server.',
    ],
    avoid: [
      'A few fixed options; use Select or NativeSelect. Several values; use CheckboxCard or a multi-select of your own.',
    ],
    a11y: [
      'The trigger is a combobox that opens a search dialog with Enter, Space or an arrow key; cmdk manages the list, Escape closes and returns focus. Label it with a Field or aria-label; pass name for FormData.',
    ],
  },
  command: {
    use: [
      'A searchable list of actions or destinations: the ⌘K palette, a "jump to" box, a picker inside a popover.',
    ],
    avoid: [
      'A plain menu of five actions; use DropdownMenu. A form field; use Combobox, which wraps Command in a field.',
    ],
    a11y: [
      'Typing filters; Up and Down move, Enter runs the row. CommandDialog names the dialog and traps focus. Rows are 44px on touch screens; the active row is a fill, never a colour alone.',
    ],
  },
  composer: {
    use: [
      'The message box of a chat: grows with its text, Enter sends, attach by button, drop or paste, Stop while streaming.',
    ],
    avoid: ['A comment field or a form; use Textarea. Editing a sent message; use MessageEditor.'],
    a11y: [
      'Enter sends and Shift+Enter adds a line; IME composition never submits. A failed send keeps the draft and announces the error. The box carries the focus ring, and Send, Stop and the paperclip are 44px on touch screens.',
    ],
  },
  'connection-status': {
    use: [
      'A live connection or sync state the app reports: model provider, gateway, socket, offline queue.',
    ],
    avoid: ['Progress of one task; use Progress or Spinner. Errors from a form; use FieldError.'],
    a11y: [
      'A status region: changes are announced. "Unknown" never reads as connected. Retry appears only when it can help; the banner renders nothing unless there is trouble, so it can stay mounted.',
    ],
  },
  'context-menu': {
    use: [
      'Actions on a thing under the pointer: a file in a tree, a row, a tab. Keep the same names as the menubar and palette.',
    ],
    avoid: [
      'The only way to reach an action; always offer it somewhere visible too. Touch-first screens, where a long press is easy to miss.',
    ],
    a11y: [
      'Opens with the context-menu key or Shift+F10 on the focused target as well as right-click; arrow keys move, Enter runs, Escape closes and returns focus.',
    ],
  },
  conversation: {
    use: [
      'A chat log that follows new messages as they stream, with a jump-to-latest button when the reader has scrolled up.',
    ],
    avoid: [
      'A static list of comments; a plain list scrolls fine. A terminal; the log region is polite, not assertive.',
    ],
    a11y: [
      'A named log region (aria-live="polite") that joins the tab order so keyboard users can scroll it. Jump to latest respects reduced motion. Give it a bounded height.',
    ],
  },
  'copy-button': {
    use: [
      'Copying a value the person will paste elsewhere: a key, an id, a command, a code block.',
    ],
    avoid: [
      'Copying a whole page or a screenshot. As the only way to read the value; keep the text selectable too.',
    ],
    a11y: [
      'Named "Copy …" and renamed "Copied" for a moment; the result is announced politely, and a blocked clipboard raises a toast that says to copy by hand.',
    ],
  },
  'data-table': {
    use: [
      'A list of records with sort, search, selection, paging and row actions, controlled by your app or server.',
    ],
    avoid: ['Static reference data; use Table. A list of cards with images; build it from Card.'],
    a11y: [
      'Rows are one tab stop: arrows move, Enter opens, Space selects. Headers report aria-sort. On phones, columns with a card placement become cards (articles named by their title) with a Sort by menu; a table with no placements stays a table in a named scroll region.',
    ],
  },
  dialog: {
    use: [
      'A focused task in a window: rename, invite, pick options. mobile="sheet" docks it to the bottom edge on phones.',
    ],
    avoid: [
      'A confirmation; use AlertDialog. Content that could be a page; navigate instead. More than one dialog at a time.',
    ],
    a11y: [
      'Always include DialogTitle (and DialogDescription when it helps). Focus is trapped; Escape closes and focus returns to the trigger; long content scrolls inside. The close button is 44px on touch screens.',
    ],
  },
  'dropdown-menu': {
    use: [
      'A short list of actions from a button: row actions, an account menu, view options with checks and radios.',
    ],
    avoid: [
      'Picking a value for a field; use Select. Site navigation; use NavigationMenu. More than about eight rows; use Command.',
    ],
    a11y: [
      'Enter, Space or Down opens; arrows move, typing jumps, Escape closes and returns focus. Rows are 44px on touch screens. Destructive rows are marked by text and colour.',
    ],
  },
  'editor-tabs': {
    use: [
      'Open files above an editor: unsaved markers, close requests, reordering, overflow scrolling.',
    ],
    avoid: ['Ordinary page tabs; use Tabs. A settings page with a few panes.'],
    a11y: [
      'One tab stop: Left and Right move, Enter opens, Delete asks to close, Ctrl+Shift+PageUp/PageDown reorders. Unsaved state is announced with the name. onClose is a request; the app decides.',
    ],
  },
  'empty-state': {
    use: [
      'A list or page with nothing in it yet: say what belongs here and offer the first action.',
    ],
    avoid: [
      'A search with no matches inside a DataTable; pass empty to the table. An error; use Alert with a Retry.',
    ],
    a11y: [
      'The title is an h3; keep the description to a sentence. The action is a real Button or link.',
    ],
  },
  'error-summary': {
    use: [
      'A long form after a failed submit: every error in one list at the top, each a link to its field.',
    ],
    avoid: [
      'A form with one or two fields; the FieldError under the field is enough. Errors before the person has tried to submit.',
    ],
    a11y: [
      'Focus moves to the summary when errors appear, so a screen reader hears the list. Each entry focuses its field and scrolls it into view (smoothly unless motion is reduced).',
    ],
  },
  field: {
    use: [
      'Any form control: the recipe (label, control, help or error, wired for you) or the parts composed by hand. FieldGrid lines fields up; FieldSet groups them under a legend.',
    ],
    avoid: [
      'A checkbox or switch; use CheckboxRow, SwitchRow or a Label around the control. A search box in a toolbar; use SearchInput with an aria-label.',
    ],
    a11y: [
      'The recipe sets id, aria-describedby (error first, then description), aria-invalid and aria-required on the control; group names a set of inputs instead. Explain how to fix an error, and show errors only after the person has interacted.',
    ],
  },
  'form-actions': {
    use: [
      'The buttons at the end of a form: primary last, Cancel or Delete at the start; one shared row on phones, optionally pinned to the bottom.',
    ],
    avoid: ['A dialog; use DialogFooter. A single button in a card; place it in CardFooter.'],
    a11y: [
      'Order in the DOM is the reading order: start actions first, then the rest, primary last. Sticky keeps clear of the home indicator on phones.',
    ],
  },
  'icon-button': {
    use: [
      'An action that only shows an icon: close, copy, more, settings. The label is its accessible name and tooltip.',
    ],
    avoid: ['A primary action; give it words. An icon whose meaning is not obvious; add text.'],
    a11y: [
      'label becomes aria-label and title. Same 44px touch target as Button; use variant="ghost" size="icon-sm" for a quiet one in a row.',
    ],
  },
  input: {
    use: [
      'A single line of text, a number, an email, a search. width sizes the field to its content from 640px; SearchInput adds the magnifier.',
    ],
    avoid: [
      'A number with a unit; use NumberInput. A choice from a list; use Select, NativeSelect or Combobox. Several lines; use Textarea.',
    ],
    a11y: [
      'Use a persistent label (Field or Label); placeholders are examples, not names. 16px text on phones so iOS does not zoom; 44px tall on touch screens. Choose type, inputMode and autoComplete for the data.',
    ],
  },
  kbd: {
    use: ['A keyboard key or shortcut in text or beside a menu row: ⌘K, Ctrl Shift P.'],
    avoid: ['Buttons that press the key; it is not interactive. Code; use a code element.'],
    a11y: [
      'Renders a kbd element, which screen readers announce as keyboard input. Use shortcutLabel() so ⌘ and Ctrl match the platform.',
    ],
  },
  label: {
    use: [
      'A caption for one control, or a caption that wraps a Checkbox, Switch or RadioGroupItem so the text is the target too.',
    ],
    avoid: [
      'A field with help or an error; use Field, which wires the ids. A heading over a group; use FieldSet or CheckboxCardGroup.',
    ],
    a11y: [
      'Pass htmlFor or wrap the control. A Label around a checkbox, switch or radio is 44px tall on touch screens.',
    ],
  },
  markdown: {
    use: ['Model output in a chat: paragraphs, lists, code blocks with copy, links.'],
    avoid: [
      'Documents with tables, images or embedded HTML; use a full renderer. Content you wrote yourself; write JSX.',
    ],
    a11y: [
      'Everything is React elements, never HTML strings; only http(s) and mailto links become links. Code blocks scroll sideways and have a named copy button.',
    ],
  },
  menubar: {
    use: ['An application menu bar: File, Edit, View, with shortcuts shown beside rows.'],
    avoid: ['Web apps with a few actions; use DropdownMenu. Site navigation; use NavigationMenu.'],
    a11y: [
      'Left and Right move between menus, Down opens one, and an open menu follows the pointer. Handle the shortcuts in your command layer; the menu only shows them.',
    ],
  },
  message: {
    use: [
      'One turn in a conversation: user on the right, assistant full width with an avatar, system notes centred.',
    ],
    avoid: ['Comments in a thread with replies; build a list. Notifications; use Toast.'],
    a11y: [
      'Name and time are plain text before the body. Actions show on hover and focus, and always on touch screens.',
    ],
  },
  'message-actions': {
    use: [
      'Copy, regenerate, edit, thumbs up and down under a message; edit-and-resend in place; files shown inside a message.',
    ],
    avoid: ['Actions that change the conversation (delete, branch); put those in a menu.'],
    a11y: [
      'A toolbar named "Message actions" of icon buttons with names. Feedback is controlled; the chosen thumb reports aria-pressed. The editor sends on Enter (never mid-IME) and cancels on Escape.',
    ],
  },
  'mobile-nav': {
    use: [
      'Three to five top-level destinations on a phone: a bottom tab bar with labels and badges.',
    ],
    avoid: [
      'Desktop layouts; use a sidebar. More than five destinations; put the rest behind a More item or in settings.',
    ],
    a11y: [
      'A nav with the current destination marked aria-current="page"; badges read as ", 3 new". Targets are at least 44px and the bar keeps clear of the home indicator.',
    ],
  },
  'native-select': {
    use: [
      'A short list of fixed options in a form, especially on phones, where the platform picker is faster than a popover. Anywhere a portal is unwelcome.',
    ],
    avoid: [
      'Options with descriptions, icons or search; use Select or Combobox. More than about twenty options; use Combobox.',
    ],
    a11y: [
      'The browser’s own select: full keyboard and screen-reader support for free. Label it with a Field or Label; use aria-invalid for errors.',
    ],
  },
  'navigation-menu': {
    use: [
      'Site navigation with dropdown panels: a products menu, docs sections, with links laid out in a panel.',
    ],
    avoid: ['An app sidebar or tab bar. Actions; use DropdownMenu.'],
    a11y: [
      'Triggers open on hover and on Enter or Space; arrows move between them; Escape closes. Links in the panel are real links, so middle-click and the address bar work.',
    ],
  },
  'number-input': {
    use: [
      'A number with its unit inside the field: $ before, gal, min or % after. Right-aligned figures line up in a column.',
    ],
    avoid: [
      'Plain integers with no unit; a plain Input with inputMode="numeric" is enough. A range; use Slider.',
    ],
    a11y: [
      'The numeric keyboard on phones (decimal allows a point). The box carries the border, focus ring and invalid state; the unit is hidden from screen readers, so say it in the label ("Rate per mile").',
    ],
  },
  'onboarding-checklist': {
    use: ['A short list of first tasks with progress, ticked off by real app events.'],
    avoid: ['A to-do list the person edits; that is a form. Marketing tours; use Tour.'],
    a11y: [
      'A section named by its title with a labelled progress bar; each item announces done or not done. Dismiss is a named button; persist the dismissal yourself.',
    ],
  },
  'page-header': {
    use: ['The top of a page: eyebrow, title, description and the page’s actions.'],
    avoid: ['Section headings inside a page; use an h2. A dialog title; use DialogHeader.'],
    a11y: [
      'The title is an h1: one per page. Actions wrap under the title when they do not fit beside it and share the row on phones.',
    ],
  },
  pagination: {
    use: [
      'Page controls under a list or table: summary, pages, and a rows-per-page menu. usePagination does the arithmetic.',
    ],
    avoid: [
      'Infinite feeds; load more instead. Fewer rows than the smallest page size; hide the controls (hasPages).',
    ],
    a11y: [
      'A nav named "Pagination" of real buttons; the current page carries aria-current and is announced when it changes. Below 640px it is "Page 2 of 13" between two 44px buttons.',
    ],
  },
  popover: {
    use: ['Rich content beside a trigger: a small form, a colour picker, a source preview.'],
    avoid: [
      'A label on hover; use Tooltip. A list of actions; use DropdownMenu. A task that needs focus; use Dialog.',
    ],
    a11y: [
      'Focus moves into the popover and returns on close; Escape and clicking outside close it. Give the content a heading or aria-label.',
    ],
  },
  progress: {
    use: ['How far along a task is, or that one is running (indeterminate).'],
    avoid: ['A step count; use Steps. A spinner inside a button; use loading.'],
    a11y: [
      'Give it aria-label or aria-labelledby; the bar has no name of its own. value and max share units; leaving value out means indeterminate.',
    ],
  },
  'radio-group': {
    use: [
      'One choice from two to five options, all visible at once: dots for short labels, RadioCard for options that need a sentence.',
    ],
    avoid: [
      'More than about five options; use Select or NativeSelect. Independent choices; use Checkbox.',
    ],
    a11y: [
      'Arrow keys move the choice, Tab leaves the group. Wrap items in a Label or use RadioCard so the text is the target. Name the group with aria-label or a Field with group.',
    ],
  },
  reasoning: {
    use: [
      'A model’s thinking, collapsed to "Thought for 3s", and the typing indicator while a reply is on its way.',
    ],
    avoid: ['Tool calls; use ToolCall. Long documents; the panel is for a few lines.'],
    a11y: [
      'The trigger reports expanded state; the indicator is a status named "Assistant is typing" and stays still under reduced motion.',
    ],
  },
  resizable: {
    use: [
      'Panels split by draggable handles: explorer, editor and terminal; a chat with a details column.',
    ],
    avoid: ['Layouts that never need resizing; use a grid. Phones; stack instead.'],
    a11y: [
      'Each handle is a separator with a name; arrow keys move it, Home and End jump, Enter collapses a collapsible panel. The pointer is captured while dragging.',
    ],
  },
  'scroll-area': {
    use: ['A scroll container with a slim, themed scrollbar: a sidebar, a long list in a panel.'],
    avoid: [
      'The page itself; let the browser scroll. Tables; use Table, which names its scroll region.',
    ],
    a11y: [
      'The viewport joins the tab order so keyboard users can scroll it, and draws its focus outline inside the box.',
    ],
  },
  'secret-input': {
    use: ['Keys, tokens and passwords: masked, monospace, with a show/hide toggle.'],
    avoid: ['Values the person needs to read back often; show them with a CopyButton instead.'],
    a11y: [
      'The toggle is named "Show …" or "Hide …" from revealLabel and reports aria-pressed. Autocomplete is off. Disabled fields hide the toggle.',
    ],
  },
  select: {
    use: [
      'One choice from a list of a few to a few dozen fixed options, with groups and labels, in a popover that matches the kit.',
    ],
    avoid: [
      'Long or remote lists; use Combobox. Phone-first forms with plain options; NativeSelect uses the platform picker.',
    ],
    a11y: [
      'Enter, Space or an arrow opens; typing jumps; Escape closes and returns focus. Rows are 44px on touch screens and the chosen one has a check as well as weight. Label the trigger with a Field or aria-label.',
    ],
  },
  separator: {
    use: ['A rule between groups: sections of a menu, items in a toolbar, blocks of a page.'],
    avoid: [
      'Between every row of a list; use spacing or a divided list. As a visual only when the groups are semantically separate; use a heading.',
    ],
    a11y: [
      'Decorative by default (hidden from screen readers). Pass decorative={false} when it separates content that assistive technology should treat as sections.',
    ],
  },
  sheet: {
    use: [
      'A panel from an edge: settings from the right, navigation from the left on phones, a drawer from the bottom.',
    ],
    avoid: ['A small task; use Dialog (mobile="sheet" on phones). Content that could be a page.'],
    a11y: [
      'Always include SheetTitle. Focus is trapped; Escape closes. Bottom sheets show a grab bar and keep clear of the home indicator; the close button is 44px on touch screens.',
    ],
  },
  skeleton: {
    use: [
      'A placeholder the shape of the content while it loads: a line of text, an avatar, a card.',
    ],
    avoid: [
      'Waits under a second; nothing is better. Actions; disable the control or use loading.',
    ],
    a11y: [
      'Hidden from screen readers. Announce loading elsewhere: aria-busy on the region, or a status message.',
    ],
  },
  slider: {
    use: [
      'One number in a range where the position matters more than the exact value: volume, a confidence threshold.',
    ],
    avoid: ['Exact values; use NumberInput. Two ends of a range; build your own from two sliders.'],
    a11y: [
      'The native range input: arrows step, Home and End jump, Page keys move by more. Pass aria-valuetext when the number alone means little ("45%"). 44px tall to a touch.',
    ],
  },
  source: {
    use: [
      'Citations in an answer ([1], [2]) that open the source, and the numbered list under it.',
    ],
    avoid: [
      'Footnotes in prose; use a list. Links the person should follow inline; use a plain link.',
    ],
    a11y: [
      'Each marker is a button named "Source 1: …" that opens a popover. Only http(s) URLs become links, marked "(opens in a new tab)".',
    ],
  },
  spinner: {
    use: ['Something short is happening and there is no progress to show: a fetch, a check.'],
    avoid: ['Long waits; show Progress or a Skeleton. Inside a Button; use its loading prop.'],
    a11y: ['A status named by label ("Pulling model"). Keep one per region.'],
  },
  'stat-card': {
    use: [
      'One headline figure with context; a StatStrip puts two to four side by side in one card on phones.',
    ],
    avoid: ['Charts; use a chart. Tables of numbers; use Table.'],
    a11y: [
      'The label comes before the value in the DOM. A figure with href or onSelect is a link or button with the shared focus ring.',
    ],
  },
  status: {
    use: [
      'A live state in a word: running, healthy, degraded, down, with a dot and optional pulse.',
    ],
    avoid: ['Counts or tags; use Badge. States the app has not checked; say unknown.'],
    a11y: [
      'The dot is decorative; the text carries the meaning. pulse stays still under reduced motion.',
    ],
  },
  steps: {
    use: ['Progress through a short flow: a wizard, onboarding, a checkout.'],
    avoid: ['A to-do list; use OnboardingChecklist. More than about six steps; group them.'],
    a11y: [
      'The current step carries aria-current="step" and each step says done or current. On phones it collapses to "Step 2 of 5" with a bar; screen readers still get the position.',
    ],
  },
  switch: {
    use: [
      'A setting that takes effect immediately: SwitchRow for a settings list, InlineSwitch for a row of filters.',
    ],
    avoid: ['A choice that needs Save; use Checkbox. Anything with more than two states.'],
    a11y: [
      'A switch role with aria-checked; Space toggles. The off track reads at 3:1; a 44px hit area on touch screens. SwitchRow links the description with aria-describedby.',
    ],
  },
  table: {
    use: [
      'Static or lightly interactive tabular data: a comparison, a report, a small list. pinFirstColumn keeps names in view while numbers scroll.',
    ],
    avoid: ['Records with sort, search and paging; use DataTable. Layout.'],
    a11y: [
      'Give the table a caption or aria-label and scope="col" headers. With scrollLabel the scroll container is a named region that joins the tab order while it overflows, with its focus outline inside the box; touch screens get a "Swipe for more" line.',
    ],
  },
  tabs: {
    use: ['Peer views of one thing, one visible at a time: Changes, History, Branches.'],
    avoid: [
      'Steps in a sequence; use Steps. Navigation between pages; use links. Open files; use EditorTabs.',
    ],
    a11y: [
      'Left and Right move between tabs (activation follows focus); Tab moves into the panel. A strip wider than its box scrolls. Tabs are 44px tall to a touch.',
    ],
  },
  textarea: {
    use: ['Several lines of text: instructions, a description, a note.'],
    avoid: ['Chat input; use Composer. One line; use Input.'],
    a11y: [
      'Use a visible label and aria-describedby for help or limits; Field does both. Resizes vertically; avoid a small fixed height for long instructions.',
    ],
  },
  toast: {
    use: [
      'A brief notice about something that just happened: sent, saved, update available. Toaster raises them from anywhere with toast().',
    ],
    avoid: [
      'Errors the person must act on; use Alert or a dialog. Anything with more than one action.',
    ],
    a11y: [
      'A polite live region; Radix pauses the timer on hover and focus, and swipe dismisses on touch. Give ToastAction an altText that says how to do it without the toast. Toasts sit above dialogs (z 100).',
    ],
  },
  toaster: {
    use: [
      'Mount once near the root, then call toast({ title, description, variant }) from event handlers and data hooks.',
    ],
    avoid: [
      'Several Toasters; one is enough. Toasts for every state change; keep them for things the person asked for.',
    ],
    a11y: [
      'Destructive toasts stay 8 seconds, the rest 4. The stack holds four; the oldest go first. The viewport keeps clear of the home indicator and is full width on phones.',
    ],
  },
  'tool-call': {
    use: [
      'An agent’s tool call with live status, arguments and result, and an approval gate before a tool with side effects runs.',
    ],
    avoid: ['Plain logs; use CodeBlock. Model reasoning; use Reasoning.'],
    a11y: [
      'The header is a button that reports expanded state; status is text as well as a dot. Approval buttons disable while the app records the decision (busy); an error is announced.',
    ],
  },
  toolbar: {
    use: ['A dense strip of search, filters and actions above a list.'],
    avoid: ['A page header; use PageHeader. A single button.'],
    a11y: [
      'A labelled group; Tab moves between its controls like any form (no arrow-key roving, so nothing is advertised that is not there). Pass aria-label to name it.',
    ],
  },
  tooltip: {
    use: ['A short label on hover or focus for an icon button or a truncated value.'],
    avoid: [
      'Essential information; put it on the page. Interactive content; use Popover. Touch-only screens, where there is no hover.',
    ],
    a11y: [
      'Shows on focus as well as hover, with a 200ms delay shared by one TooltipProvider. The trigger still needs its own accessible name; the tooltip is a description, not a label.',
    ],
  },
  tour: {
    use: ['An opt-in guided tour of anchored steps, and a single Spotlight hint on one target.'],
    avoid: [
      'Starting on first load, during typing, a running task or a permission prompt. More than five or six steps.',
    ],
    a11y: [
      'Each step is a dialog with a title, "1 of 3" and Next, Back and Skip; Escape ends the tour unless the person is typing, and focus returns to what started it. Spotlight never takes focus.',
    ],
  },
  'tree-view': {
    use: ['A file explorer or any nested list with expand, select and lazy children.'],
    avoid: ['A flat list; use a list. Site navigation; use links.'],
    a11y: [
      'One tab stop: Up and Down move, Right expands or enters, Left collapses or goes to the parent, Home and End, typing jumps by label, Enter runs onAction. Rows are 44px tall to a touch.',
    ],
  },
  'voice-recorder': {
    use: ['Recording a voice message in a chat, with a live level meter, pause, stop and discard.'],
    avoid: [
      'Recording without a clear press; nothing starts until the person asks. Long dictation; use the platform’s.',
    ],
    a11y: [
      'Blocked and unsupported microphones get a sentence that says how to fix it. Buttons are named and 44px on touch screens; the timer is text. Recording uses the recording token, not the error colour.',
    ],
  },
};
