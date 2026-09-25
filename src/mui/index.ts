/**
 * The Burtson palette for MUI apps, so a screen built with MUI and one built
 * with Burtson UI components look like the same product.
 *
 *   import { ThemeProvider } from '@mui/material/styles';
 *   import { createBurtsonTheme } from '@burtson-labs/ui/mui';
 *   <ThemeProvider theme={createBurtsonTheme('dark')}>…</ThemeProvider>
 *   <ThemeProvider theme={createBurtsonTheme({ mode: 'dark', accent: '#2563eb', density: 'compact' })}>
 *
 * MUI is an adapter here: every colour, radius, shadow and timing comes from
 * the Burtson tokens, and the component overrides give MUI controls the same
 * shape and states as the Burtson components (focus ring, radius per role,
 * no uppercase buttons, quiet borders instead of heavy shadows).
 */
import { createTheme, type Shadows, type Theme, type ThemeOptions } from '@mui/material/styles';

import {
  accentTokens,
  dark,
  duration,
  easing,
  fontMono,
  fontSans,
  light,
  type Palette,
  radius,
  shadow,
} from '../tokens';

export type BurtsonMode = 'light' | 'dark';
export type BurtsonDensity = 'comfortable' | 'compact';

export interface BurtsonThemeConfig {
  mode?: BurtsonMode;
  /** Any hex colour; primary, brand, soft and ring tones are derived with contrast kept. */
  accent?: string;
  /** `compact` for admin and data-dense screens: smaller controls, dense lists and tables. */
  density?: BurtsonDensity;
  /** Replace individual palette tokens (a product skin's tinted surfaces). */
  palette?: Partial<Palette>;
}

const px = (rem: string) => Math.round(parseFloat(rem) * 16);

/** The full token palette for a config: base mode, accent-derived brand tones, then explicit overrides. */
export function burtsonPalette(config: BurtsonThemeConfig = {}): Palette {
  const mode = config.mode ?? 'dark';
  const base = mode === 'dark' ? dark : light;
  return {
    ...base,
    ...(config.accent ? accentTokens(config.accent, mode) : {}),
    ...config.palette,
  };
}

function shadows(): Shadows {
  // MUI indexes elevation 0–24; the Burtson scale has three real levels.
  const levels = ['none', shadow.xs, shadow.xs, shadow.sm, shadow.sm, shadow.sm];
  return Array.from({ length: 25 }, (_, i) => levels[i] ?? shadow.md) as Shadows;
}

/** Theme options only, for apps that deep-merge their own overrides first. */
export function burtsonThemeOptions(
  modeOrConfig: BurtsonMode | BurtsonThemeConfig = 'dark',
): ThemeOptions {
  const config = typeof modeOrConfig === 'string' ? { mode: modeOrConfig } : modeOrConfig;
  const mode = config.mode ?? 'dark';
  const compact = config.density === 'compact';
  const p = burtsonPalette(config);
  const focusRing = `0 0 0 3px color-mix(in srgb, ${p.ring} 24%, transparent)`;
  return {
    palette: {
      mode,
      primary: { main: p.primary, contrastText: p['primary-foreground'] },
      secondary: { main: p.brand, contrastText: p['primary-foreground'] },
      info: { main: p.info, contrastText: p['info-foreground'] },
      error: { main: p.destructive, contrastText: p['destructive-foreground'] },
      warning: { main: p.warning, contrastText: p['warning-foreground'] },
      success: { main: p.success, contrastText: p['success-foreground'] },
      background: { default: p.background, paper: p.surface },
      text: { primary: p.foreground, secondary: p['muted-foreground'] },
      divider: p.border,
      action: { hover: p.muted, selected: p['brand-soft'], focus: p['brand-soft'] },
    },
    shape: { borderRadius: px(radius.md) },
    shadows: shadows(),
    typography: {
      fontFamily: fontSans,
      fontSize: compact ? 13 : 14,
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.01em' },
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em' },
      h3: { fontWeight: 650, letterSpacing: '-0.02em' },
      h4: { fontWeight: 650, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      overline: { fontWeight: 600, letterSpacing: '0.08em' },
    },
    transitions: {
      duration: {
        shortest: duration.fast,
        shorter: duration.fast,
        short: duration.standard,
        standard: duration.standard,
        complex: duration.emphasis,
        enteringScreen: duration.emphasis,
        leavingScreen: duration.exit,
      },
      easing: {
        easeInOut: easing.standard,
        easeOut: easing.emphasized,
        easeIn: easing.exit,
        sharp: easing.standard,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'code, kbd, pre, samp': { fontFamily: fontMono },
          '@media (prefers-reduced-motion: reduce)': {
            '*, ::before, ::after': {
              animationDuration: '1ms !important',
              transitionDuration: '1ms !important',
            },
          },
        },
      },
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true, size: compact ? 'small' : 'medium' },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            '&:focus-visible': {
              boxShadow: focusRing,
              outline: `2px solid ${p.ring}`,
              outlineOffset: 2,
            },
          },
          outlined: { borderColor: p['border-strong'] },
        },
      },
      MuiIconButton: {
        defaultProps: { size: compact ? 'small' : 'medium' },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            '&:focus-visible': { outline: `2px solid ${p.ring}`, outlineOffset: 2 },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: p.border },
          rounded: { borderRadius: radius.lg },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: { borderRadius: radius.lg, backgroundColor: p.card, borderColor: p.border },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: radius.xl, border: `1px solid ${p.border}`, boxShadow: shadow.md },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: radius.lg, border: `1px solid ${p.border}`, boxShadow: shadow.md },
        },
      },
      MuiPopover: {
        styleOverrides: { paper: { borderRadius: radius.lg, border: `1px solid ${p.border}` } },
      },
      MuiChip: {
        defaultProps: { size: 'small' },
        styleOverrides: { root: { borderRadius: radius.full, fontWeight: 500 } },
      },
      MuiTabs: {
        styleOverrides: { indicator: { backgroundColor: p.brand, height: 2 } },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: compact ? 36 : 44,
            '&.Mui-selected': { color: p.foreground },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: p.surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: p.input },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: p['border-strong'] },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: p.ring,
              borderWidth: 1,
            },
            '&.Mui-focused': { boxShadow: focusRing },
          },
        },
      },
      MuiTextField: { defaultProps: { size: compact ? 'small' : 'medium' } },
      MuiAlert: { styleOverrides: { root: { borderRadius: radius.md } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: p.code,
            color: p['code-foreground'],
            fontSize: 12,
            borderRadius: radius.sm,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: p.brand, opacity: 1 },
          },
          track: { backgroundColor: p['border-strong'], opacity: 1 },
        },
      },
      MuiList: { defaultProps: { dense: compact } },
      MuiTable: { defaultProps: { size: compact ? 'small' : 'medium' } },
      MuiToolbar: { defaultProps: { variant: compact ? 'dense' : 'regular' } },
      MuiDivider: { styleOverrides: { root: { borderColor: p.border } } },
    },
  };
}

/**
 * `createBurtsonTheme('dark')` or `createBurtsonTheme({ mode, accent, density })`,
 * then any MUI overrides, merged in order.
 */
export function createBurtsonTheme(
  modeOrConfig: BurtsonMode | BurtsonThemeConfig = 'dark',
  ...overrides: ThemeOptions[]
): Theme {
  return createTheme(burtsonThemeOptions(modeOrConfig), ...overrides);
}
