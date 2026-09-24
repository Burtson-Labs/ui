/**
 * The Burtson palette for MUI apps, so a screen built with MUI and one built
 * with Burtson UI components look like the same product.
 *
 *   import { ThemeProvider } from '@mui/material/styles';
 *   import { createBurtsonTheme } from '@burtson-labs/ui/mui';
 *   <ThemeProvider theme={createBurtsonTheme('dark')}>…</ThemeProvider>
 */
import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

import { dark, fontMono, fontSans, light, type Palette, radius } from '../tokens';

export type BurtsonMode = 'light' | 'dark';

const px = (rem: string) => Math.round(parseFloat(rem) * 16);

/** Theme options only, for apps that deep-merge their own overrides first. */
export function burtsonThemeOptions(mode: BurtsonMode = 'dark'): ThemeOptions {
  const p: Palette = mode === 'dark' ? dark : light;
  return {
    palette: {
      mode,
      primary: { main: p.primary, contrastText: p['primary-foreground'] },
      secondary: { main: p.brand, contrastText: p['primary-foreground'] },
      error: { main: p.destructive, contrastText: p['destructive-foreground'] },
      warning: { main: p.warning, contrastText: p['warning-foreground'] },
      success: { main: p.success, contrastText: p['success-foreground'] },
      background: { default: p.background, paper: p.card },
      text: { primary: p.foreground, secondary: p['muted-foreground'] },
      divider: p.border,
      action: { hover: p.accent, selected: p['brand-soft'] },
    },
    shape: { borderRadius: px(radius) },
    typography: {
      fontFamily: fontSans,
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${p.border}` } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: p.foreground, color: p.background, fontSize: 12 },
        },
      },
      MuiCssBaseline: {
        styleOverrides: { 'code, kbd, pre': { fontFamily: fontMono } },
      },
    },
  };
}

export function createBurtsonTheme(
  mode: BurtsonMode = 'dark',
  ...overrides: ThemeOptions[]
): Theme {
  return createTheme(burtsonThemeOptions(mode), ...overrides);
}
