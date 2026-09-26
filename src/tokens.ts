/**
 * Burtson UI design tokens. This file is the single source for colour, radius,
 * shadow and type: `scripts/theme.mjs` writes src/styles/theme.css from it, and the
 * MUI adapter (`@burtson-labs/ui/mui`) builds its palette from it, so Tailwind
 * apps and MUI apps render the same brand.
 *
 * Burtson's design language: technical, quiet, precise. Purple (`brand`) is a
 * signal colour for selection, focus, primary actions and small accents, not a
 * panel fill. Dark is a first-class palette, not an inversion of light. The
 * base colour names stay registry-compatible, so source copied into an app
 * keeps working.
 */

export type ColorToken =
  | 'background'
  | 'foreground'
  | 'surface'
  | 'surface-raised'
  | 'surface-muted'
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
  | 'info'
  | 'info-foreground'
  | 'recording'
  | 'recording-foreground'
  | 'border'
  | 'border-strong'
  | 'input'
  | 'ring'
  | 'brand'
  | 'brand-hover'
  | 'brand-soft'
  | 'brand-soft-foreground'
  | 'code'
  | 'code-foreground';

export type Palette = Record<ColorToken, string>;

/** Burtson Labs purple. Use as signal, not wallpaper. */
export const brand = '#a60ee5';

export const light: Palette = {
  background: '#fbfafc',
  foreground: '#17131c',
  surface: '#ffffff',
  'surface-raised': '#ffffff',
  'surface-muted': '#f7f4f9',
  card: '#ffffff',
  'card-foreground': '#17131c',
  popover: '#ffffff',
  'popover-foreground': '#17131c',
  primary: '#8f0bc7',
  'primary-foreground': '#ffffff',
  secondary: '#f1edf4',
  'secondary-foreground': '#29212f',
  muted: '#f4f1f6',
  'muted-foreground': '#6c6472',
  accent: '#f3e7fb',
  'accent-foreground': '#561071',
  destructive: '#c92d3f',
  'destructive-foreground': '#ffffff',
  success: '#0e7a56',
  'success-foreground': '#ffffff',
  warning: '#9b5c08',
  'warning-foreground': '#ffffff',
  info: '#2563eb',
  'info-foreground': '#ffffff',
  // Live microphone capture. Red by convention, but its own token: recording
  // is a state, not an error, and apps can retint it without touching errors.
  recording: '#d6293e',
  'recording-foreground': '#ffffff',
  border: '#e5dfe8',
  'border-strong': '#cfc5d5',
  // The field border: 3:1 on every light surface (WCAG 1.4.11), so a field
  // is identifiable by its outline alone. Also the unchecked box, dot and
  // off track of Checkbox, RadioGroup and Switch.
  input: '#908a95',
  ring: '#a60ee5',
  brand: '#a60ee5',
  'brand-hover': '#8f0bc7',
  'brand-soft': '#f5e8fc',
  'brand-soft-foreground': '#5b1476',
  code: '#18141d',
  'code-foreground': '#f5f0f7',
};

export const dark: Palette = {
  background: '#0d0d12',
  foreground: '#f2eef5',
  surface: '#121218',
  'surface-raised': '#18171f',
  'surface-muted': '#17151c',
  card: '#14131a',
  'card-foreground': '#f2eef5',
  popover: '#18171f',
  'popover-foreground': '#f2eef5',
  primary: '#8f0bc7',
  'primary-foreground': '#ffffff',
  secondary: '#211e28',
  'secondary-foreground': '#e7e0eb',
  muted: '#1b1921',
  'muted-foreground': '#a49ca9',
  accent: '#291734',
  'accent-foreground': '#efd7fa',
  destructive: '#ef5b65',
  'destructive-foreground': '#1b090b',
  success: '#36c58d',
  'success-foreground': '#07160f',
  warning: '#f3b24c',
  'warning-foreground': '#201304',
  info: '#6ea8ff',
  'info-foreground': '#071226',
  recording: '#f2616d',
  'recording-foreground': '#1b090b',
  border: '#2a2732',
  'border-strong': '#403a49',
  input: '#68646e',
  ring: '#c65ef1',
  brand: '#c65ef1',
  'brand-hover': '#d384f3',
  'brand-soft': '#291734',
  'brand-soft-foreground': '#efd7fa',
  code: '#09090d',
  'code-foreground': '#f5f0f7',
};

export const radius = {
  xs: '0.375rem',
  sm: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
} as const;

/**
 * Shadows by elevation: xs resting controls, sm cards, md raised cards and
 * tooltips, lg floating surfaces (popovers, menus, toasts), xl modal windows
 * (dialogs, sheets). Borders carry hierarchy; the shadow only says "floating".
 */
export const shadow = {
  xs: '0 1px 2px rgb(10 8 14 / 0.05)',
  sm: '0 1px 3px rgb(10 8 14 / 0.08), 0 1px 2px rgb(10 8 14 / 0.05)',
  md: '0 10px 30px rgb(10 8 14 / 0.10), 0 2px 8px rgb(10 8 14 / 0.06)',
  lg: '0 16px 48px rgb(0 0 0 / 0.18)',
  xl: '0 24px 80px rgb(0 0 0 / 0.28)',
  focus: '0 0 0 3px color-mix(in srgb, var(--ring) 22%, transparent)',
} as const;

export const fontSans =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export const fontMono =
  '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace';

/**
 * Motion timing, for CSS (theme.css exposes them as --duration-* and
 * --ease-*, and every `transition-*` utility uses fast/standard by default)
 * and for code that animates outside CSS (MUI transitions, JS animation).
 * Things leave faster than they arrive; `emphasis` is for surfaces that
 * change the layout (drawers, dialogs, expanding panels).
 */
export const duration = { fast: 120, standard: 180, emphasis: 240, exit: 140 } as const;
export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  /** A drawer's glide: fast start, long settle. */
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
} as const;

/**
 * Motion. Surfaces enter from where they come from: popovers and menus slide a
 * few pixels from their trigger side (--bl-tx/--bl-ty, set per side by the
 * component), dialogs zoom slightly, sheets glide in with the drawer ease, and
 * everything leaves faster than it arrived, all on the duration and easing
 * tokens above. prefers-reduced-motion turns all of it off (theme.css).
 */
export const motion = {
  animations: {
    in: `bl-in ${duration.standard}ms ${easing.emphasized}`,
    out: `bl-out ${duration.exit}ms ${easing.exit} forwards`,
    'fade-in': `bl-fade-in ${duration.standard}ms ${easing.standard}`,
    'fade-out': `bl-fade-out ${duration.exit}ms ${easing.exit} forwards`,
    'sheet-in': `bl-sheet-in ${duration.emphasis}ms ${easing.drawer}`,
    'sheet-out': `bl-sheet-out ${duration.standard}ms ${easing.exit} forwards`,
    'accordion-down': `bl-accordion-down ${duration.standard}ms ${easing.emphasized}`,
    'accordion-up': `bl-accordion-up ${duration.exit}ms ${easing.exit}`,
    'collapsible-down': `bl-collapsible-down ${duration.standard}ms ${easing.emphasized}`,
    'collapsible-up': `bl-collapsible-up ${duration.exit}ms ${easing.exit}`,
  },
  keyframes: {
    'bl-in': {
      from: {
        opacity: '0',
        transform: 'translate3d(var(--bl-tx, 0), var(--bl-ty, 0), 0) scale(var(--bl-scale, 0.96))',
      },
    },
    'bl-out': {
      to: {
        opacity: '0',
        transform: 'translate3d(var(--bl-tx, 0), var(--bl-ty, 0), 0) scale(var(--bl-scale, 0.96))',
      },
    },
    'bl-fade-in': { from: { opacity: '0' } },
    'bl-fade-out': { to: { opacity: '0' } },
    'bl-sheet-in': {
      from: { transform: 'translate3d(var(--bl-sheet-x, 100%), var(--bl-sheet-y, 0), 0)' },
    },
    'bl-sheet-out': {
      to: { transform: 'translate3d(var(--bl-sheet-x, 100%), var(--bl-sheet-y, 0), 0)' },
    },
    'bl-accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    'bl-accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
    'bl-collapsible-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-collapsible-content-height)' },
    },
    'bl-collapsible-up': {
      from: { height: 'var(--radix-collapsible-content-height)' },
      to: { height: '0' },
    },
  },
} as const;

/**
 * Named elevation levels over the shadow scale: 0 flat, 1 resting control,
 * 2 card, 3 raised card or tooltip, 4 floating surface (popover, menu,
 * toast), 5 modal (dialog, sheet).
 */
export const elevation = {
  0: 'none',
  1: shadow.xs,
  2: shadow.sm,
  3: shadow.md,
  4: shadow.lg,
  5: shadow.xl,
} as const;

/**
 * Stacking order, so an app's own layers can slot between the kit's: sticky
 * table headers and lifted controls (10), app chrome such as headers and
 * bottom tab bars (40), floating and modal surfaces (50; nesting order comes
 * from DOM order, a popover inside a dialog is appended later and sits above
 * it), toasts (100), which stay visible over a dialog.
 */
export const layer = { raised: 10, chrome: 40, overlay: 50, toast: 100 } as const;

// ─── Accent ────────────────────────────────────────────────────────────────

export type AccentTokens = Pick<
  Palette,
  | 'primary'
  | 'primary-foreground'
  | 'brand'
  | 'brand-hover'
  | 'brand-soft'
  | 'brand-soft-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'ring'
>;

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  if (!/^[0-9a-f]{6}$/i.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
}

const toHex = (rgb: Rgb) =>
  '#' +
  rgb
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** Mix `a` toward `b` by `t` (0 = a, 1 = b), in sRGB. */
export function mix(a: string, b: string, t: number): string {
  const x = parseHex(a);
  const y = parseHex(b);
  return toHex([0, 1, 2].map((i) => x[i]! + (y[i]! - x[i]!) * t) as Rgb);
}

function luminance(hex: string): number {
  const c = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Step `color` toward `target` until it reaches `ratio` against `against`. */
function ensureContrast(color: string, against: string, ratio: number, target: string): string {
  let c = color;
  for (let i = 0; i < 20 && contrast(c, against) < ratio; i++) c = mix(c, target, 0.1);
  return c;
}

/**
 * Brand tokens for any accent colour, kept legible: the primary fill always
 * carries its foreground at 4.5:1, and the brand colour used for links, focus
 * and selected text reads at 4.5:1 on the page background. Tenants and skins
 * choose an accent; they never choose the contrast.
 */
export function accentTokens(accent: string, mode: 'light' | 'dark'): AccentTokens {
  const p = mode === 'dark' ? dark : light;
  const white = '#ffffff';
  // A dark foreground on light fills (yellow, cyan) instead of forcing white.
  // White text on the fill whenever darkening the accent a little gets there
  // (purples, blues, greens, reds: the usual brand colours, which read as the
  // brand when they carry white). Dark text only for genuinely light accents
  // such as yellow or pale cyan, where white would need the colour ruined.
  const onFill = contrast(accent, white) >= 2.6 ? white : '#111111';
  const primary =
    onFill === white
      ? ensureContrast(accent, white, 4.5, '#000000')
      : ensureContrast(accent, '#111111', 4.5, white);
  const brand =
    mode === 'dark'
      ? ensureContrast(mix(accent, white, 0.12), p.background, 4.5, white)
      : ensureContrast(accent, p.background, 4.5, '#000000');
  const brandHover = mode === 'dark' ? mix(brand, white, 0.18) : mix(brand, '#000000', 0.14);
  const soft = mode === 'dark' ? mix(p.background, accent, 0.16) : mix(white, accent, 0.1);
  const softFg = mode === 'dark' ? mix(accent, white, 0.72) : mix(accent, '#000000', 0.55);
  return {
    primary,
    'primary-foreground': onFill,
    brand,
    'brand-hover': brandHover,
    'brand-soft': soft,
    'brand-soft-foreground': ensureContrast(softFg, soft, 4.5, mode === 'dark' ? white : '#000000'),
    accent: soft,
    'accent-foreground': ensureContrast(softFg, soft, 4.5, mode === 'dark' ? white : '#000000'),
    ring: brand,
  };
}

export const tokens = {
  brand,
  light,
  dark,
  radius,
  shadow,
  elevation,
  layer,
  motion,
  duration,
  easing,
  fontSans,
  fontMono,
} as const;
export default tokens;
