import * as React from 'react';

import { cn } from '../lib/utils';

function AppShell({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell"
      className={cn('grid min-h-dvh grid-rows-[auto_1fr] bg-background text-foreground', className)}
      {...props}
    />
  );
}

function AppShellHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        'sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/90 px-3 backdrop-blur-xl sm:px-4',
        className,
      )}
      {...props}
    />
  );
}

function AppShellBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell-body"
      className={cn('grid min-h-0 grid-cols-1', className)}
      {...props}
    />
  );
}

function AppShellSidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="app-shell-sidebar"
      className={cn('min-h-0 border-r border-border bg-surface-muted/55', className)}
      {...props}
    />
  );
}

function AppShellMain({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="app-shell-main"
      className={cn('min-w-0 bg-background', className)}
      {...props}
    />
  );
}

function AppShellContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell-content"
      className={cn('mx-auto w-full max-w-[1600px] p-4 sm:p-6', className)}
      {...props}
    />
  );
}

export { AppShell, AppShellBody, AppShellContent, AppShellHeader, AppShellMain, AppShellSidebar };
