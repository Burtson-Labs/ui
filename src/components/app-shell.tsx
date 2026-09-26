import * as React from 'react';

import { cn } from '../lib/utils';

const AppShell = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function AppShell(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="app-shell"
      className={cn('grid min-h-dvh grid-rows-[auto_1fr] bg-background text-foreground', className)}
      {...props}
    />
  );
});

/** The top bar: sticky, over the page (z 40), clear of the notch. */
const AppShellHeader = React.forwardRef<HTMLElement, React.ComponentProps<'header'>>(
  function AppShellHeader({ className, ...props }, ref) {
    return (
      <header
        ref={ref}
        data-slot="app-shell-header"
        className={cn(
          'sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-4',
          className,
        )}
        {...props}
      />
    );
  },
);

const AppShellBody = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AppShellBody({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="app-shell-body"
        className={cn('grid min-h-0 grid-cols-1', className)}
        {...props}
      />
    );
  },
);

const AppShellSidebar = React.forwardRef<HTMLElement, React.ComponentProps<'aside'>>(
  function AppShellSidebar({ className, ...props }, ref) {
    return (
      <aside
        ref={ref}
        data-slot="app-shell-sidebar"
        className={cn('min-h-0 border-r border-border bg-surface-muted/55', className)}
        {...props}
      />
    );
  },
);

const AppShellMain = React.forwardRef<HTMLElement, React.ComponentProps<'main'>>(
  function AppShellMain({ className, ...props }, ref) {
    return (
      <main
        ref={ref}
        data-slot="app-shell-main"
        className={cn('min-w-0 bg-background', className)}
        {...props}
      />
    );
  },
);

const AppShellContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AppShellContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="app-shell-content"
        className={cn('mx-auto w-full max-w-[1600px] p-4 sm:p-6', className)}
        {...props}
      />
    );
  },
);

export { AppShell, AppShellBody, AppShellContent, AppShellHeader, AppShellMain, AppShellSidebar };
