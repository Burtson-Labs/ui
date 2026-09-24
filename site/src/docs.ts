export interface ComponentDoc {
  name: string;
  title: string;
  description: string;
  /** The Radix primitive underneath, linked from the page. */
  radix?: string;
}

export const components: ComponentDoc[] = [
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
    description: 'The action primitive, in six variants and six sizes.',
  },
  {
    name: 'card',
    title: 'Card',
    description: 'A bordered surface with header, content and footer slots.',
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
];
