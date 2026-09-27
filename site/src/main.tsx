import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider, type ThemePreference } from '@burtson-labs/ui';

import { AppearanceSync } from './accent';
import { App } from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('missing #root');
const requested = new URLSearchParams(location.search).get('theme');
const queryTheme: ThemePreference | null =
  requested === 'light' || requested === 'dark' || requested === 'system' ? requested : null;
createRoot(root).render(
  <StrictMode>
    <ThemeProvider
      defaultTheme={queryTheme ?? 'system'}
      storageKey={queryTheme ? null : 'bl-ui-theme'}
    >
      <AppearanceSync />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
