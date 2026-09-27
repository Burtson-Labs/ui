import Moon from '@burtson-labs/icons/react/moon';
import Sun from '@burtson-labs/icons/react/sun';
import * as React from 'react';

import { useMediaQuery } from '../lib/media';

import { IconButton, type IconButtonProps } from './icon-button';

export type ThemePreference = 'light' | 'dark' | 'system';
export interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  /** Set null to keep the preference in memory only. */
  storageKey?: string | null;
}
const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const validTheme = (value: unknown): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/** One provider per document. Follows system changes and syncs preferences across tabs. */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'bl-theme',
}: ThemeProviderProps) {
  const [theme, setState] = React.useState<ThemePreference>(defaultTheme);
  const [ready, setReady] = React.useState(false);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  React.useEffect(() => {
    const read = () => {
      let next = defaultTheme;
      try {
        const saved = storageKey ? localStorage.getItem(storageKey) : null;
        if (validTheme(saved)) next = saved;
      } catch {
        /* The theme still works when storage is unavailable. */
      }
      setState(next);
      setReady(true);
    };
    read();
    const sync = (event: StorageEvent) => {
      if (storageKey && (event.key === storageKey || event.key === null)) read();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [defaultTheme, storageKey]);
  React.useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  }, [ready, resolvedTheme]);
  const setTheme = React.useCallback(
    (next: ThemePreference) => {
      if (!validTheme(next)) return;
      setState(next);
      try {
        if (storageKey) localStorage.setItem(storageKey, next);
      } catch {
        /* In-memory preference remains usable. */
      }
    },
    [storageKey],
  );
  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme requires a ThemeProvider');
  return context;
}

/** Compact light/dark toggle. Use setTheme('system') in an appearance settings form. */
export function ThemeToggle(props: Omit<IconButtonProps, 'label' | 'children' | 'onClick'>) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  return (
    <IconButton
      variant="ghost"
      size="icon-sm"
      {...props}
      label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </IconButton>
  );
}
