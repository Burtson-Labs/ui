import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { type Breakpoint, useNarrowerThan } from '../lib/media';
import { cn } from '../lib/utils';

import { IconButton } from './icon-button';
import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from './resizable';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from './sheet';

const artifactPanelLabels = {
  close: 'Close artifact',
  resize: 'Resize artifact',
};

export interface ArtifactPanelProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The generated artifact: a document, code, a preview. */
  artifact: React.ReactNode;
  /** The artifact's name, shown in the panel header and naming the region. */
  title: React.ReactNode;
  /** A line under the title, e.g. "Version 3 · TypeScript". */
  description?: React.ReactNode;
  /** Header controls left of Close: copy, download, open in a new tab. */
  actions?: React.ReactNode;
  /**
   * Controlled; leave out to let the panel keep its own state. On smaller
   * screens an open panel is a modal sheet, so open it in response to the
   * person (an Open button), not on page load.
   */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Starting width of the panel, as ResizablePanel sizes ("50%", 480). */
  defaultSize?: number | string;
  /** Narrowest the panel can be dragged. Default 320 (px). */
  minSize?: number | string;
  /** Widest the panel can be dragged. Default "75%". */
  maxSize?: number | string;
  /** Below this breakpoint the artifact opens as a full-height sheet. Default `lg`. */
  breakpoint?: Breakpoint;
  /** Accessible names, for translation. */
  labels?: Partial<typeof artifactPanelLabels>;
}

/**
 * A generated artifact beside the conversation: the conversation (children)
 * on the left, the artifact in a resizable panel on the right with a header
 * and Close. The handle resizes with a pointer or the arrow keys. Below
 * `breakpoint` the artifact is a sheet over the conversation instead.
 * Closing returns focus to whatever opened the panel.
 */
const ArtifactPanel = React.forwardRef<HTMLDivElement, ArtifactPanelProps>(function ArtifactPanel(
  {
    artifact,
    title,
    description,
    actions,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    defaultSize = '50%',
    minSize = 320,
    maxSize = '75%',
    breakpoint = 'lg',
    labels,
    children,
    className,
    ...props
  },
  ref,
) {
  const l = { ...artifactPanelLabels, ...labels };
  const narrow = useNarrowerThan(breakpoint);
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panel = React.useRef<HTMLElement>(null);
  // Where focus was when the panel opened, to go back to on close.
  const opener = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (open) {
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
    }
  }, [open]);
  const close = () => {
    const wasInside = !!panel.current?.contains(document.activeElement);
    setOpen(false);
    if (narrow) return; // the sheet restores focus in onCloseAutoFocus
    // The panel unmounts with the close button in it. Move focus back to the
    // opener when it was in the panel or is left on <body> (Safari does not
    // focus a clicked button, so "was in the panel" alone is not enough).
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const lost = !active || active === document.body || !active.isConnected;
      if ((wasInside || lost) && opener.current?.isConnected) opener.current.focus();
    });
  };

  const header = (
    <div
      data-slot="artifact-panel-header"
      className="flex min-h-12 shrink-0 items-center gap-1 border-b py-1.5 pr-1.5 pl-4"
    >
      <div className="grid min-w-0 flex-1">
        {narrow ? (
          <SheetTitle className="truncate text-sm">{title}</SheetTitle>
        ) : (
          <h2 id={titleId} className="truncate text-sm font-semibold tracking-[-0.01em]">
            {title}
          </h2>
        )}
        {description &&
          (narrow ? (
            <SheetDescription className="truncate text-xs">{description}</SheetDescription>
          ) : (
            <p id={descriptionId} className="truncate text-xs text-muted-foreground">
              {description}
            </p>
          ))}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
      <IconButton
        variant="ghost"
        size="icon-sm"
        label={l.close}
        onClick={close}
        className="pointer-coarse:size-11"
      >
        <X />
      </IconButton>
    </div>
  );
  const body = (
    <div data-slot="artifact-panel-body" className="min-h-0 flex-1 overflow-auto">
      {artifact}
    </div>
  );
  const main = (
    <div data-slot="artifact-panel-main" className="flex h-full min-h-0 min-w-0 flex-col">
      {children}
    </div>
  );

  return (
    <div
      ref={ref}
      data-slot="artifact-layout"
      data-state={open ? 'open' : 'closed'}
      className={cn('flex h-full min-h-0 min-w-0', className)}
      {...props}
    >
      {narrow ? (
        main
      ) : (
        // The conversation keeps its place in the tree whether or not the
        // artifact is open, so its scroll position and drafts survive.
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel id="artifact-main" minSize="25%">
            {main}
          </ResizablePanel>
          {open && (
            <>
              <ResizeHandle aria-label={l.resize} withHandle />
              <ResizablePanel
                id="artifact-panel"
                defaultSize={defaultSize}
                minSize={minSize}
                maxSize={maxSize}
              >
                <section
                  ref={panel}
                  data-slot="artifact-panel"
                  aria-labelledby={titleId}
                  aria-describedby={description ? descriptionId : undefined}
                  className="flex h-full min-h-0 flex-col bg-surface"
                >
                  {header}
                  {body}
                </section>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}
      {narrow && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            ref={panel as React.Ref<HTMLDivElement>}
            data-slot="artifact-panel"
            side="right"
            showCloseButton={false}
            // There is no SheetTrigger: focus goes back to whatever opened the panel.
            onCloseAutoFocus={(e) => {
              if (!opener.current?.isConnected) return;
              e.preventDefault();
              opener.current.focus();
            }}
            // Without a description, do not point at a missing one.
            {...(description ? {} : { 'aria-describedby': undefined })}
            className="w-full max-w-none gap-0 p-0 sm:max-w-none md:w-[min(42rem,90vw)]"
          >
            {header}
            {body}
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
});

export { ArtifactPanel };
