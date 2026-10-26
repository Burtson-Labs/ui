export interface ComponentDoc {
  name: string;
  title: string;
  description: string;
}

const all: ComponentDoc[] = [
  {
    name: 'ask-user',
    title: 'Ask User',
    description:
      'Questions for an agent: choices, multiple selections, free text and reliable submission.',
  },
  {
    name: 'agent-plan',
    title: 'Agent Plan',
    description: 'Review and approve a proposed plan before an agent starts work.',
  },
  {
    name: 'context-usage',
    title: 'Context Usage',
    description: 'Actual token capacity, warnings and a runtime-owned compaction action.',
  },
  {
    name: 'model-picker',
    title: 'Model Picker',
    description:
      'Search and pick a model, grouped by provider, with context size, capabilities and unavailable reasons.',
  },
  {
    name: 'response-versions',
    title: 'Response Versions',
    description: 'A "2 / 3" switcher between regenerated responses, announced to screen readers.',
  },
  {
    name: 'message-usage',
    title: 'Message Usage',
    description: 'Measured input and output tokens, cost and time for one response.',
  },
  {
    name: 'image-lightbox',
    title: 'Image Lightbox',
    description: 'Image thumbnails that open a focus-trapped viewer with previous and next.',
  },
  {
    name: 'artifact-panel',
    title: 'Artifact Panel',
    description:
      'A generated artifact in a resizable panel beside the conversation; a sheet on smaller screens.',
  },
  {
    name: 'circular-progress',
    title: 'Circular Progress',
    description: 'Determinate and indeterminate progress rings in any size.',
  },
  {
    name: 'loading-dots',
    title: 'Loading Dots',
    description: 'A quiet thinking, typing or waiting indicator with a readable status.',
  },
  {
    name: 'theme-provider',
    title: 'Theme Provider',
    description: 'System, light and dark themes with persistence, tab sync and a compact toggle.',
  },

  {
    name: 'avatar-upload',
    title: 'Avatar Upload',
    description: 'Choose, crop, zoom and save a profile photo, with touch and keyboard controls.',
  },
  {
    name: 'agent-run',
    title: 'Agent Run',
    description: 'A run timeline with progress, approvals, pause, resume, cancellation and retry.',
  },
  {
    name: 'accordion',
    title: 'Accordion',
    description: 'Stacked headings that each reveal a section.',
  },
  {
    name: 'alert',
    title: 'Alert',
    description: 'A callout for status, success, warnings and errors.',
  },
  {
    name: 'avatar',
    title: 'Avatar',
    description: 'A user or org image with an initials fallback.',
  },
  { name: 'badge', title: 'Badge', description: 'A small label for status, counts and tags.' },
  {
    name: 'button',
    title: 'Button',
    description: 'The action primitive: eight variants, seven sizes and a loading state.',
  },
  {
    name: 'card',
    title: 'Card',
    description: 'Default, raised, subtle, interactive and terminal surfaces, in three densities.',
  },
  {
    name: 'checkbox',
    title: 'Checkbox',
    description: 'A two-state (or indeterminate) toggle for forms, alone or as a labelled row.',
  },
  {
    name: 'checkbox-card',
    title: 'Checkbox Card',
    description: 'A checkbox with a title and a sentence; the whole card is the target.',
  },
  {
    name: 'dialog',
    title: 'Dialog',
    description: 'A modal window that traps focus until dismissed; a bottom sheet on phones.',
  },
  {
    name: 'dropdown-menu',
    title: 'Dropdown Menu',
    description: 'A menu of actions opened from a trigger, with keyboard navigation.',
  },
  {
    name: 'input',
    title: 'Input',
    description: 'A single-line text field, with widths by content and a search variant.',
  },
  { name: 'kbd', title: 'Kbd', description: 'A keyboard key or shortcut.' },
  {
    name: 'label',
    title: 'Label',
    description: 'An accessible caption for a form control.',
  },
  {
    name: 'popover',
    title: 'Popover',
    description: 'Rich content floating beside a trigger.',
  },
  {
    name: 'progress',
    title: 'Progress',
    description: 'How far along a task is.',
  },
  {
    name: 'radio-group',
    title: 'Radio Group',
    description: 'One choice from a small set, as dots or as cards.',
  },
  {
    name: 'scroll-area',
    title: 'Scroll Area',
    description: 'A scroll container with a slim, themed scrollbar.',
  },
  {
    name: 'select',
    title: 'Select',
    description: 'One choice from a list, in a popover.',
  },
  {
    name: 'separator',
    title: 'Separator',
    description: 'A horizontal or vertical divider.',
  },
  {
    name: 'sheet',
    title: 'Sheet',
    description: 'A dialog that slides in from the side.',
  },
  { name: 'skeleton', title: 'Skeleton', description: 'A placeholder while content loads.' },
  {
    name: 'spinner',
    title: 'Spinner',
    description: 'A compact spinning indicator for work of unknown duration.',
  },
  {
    name: 'switch',
    title: 'Switch',
    description: 'An on/off toggle for settings, alone or as a labelled row in a list.',
  },
  {
    name: 'table',
    title: 'Table',
    description:
      'Semantic table markup with Burtson styling; scrolls sideways with a pinned first column.',
  },
  {
    name: 'tabs',
    title: 'Tabs',
    description: 'Layered panels, one visible at a time.',
  },
  {
    name: 'textarea',
    title: 'Textarea',
    description: 'A multi-line text field that grows with its content.',
  },
  {
    name: 'tooltip',
    title: 'Tooltip',
    description: 'A short label shown on hover or focus.',
  },
  {
    name: 'app-shell',
    title: 'App Shell',
    description: 'Structural app chrome: header, sidebar, main. No routing or state.',
  },
  {
    name: 'empty-state',
    title: 'Empty State',
    description: 'An icon-led placeholder that says what belongs here and how to add it.',
  },
  {
    name: 'field',
    title: 'Field',
    description:
      'Label, hint, description and error around any control, wired for you; grids and sets.',
  },
  {
    name: 'icon-button',
    title: 'Icon Button',
    description: 'An icon-only action with the accessible name built in.',
  },
  {
    name: 'page-header',
    title: 'Page Header',
    description: 'Eyebrow, title, description and actions for the top of a page.',
  },
  {
    name: 'stat-card',
    title: 'Stat Card',
    description: 'One metric with context, or several side by side in a strip.',
  },
  {
    name: 'status',
    title: 'Status',
    description: 'A live-state dot and label: running, healthy, degraded, down.',
  },
  {
    name: 'toolbar',
    title: 'Toolbar',
    description: 'A dense strip of search, filters and actions above a list.',
  },
  {
    name: 'breadcrumb',
    title: 'Breadcrumb',
    description: 'Where the current page sits in the hierarchy.',
  },
  {
    name: 'collapsible',
    title: 'Collapsible',
    description: 'A section that expands and collapses, such as a nav group.',
  },
  {
    name: 'command',
    title: 'Command',
    description: 'A searchable command palette, inline or as a ⌘K dialog.',
  },
  {
    name: 'navigation-menu',
    title: 'Navigation Menu',
    description: 'Site navigation with dropdown panels, like a products menu.',
  },
  {
    name: 'toast',
    title: 'Toast',
    description: 'A brief notice in the corner: sent, saved, update available.',
  },
  {
    name: 'alert-dialog',
    title: 'Alert Dialog',
    description: 'A confirmation for destructive or irreversible actions.',
  },
  {
    name: 'combobox',
    title: 'Combobox',
    description: 'Pick one value from a long or remote list by typing.',
  },
  {
    name: 'pagination',
    title: 'Pagination',
    description:
      'Page controls with a summary and rows per page, "Page 2 of 13" on phones, and a paging hook.',
  },
  {
    name: 'steps',
    title: 'Steps',
    description: 'Progress through a short multi-step flow; "Step 2 of 5" on phones.',
  },
  {
    name: 'composer',
    title: 'Composer',
    description:
      'The message box: grows with its text, Enter sends, attach by button, drop or paste, Stop while streaming.',
  },
  {
    name: 'conversation',
    title: 'Conversation',
    description:
      'A chat log that follows new messages as they stream, with a jump-to-latest button.',
  },
  {
    name: 'markdown',
    title: 'Markdown',
    description:
      'Safe Markdown for model output: lists, highlighted code blocks with copy, links. No HTML injection.',
  },
  {
    name: 'message',
    title: 'Message',
    description: 'A user, assistant or system turn with avatar, name, time and actions.',
  },
  {
    name: 'reasoning',
    title: 'Reasoning',
    description: 'Collapsible model reasoning ("Thought for 3s") and a typing indicator.',
  },
  {
    name: 'tool-call',
    title: 'Tool Call',
    description: 'An agent tool call with live status, arguments and result, and an approval gate.',
  },
  {
    name: 'toaster',
    title: 'Toaster',
    description: 'Raise toasts from anywhere with toast(); one Toaster renders them.',
  },
  { name: 'slider', title: 'Slider', description: 'Pick one number in a range.' },
  {
    name: 'copy-button',
    title: 'Copy Button',
    description: 'Copy a value to the clipboard, with a confirmed state.',
  },
  {
    name: 'secret-input',
    title: 'Secret Input',
    description: 'A masked field for keys and tokens, with show and hide.',
  },
  {
    name: 'resizable',
    title: 'Resizable',
    description:
      'Panels split by draggable, keyboard-operable handles, with min, max and collapse.',
  },
  {
    name: 'tree-view',
    title: 'Tree View',
    description: 'A controlled file-explorer tree: arrows, typeahead, multi-select, lazy children.',
  },
  {
    name: 'editor-tabs',
    title: 'Editor Tabs',
    description: 'Open files above an editor: unsaved markers, close requests, reorder, overflow.',
  },
  {
    name: 'context-menu',
    title: 'Context Menu',
    description: 'A right-click menu with the same rows as Dropdown Menu.',
  },
  {
    name: 'menubar',
    title: 'Menubar',
    description: 'An application menu bar: File, Edit, View.',
  },
  {
    name: 'tour',
    title: 'Tour',
    description: 'An opt-in guided tour of anchored steps, and a single Spotlight hint.',
  },
  {
    name: 'onboarding-checklist',
    title: 'Onboarding Checklist',
    description: 'First tasks with progress, completed by real app events.',
  },
  {
    name: 'attachment',
    title: 'Attachment',
    description: 'Files on their way into a message: upload and read progress, failure, retry.',
  },
  {
    name: 'source',
    title: 'Source',
    description: 'Numbered citations in an answer and the list of sources behind them.',
  },
  {
    name: 'connection-status',
    title: 'Connection Status',
    description: 'Connection and sync state reported by the app, with a banner for outages.',
  },
  {
    name: 'mobile-nav',
    title: 'Mobile Nav',
    description: 'A bottom tab bar for phones, with labels, badges and safe-area insets.',
  },
  {
    name: 'chat-history',
    title: 'Chat History',
    description: 'The conversation list: grouped by day, pinned, searchable, rename and delete.',
  },
  {
    name: 'chat-layout',
    title: 'Chat Layout',
    description: 'The chat app frame: resizable history sidebar, details column, full screen.',
  },
  {
    name: 'audio-player',
    title: 'Audio Player',
    description: 'Plays a recording with a seekable waveform, speed, download and transcript.',
  },
  {
    name: 'voice-recorder',
    title: 'Voice Recorder',
    description: 'Record a voice message with a live level meter, pause, stop and discard.',
  },
  {
    name: 'message-actions',
    title: 'Message Actions',
    description: 'Copy, regenerate, edit-and-resend, feedback, and files attached to a message.',
  },
  {
    name: 'data-table',
    title: 'Data Table',
    description:
      'A controlled table for records: sort, search, select, page and row actions; cards on phones when columns ask for them.',
  },
  {
    name: 'number-input',
    title: 'Number Input',
    description:
      'A number with its unit inside the field, right-aligned, numeric keyboard on phones.',
  },
  {
    name: 'native-select',
    title: 'Native Select',
    description:
      "The browser's own select, drawn like the kit's fields: the phone picker, no portal.",
  },
  {
    name: 'error-summary',
    title: 'Error Summary',
    description: 'The errors of a long form after a failed submit, each a link to its field.',
  },
  {
    name: 'form-actions',
    title: 'Form Actions',
    description:
      "A form's buttons: right-aligned on desktop, one shared row on phones, optionally pinned.",
  },
  {
    name: 'toggle',
    title: 'Toggle',
    description: 'A button that stays on or off: bold, mute, pinned. Announced as pressed.',
  },
  {
    name: 'toggle-group',
    title: 'Toggle Group',
    description:
      'A row of toggles with one Tab stop: one choice as a radio group, or several pressed buttons.',
  },
  {
    name: 'hover-card',
    title: 'Hover Card',
    description:
      'A preview of what a link points at, on hover or keyboard focus; the link still works alone.',
  },
  {
    name: 'input-otp',
    title: 'Input OTP',
    description:
      'A one-time code in slots: one real input, platform autofill, paste, numeric keyboard.',
  },
  {
    name: 'calendar',
    title: 'Calendar',
    description:
      'A month grid for a day or a range: locale names, min, max and blocked days, full keyboard.',
  },
  {
    name: 'date-picker',
    title: 'Date Picker',
    description:
      'A field-like button that opens a Calendar in a popover, for one date or a range across months.',
  },
  {
    name: 'time-picker',
    title: 'Time Picker',
    description:
      'A time of day typed segment by segment, in the locale clock, with an optional list of slots.',
  },
  {
    name: 'date-time-picker',
    title: 'Date Time Picker',
    description: 'A DatePicker and a TimePicker in one labelled group, reported as one local Date.',
  },
];

export const components = [...all].sort((a, b) => a.title.localeCompare(b.title));
