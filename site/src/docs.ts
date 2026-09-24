export interface ComponentDoc {
  name: string;
  title: string;
  description: string;
  /** The Radix primitive underneath, linked from the page. */
  radix?: string;
}

const all: ComponentDoc[] = [
  {
    name: 'accordion',
    title: 'Accordion',
    description: 'Stacked headings that each reveal a section.',
    radix: 'accordion',
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
    radix: 'avatar',
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
    description: 'A two-state (or indeterminate) toggle for forms.',
    radix: 'checkbox',
  },
  {
    name: 'dialog',
    title: 'Dialog',
    description: 'A modal window that traps focus until dismissed.',
    radix: 'dialog',
  },
  {
    name: 'dropdown-menu',
    title: 'Dropdown Menu',
    description: 'A menu of actions opened from a trigger, with keyboard navigation.',
    radix: 'dropdown-menu',
  },
  { name: 'input', title: 'Input', description: 'A single-line text field.' },
  { name: 'kbd', title: 'Kbd', description: 'A keyboard key or shortcut.' },
  {
    name: 'label',
    title: 'Label',
    description: 'An accessible caption for a form control.',
    radix: 'label',
  },
  {
    name: 'popover',
    title: 'Popover',
    description: 'Rich content floating beside a trigger.',
    radix: 'popover',
  },
  {
    name: 'progress',
    title: 'Progress',
    description: 'How far along a task is.',
    radix: 'progress',
  },
  {
    name: 'radio-group',
    title: 'Radio Group',
    description: 'One choice from a small set.',
    radix: 'radio-group',
  },
  {
    name: 'scroll-area',
    title: 'Scroll Area',
    description: 'A scroll container with a slim, themed scrollbar.',
    radix: 'scroll-area',
  },
  {
    name: 'select',
    title: 'Select',
    description: 'One choice from a list, in a popover.',
    radix: 'select',
  },
  {
    name: 'separator',
    title: 'Separator',
    description: 'A horizontal or vertical divider.',
    radix: 'separator',
  },
  {
    name: 'sheet',
    title: 'Sheet',
    description: 'A dialog that slides in from the side.',
    radix: 'dialog',
  },
  { name: 'skeleton', title: 'Skeleton', description: 'A placeholder while content loads.' },
  {
    name: 'spinner',
    title: 'Spinner',
    description: 'An indeterminate loading indicator, from Burtson Icons.',
  },
  {
    name: 'switch',
    title: 'Switch',
    description: 'An on/off toggle for settings.',
    radix: 'switch',
  },
  { name: 'table', title: 'Table', description: 'Semantic table markup with Burtson styling.' },
  {
    name: 'tabs',
    title: 'Tabs',
    description: 'Layered panels, one visible at a time.',
    radix: 'tabs',
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
    radix: 'tooltip',
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
    description: 'Label, hint, description and error around any control.',
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
    description: 'One metric with context, without dashboard chrome.',
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
    radix: 'collapsible',
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
    radix: 'navigation-menu',
  },
  {
    name: 'toast',
    title: 'Toast',
    description: 'A brief notice in the corner: sent, saved, update available.',
    radix: 'toast',
  },
  {
    name: 'alert-dialog',
    title: 'Alert Dialog',
    description: 'A confirmation for destructive or irreversible actions.',
    radix: 'alert-dialog',
  },
  {
    name: 'combobox',
    title: 'Combobox',
    description: 'Pick one value from a long or remote list by typing.',
  },
  {
    name: 'pagination',
    title: 'Pagination',
    description: 'Page controls for tables and lists, with a summary.',
  },
  { name: 'steps', title: 'Steps', description: 'Progress through a short multi-step flow.' },
];

export const components = [...all].sort((a, b) => a.title.localeCompare(b.title));
