import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import FileText from '@burtson-labs/icons/react/file-text';
import RotateCw from '@burtson-labs/icons/react/rotate-cw';
import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import { Progress } from './progress';
import { Spinner } from './spinner';

/**
 * Where a file is on its way into a message. The app owns the upload and the
 * parsing; these components only show the state it reports.
 */
export type AttachmentState = 'queued' | 'uploading' | 'parsing' | 'ready' | 'failed';

const stateText: Record<AttachmentState, string> = {
  queued: 'Waiting',
  uploading: 'Uploading',
  parsing: 'Reading',
  ready: 'Ready',
  failed: 'Failed',
};

/** 1536 → "1.5 KB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

const InTray = React.createContext(false);

export interface AttachmentItemProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  name: string;
  /** Bytes. */
  size?: number;
  state?: AttachmentState;
  /** 0–100 while uploading or reading. Leave out for an indeterminate bar. */
  progress?: number;
  /** Why it failed, in words the person can act on. */
  error?: string;
  /** A thumbnail URL for images. */
  preview?: string;
  /** Replaces the file icon. */
  icon?: React.ReactNode;
  onRemove?: () => void;
  onRetry?: () => void;
  /** `chip` sits in a composer; `row` fills an upload list. */
  layout?: 'chip' | 'row';
}

/**
 * One attached file: name, size, state, progress, and remove/retry. State
 * changes are announced politely; a failure says why.
 */
const AttachmentItem = React.forwardRef<HTMLDivElement, AttachmentItemProps>(
  function AttachmentItem(
    {
      name,
      size,
      state = 'ready',
      progress,
      error,
      preview,
      icon,
      onRemove,
      onRetry,
      layout = 'chip',
      className,
      ...props
    },
    ref,
  ) {
    const inTray = React.useContext(InTray);
    const busy = state === 'uploading' || state === 'parsing';
    const failed = state === 'failed';
    const meta = [size !== undefined ? formatBytes(size) : null, stateText[state]]
      .filter(Boolean)
      .join(' · ');
    return (
      <div
        ref={ref}
        data-slot="attachment-item"
        data-state={state}
        data-layout={layout}
        role={inTray ? 'listitem' : undefined}
        aria-busy={busy || undefined}
        className={cn(
          'group/attachment relative flex min-w-0 items-center gap-2.5 rounded-md border bg-surface text-sm',
          layout === 'chip' ? 'w-60 max-w-full shrink-0 p-1.5 pr-1' : 'w-full p-2.5',
          failed && 'border-destructive/40 bg-destructive/5',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'grid shrink-0 place-items-center overflow-hidden rounded-sm bg-muted text-muted-foreground [&_svg]:size-4',
            layout === 'chip' ? 'size-9' : 'size-10',
          )}
        >
          {preview ? (
            <img src={preview} alt="" className="size-full object-cover" />
          ) : failed ? (
            <AlertCircle className="text-destructive" aria-hidden />
          ) : busy ? (
            <Spinner className="size-4" role="presentation" aria-hidden />
          ) : (
            (icon ?? <FileText aria-hidden />)
          )}
        </div>
        <div className="grid min-w-0 flex-1 gap-1">
          <span className="truncate font-medium text-foreground" title={name}>
            {name}
          </span>
          <span
            aria-live="polite"
            className={cn(
              'truncate text-xs',
              failed ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            <span className="sr-only">{name}: </span>
            {failed && error ? error : meta}
          </span>
          {busy && (
            <Progress value={progress} aria-label={`${stateText[state]} ${name}`} className="h-1" />
          )}
        </div>
        {failed && onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Retry ${name}`}
            title="Retry"
            onClick={onRetry}
          >
            <RotateCw />
          </Button>
        )}
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${name}`}
            title="Remove"
            onClick={onRemove}
          >
            <X />
          </Button>
        )}
      </div>
    );
  },
);

export interface AttachmentTrayProps extends React.ComponentProps<'div'> {
  /** Accessible name for the list. */
  label?: string;
}

/** Attachments waiting to send, in a row that scrolls sideways when full. */
const AttachmentTray = React.forwardRef<HTMLDivElement, AttachmentTrayProps>(
  function AttachmentTray({ label = 'Attachments', className, children, ...props }, ref) {
    return (
      <InTray.Provider value={true}>
        <div
          ref={ref}
          data-slot="attachment-tray"
          role="list"
          aria-label={label}
          className={cn('flex max-w-full gap-1.5 overflow-x-auto pb-0.5', className)}
          {...props}
        >
          {children}
        </div>
      </InTray.Provider>
    );
  },
);

export interface UploadQueueFile {
  id: string;
  name: string;
  size?: number;
  state: AttachmentState;
  progress?: number;
  error?: string;
}

export interface UploadQueueProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  files: UploadQueueFile[];
  title?: React.ReactNode;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  /** Shown when there are no files. */
  empty?: React.ReactNode;
}

/** A list of uploads with a summary: "2 of 4 ready, 1 failed". */
const UploadQueue = React.forwardRef<HTMLElement, UploadQueueProps>(function UploadQueue(
  { files, title = 'Uploads', onRemove, onRetry, empty, className, ...props },
  ref,
) {
  const headingId = React.useId();
  const ready = files.filter((f) => f.state === 'ready').length;
  const failed = files.filter((f) => f.state === 'failed').length;
  const summary = files.length
    ? `${ready} of ${files.length} ready${failed ? `, ${failed} failed` : ''}`
    : '';
  return (
    <section
      ref={ref}
      data-slot="upload-queue"
      aria-labelledby={headingId}
      className={cn('grid gap-2', className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={headingId} className="text-sm font-semibold">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">{summary}</span>
      </div>
      {files.length === 0 ? (
        empty ? (
          <div className="text-sm text-muted-foreground">{empty}</div>
        ) : null
      ) : (
        <InTray.Provider value={true}>
          <div role="list" aria-labelledby={headingId} className="grid gap-1.5">
            {files.map((f) => (
              <AttachmentItem
                key={f.id}
                layout="row"
                name={f.name}
                size={f.size}
                state={f.state}
                progress={f.progress}
                error={f.error}
                onRemove={onRemove ? () => onRemove(f.id) : undefined}
                onRetry={onRetry ? () => onRetry(f.id) : undefined}
              />
            ))}
          </div>
        </InTray.Provider>
      )}
    </section>
  );
});

export { AttachmentItem, AttachmentTray, UploadQueue };
