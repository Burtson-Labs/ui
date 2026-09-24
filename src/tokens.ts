/**
 * Burtson UI design tokens. This file is the single source for colour, radius
 * and type: `scripts/theme.mjs` writes src/styles/theme.css from it, and the
 * MUI adapter (`@burtson-labs/ui/mui`) builds its palette from it, so Tailwind
 * apps and MUI apps render the same brand.
 *
 * Colour names follow the shadcn/ui convention (background, primary, muted, …)
 * so components copied from the shadcn ecosystem pick up the Burtson palette.
 */

export type ColorToken =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'success'
  | 'success-foreground'
  | 'warning'
  | 'warning-foreground'
  | 'border'
  | 'input'
  | 'ring'
  | 'brand'
  | 'brand-soft';

export type Palette = Record<ColorToken, string>;

/** Burtson Labs purple, the one colour every surface shares. */
export const brand = '#a60ee5';

export const light: Palette = {
  background: '#ffffff',
  foreground: '#17151c',
  card: '#ffffff',
  'card-foreground': '#17151c',
  popover: '#ffffff',
  'popover-foreground': '#17151c',
  primary: '#a60ee5',
  'primary-foreground': '#ffffff',
  secondary: '#f3f0f7',
  'secondary-foreground': '#221c2b',
  muted: '#f5f3f8',
  'muted-foreground': '#655e70',
  accent: '#f1e7fb',
  'accent-foreground': '#4d0a6b',
  destructive: '#d42a3a',
  'destructive-foreground': '#ffffff',
  success: '#12805c',
  'success-foreground': '#ffffff',
  warning: '#a35c00',
  'warning-foreground': '#ffffff',
  border: '#e4dfeb',
  input: '#d9d2e2',
  ring: '#a60ee5',
  brand: '#a60ee5',
  'brand-soft': '#f4e6fd',
};

export const dark: Palette = {
  background: '#101016',
  foreground: '#f0edf7',
  card: '#16151d',
  'card-foreground': '#f0edf7',
  popover: '#191820',
  'popover-foreground': '#f0edf7',
  primary: '#a60ee5',
  'primary-foreground': '#ffffff',
  secondary: '#221f2b',
  'secondary-foreground': '#e4ddeb',
  muted: '#1d1b25',
  'muted-foreground': '#a39bac',
  accent: '#2b193a',
  'accent-foreground': '#e9cffc',
  destructive: '#e5484d',
  'destructive-foreground': '#ffffff',
  success: '#2fb67f',
  'success-foreground': '#07170f',
  warning: '#f0a53a',
  'warning-foreground': '#1c1204',
  border: '#2e2a3b',
  input: '#3a3548',
  ring: '#c77afa',
  brand: '#c77afa',
  'brand-soft': '#2b193a',
};

/** Base corner radius; sm/md/lg/xl derive from it. */
export const radius = '0.625rem';

export const fontSans =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const fontMono =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const tokens = { brand, light, dark, radius, fontSans, fontMono } as const;
export default tokens;
