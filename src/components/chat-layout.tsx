import Maximize from '@burtson-labs/icons/react/maximize';
import Minimize from '@burtson-labs/icons/react/minimize';
import PanelLeft from '@burtson-labs/icons/react/panel-left';
import PanelLeftClose from '@burtson-labs/icons/react/panel-left-close';
import * as React from 'react';

import { cn } from '../lib/utils';

import { IconButton } from './icon-button';
import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from './resizable';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet';

/**
 * Full screen for one element: the Fullscreen API where the browser allows
 * it, otherwise the element is pinned over the page with CSS. Escape leaves
 * either way. Nothing remounts, so focus and scroll stay where they were.
 */
export function useFullscreen(
  ref: React.RefObject<HTMLElement | null>,
  onChange?: (fullscreen: boolean) => void,
) {
  const [native, setNative] = React.useState(false);
  const [fallback, setFallback] = React.useState(false);
  const active = native || fallback;
  const changed = React.useRef(onChange);
  React.useEffect(() => {
    changed.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    const sync = () =>
      setNative(Boolean(ref.current && document.fullscreenElement === ref.current));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [ref]);

  React.useEffect(() => {
    if (!fallback) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) setFallback(false);
    };
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [fallback]);

  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    changed.current?.(active);
  }, [active]);

  const enter = React.useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    const canNative = document.fullscreenEnabled && typeof el.requestFullscreen === 'function';
    // Denied (iframe without allowfullscreen, iOS) resolves false: use the CSS fallback.
    const ok = canNative
      ? await el.requestFullscreen().then(
          () => true,
          () => false,
        )
      : false;
    if (!ok) setFallback(true);
  }, [ref]);

  const exit = React.useCallback(async () => {
    setFallback(false);
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      await document.exitFullscreen().catch(() => undefined);
    }
  }, []);

  const toggle = React.useCallback(() => (active ? exit() : enter()), [active, enter, exit]);
  return { fullscreen: active, native, enter, exit, toggle };
}

function useDesktop(query = '(min-width: 768px)') {
  const get = () => (typeof matchMedia === 'function' ? matchMedia(query).matches : true);
  const [desktop, setDesktop] = React.useState(get);
  React.useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(query);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, [query]);
  return desktop;
}

export interface ChatLayoutProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The history column, usually a ChatHistory. A sheet from the left on phones. */
  sidebar?: React.ReactNode;
  sidebarLabel?: string;
  /** An optional right column: sources, files, run details. Hidden on phones. */
  details?: React.ReactNode;
  detailsLabel?: string;
  /** Shown in the header: the conversation title. */
  title?: React.ReactNode;
  /** Header controls right of the title (model picker, share). */
  actions?: React.ReactNode;
  /** Controlled sidebar state; leave out to let the layout keep its own. */
  sidebarOpen?: boolean;
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  /** Show the Full screen button. Default true. */
  allowFullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** Sidebar width, e.g. "22%" or 280 (px), as ResizablePanel sizes. */
  sidebarSize?: number | string;
}

/**
 * The frame for a chat app: header, a resizable history sidebar (a sheet on
 * phones that closes when a chat is picked), the conversation, an optional
 * details column, and a Full screen mode. Put a Conversation and a Composer
 * in `children`; the layout stacks them and keeps the composer at the bottom.
 */
const ChatLayout = React.forwardRef<HTMLDivElement, ChatLayoutProps>(function ChatLayout(
  {
    sidebar,
    sidebarLabel = 'Chats',
    details,
    detailsLabel = 'Details',
    title,
    actions,
    sidebarOpen: controlledOpen,
    defaultSidebarOpen = true,
    onSidebarOpenChange,
    allowFullscreen = true,
    onFullscreenChange,
    sidebarSize = '24%',
    children,
    className,
    ...props
  },
  ref,
) {
  const root = React.useRef<HTMLDivElement>(null);
  const desktop = useDesktop();
  const [ownOpen, setOwnOpen] = React.useState(defaultSidebarOpen);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const open = controlledOpen ?? ownOpen;
  const setOpen = (v: boolean) => {
    if (controlledOpen === undefined) setOwnOpen(v);
    onSidebarOpenChange?.(v);
  };
  const { fullscreen, toggle } = useFullscreen(root, onFullscreenChange);

  const sidebarToggle = sidebar ? (
    desktop ? (
      <IconButton
        variant="ghost"
        size="icon-sm"
        label={open ? `Hide ${sidebarLabel.toLowerCase()}` : `Show ${sidebarLabel.toLowerCase()}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <PanelLeftClose /> : <PanelLeft />}
      </IconButton>
    ) : (
      <IconButton
        variant="ghost"
        size="icon-sm"
        className="pointer-coarse:size-11"
        label={`Open ${sidebarLabel.toLowerCase()}`}
        aria-expanded={sheetOpen}
        onClick={() => setSheetOpen(true)}
      >
        <PanelLeft />
      </IconButton>
    )
  ) : null;

  const main = (
    <div data-slot="chat-layout-main" className="flex h-full min-h-0 min-w-0 flex-col">
      {children}
    </div>
  );

  return (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="chat-layout"
      data-fullscreen={fullscreen || undefined}
      className={cn(
        'flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground',
        'data-[fullscreen]:fixed data-[fullscreen]:inset-0 data-[fullscreen]:z-50 data-[fullscreen]:h-dvh data-[fullscreen]:w-screen',
        className,
      )}
      {...props}
    >
      <header className="flex h-12 shrink-0 items-center gap-1 border-b px-2">
        {sidebarToggle}
        <div className="min-w-0 flex-1 truncate px-1 text-sm font-medium">{title}</div>
        {actions}
        {allowFullscreen && (
          <IconButton
            variant="ghost"
            size="icon-sm"
            className="pointer-coarse:size-11"
            label={fullscreen ? 'Exit full screen' : 'Full screen'}
            aria-pressed={fullscreen}
            onClick={() => void toggle()}
          >
            {fullscreen ? <Minimize /> : <Maximize />}
          </IconButton>
        )}
      </header>
      <div className="min-h-0 flex-1">
        {desktop && (sidebar || details) ? (
          <ResizablePanelGroup orientation="horizontal">
            {sidebar && open && (
              <>
                <ResizablePanel
                  id="chat-sidebar"
                  defaultSize={sidebarSize}
                  minSize={180}
                  maxSize="45%"
                  className="bg-surface-muted/50"
                >
                  <aside aria-label={sidebarLabel} className="h-full">
                    {sidebar}
                  </aside>
                </ResizablePanel>
                <ResizeHandle aria-label={`Resize ${sidebarLabel.toLowerCase()}`} />
              </>
            )}
            <ResizablePanel id="chat-main" minSize="30%">
              {main}
            </ResizablePanel>
            {details && (
              <>
                <ResizeHandle aria-label={`Resize ${detailsLabel.toLowerCase()}`} />
                <ResizablePanel id="chat-details" defaultSize="26%" minSize={200} maxSize="45%">
                  <aside aria-label={detailsLabel} className="h-full overflow-y-auto">
                    {details}
                  </aside>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        ) : (
          main
        )}
      </div>
      {sidebar && !desktop && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="w-[min(20rem,88vw)] gap-0 p-0">
            <SheetTitle className="border-b px-4 py-3.5 text-sm">{sidebarLabel}</SheetTitle>
            <SheetDescription className="sr-only">Pick a conversation.</SheetDescription>
            <div
              className="min-h-0 flex-1"
              // Picking a chat (or New chat) closes the sheet, as on a phone it should.
              onClickCapture={(e) => {
                const t = e.target as HTMLElement;
                if (t.closest('[data-slot="chat-history-row"], [data-close-sheet]'))
                  setSheetOpen(false);
              }}
            >
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
});

export { ChatLayout };
