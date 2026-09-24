import BurtsonLabsVial from '@burtson-labs/icons/react/burtson-labs-vial';
import ExternalLink from '@burtson-labs/icons/react/external-link';
import Menu from '@burtson-labs/icons/react/menu';
import Moon from '@burtson-labs/icons/react/moon';
import Sun from '@burtson-labs/icons/react/sun';
import * as React from 'react';

import {
  Button,
  cn,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  TooltipProvider,
} from '@burtson-labs/ui';

import { AccentPicker } from './accent';
import { components } from './docs';
import { ComponentPage, Home, Installation, Mui, NotFound, Theming } from './pages';
import { Link, usePath } from './router';

const guides = [
  { href: '/docs/installation', title: 'Installation' },
  { href: '/docs/theming', title: 'Theming' },
  { href: '/docs/mui', title: 'Using with MUI' },
];

function useTheme() {
  const [isDark, setDark] = React.useState(() =>
    document.documentElement.classList.contains('dark'),
  );
  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('bl-ui-theme', next ? 'dark' : 'light');
    } catch (err) {
      // Storage can be blocked (private windows); the toggle still works for
      // this visit, it just is not remembered. Nothing to report.
      void err;
    }
    setDark(next);
  };
  return { isDark, toggle };
}

function Nav({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const item = (href: string, title: string) => (
    <Link
      key={href}
      href={href}
      onClick={onNavigate}
      aria-current={path === href ? 'page' : undefined}
      className={cn(
        'block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        path === href && 'bg-accent font-medium text-accent-foreground',
      )}
    >
      {title}
    </Link>
  );
  return (
    <nav className="grid gap-6 text-sm" aria-label="Docs">
      <div className="grid gap-0.5">
        <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-foreground uppercase">
          Getting started
        </p>
        {guides.map((g) => item(g.href, g.title))}
      </div>
      <div className="grid gap-0.5">
        <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-foreground uppercase">
          Components
        </p>
        {components.map((c) => item(`/docs/components/${c.name}`, c.title))}
      </div>
    </nav>
  );
}

function route(path: string) {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/') return <Home />;
  if (clean === '/docs' || clean === '/docs/installation') return <Installation />;
  if (clean === '/docs/theming') return <Theming />;
  if (clean === '/docs/mui') return <Mui />;
  const m = /^\/docs\/components\/([a-z-]+)$/.exec(clean);
  const doc = m && components.find((c) => c.name === m[1]);
  return doc ? <ComponentPage key={doc.name} doc={doc} /> : <NotFound />;
}

export function App() {
  const path = usePath();
  const { isDark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isHome = path === '/';

  React.useEffect(() => {
    const doc = components.find((c) => path.endsWith(`/components/${c.name}`));
    document.title = doc ? `${doc.title} · Burtson UI` : 'Burtson UI';
  }, [path]);

  return (
    <TooltipProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="border-b px-4 py-4">Burtson UI</SheetTitle>
              <ScrollArea className="h-[calc(100dvh-4rem)] px-2 pb-6">
                <Nav path={path} onNavigate={() => setMenuOpen(false)} />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <BurtsonLabsVial className="size-5" aria-hidden />
            Burtson UI
          </Link>
          <nav className="ml-4 hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <Link href="/docs/installation" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/docs/components/button" className="hover:text-foreground">
              Components
            </Link>
            <a
              href="https://icons.burtson.ai"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              Icons <ExternalLink className="size-3" aria-hidden />
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/Burtson-Labs/ui" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </Button>
            <AccentPicker />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggle}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6">
        {!isHome && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 lg:block">
            <ScrollArea className="h-full py-8 pr-2">
              <Nav path={path} />
            </ScrollArea>
          </aside>
        )}
        <main id="main" className={cn('min-w-0 flex-1', !isHome && 'max-w-3xl py-10')}>
          {route(path)}
        </main>
      </div>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Burtson UI is MIT licensed · Built by{' '}
        <a href="https://burtson.ai" className="text-foreground hover:underline">
          Burtson Labs
        </a>{' '}
        · Inspired by{' '}
        <a href="https://ui.shadcn.com" className="text-foreground hover:underline">
          shadcn/ui
        </a>
      </footer>
    </TooltipProvider>
  );
}
