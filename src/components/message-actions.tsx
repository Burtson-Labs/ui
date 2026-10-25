import Edit from '@burtson-labs/icons/react/edit';
import FileText from '@burtson-labs/icons/react/file-text';
import RotateCcw from '@burtson-labs/icons/react/rotate-ccw';
import ThumbsDown from '@burtson-labs/icons/react/thumbs-down';
import ThumbsUp from '@burtson-labs/icons/react/thumbs-up';
import * as React from 'react';

import { safeImageSrc, safeLinkHref } from '../lib/safe-url';
import { cn, focusRingClasses, noOutlineClasses } from '../lib/utils';

import { formatBytes } from './attachment';
import { VoiceMessage } from './audio-player';
import { Button } from './button';
import { CopyButton } from './copy-button';
import { IconButton } from './icon-button';
import { ImageGallery } from './image-lightbox';
import { ResponseVersions, type ResponseVersionsProps } from './response-versions';

export type MessageFeedback = 'up' | 'down' | null;

export interface MessageActionsProps extends React.ComponentProps<'div'> {
  /** Text for the copy button; leave out to hide it. */
  copyText?: string;
  onRegenerate?: () => void;
  /** Edit a sent message (user turns). Pair with MessageEditor. */
  onEdit?: () => void;
  /** The current rating; controlled. */
  feedback?: MessageFeedback;
  /** Adds thumbs up and down. Clicking the chosen one again clears it (null). */
  onFeedback?: (value: MessageFeedback) => void;
  /** Accessible names, for translation. */
  labels?: Partial<typeof messageActionLabels>;
  /**
   * A "2 / 3" switcher between regenerated responses, first in the row.
   * Hidden while there is only one version.
   */
  versions?: Pick<ResponseVersionsProps, 'index' | 'count' | 'onIndexChange' | 'labels'>;
}

const messageActionLabels = {
  group: 'Message actions',
  copy: 'Copy message',
  edit: 'Edit message',
  regenerate: 'Regenerate response',
  good: 'Good response',
  bad: 'Bad response',
};

/**
 * The row under a message: copy, regenerate, edit and a thumbs rating, as
 * small icon buttons. Pass it to Message's `actions`, which shows it on
 * hover and focus (always on touch screens).
 */
const MessageActions = React.forwardRef<HTMLDivElement, MessageActionsProps>(
  function MessageActions(
    {
      copyText,
      onRegenerate,
      onEdit,
      feedback = null,
      onFeedback,
      labels,
      versions,
      className,
      ...props
    },
    ref,
  ) {
    const l = { ...messageActionLabels, ...labels };
    const small = 'size-7 text-muted-foreground hover:text-foreground pointer-coarse:size-11';
    return (
      <div
        ref={ref}
        data-slot="message-actions"
        role="group"
        aria-label={l.group}
        className={cn('flex items-center gap-0.5', className)}
        {...props}
      >
        {versions && <ResponseVersions {...versions} className="mr-0.5" />}
        {copyText !== undefined && <CopyButton value={copyText} label={l.copy} className={small} />}
        {onEdit && (
          <IconButton
            variant="ghost"
            size="icon-sm"
            label={l.edit}
            onClick={onEdit}
            className={small}
          >
            <Edit />
          </IconButton>
        )}
        {onRegenerate && (
          <IconButton
            variant="ghost"
            size="icon-sm"
            label={l.regenerate}
            onClick={onRegenerate}
            className={small}
          >
            <RotateCcw />
          </IconButton>
        )}
        {onFeedback && (
          <>
            <IconButton
              variant="ghost"
              size="icon-sm"
              label={l.good}
              aria-pressed={feedback === 'up'}
              onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
              className={cn(small, feedback === 'up' && 'text-brand hover:text-brand')}
            >
              <ThumbsUp className={cn(feedback === 'up' && 'fill-current')} />
            </IconButton>
            <IconButton
              variant="ghost"
              size="icon-sm"
              label={l.bad}
              aria-pressed={feedback === 'down'}
              onClick={() => onFeedback(feedback === 'down' ? null : 'down')}
              className={cn(small, feedback === 'down' && 'text-foreground')}
            >
              <ThumbsDown className={cn(feedback === 'down' && 'fill-current')} />
            </IconButton>
          </>
        )}
      </div>
    );
  },
);

export interface MessageEditorProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  /** The text being edited. */
  defaultValue: string;
  /** Save and send the edited message again. */
  onSubmit: (text: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}

/**
 * Edit-and-resend in place of a sent message. Enter sends (never mid-IME
 * composition), Shift+Enter adds a line, Escape cancels.
 */
const MessageEditor = React.forwardRef<HTMLFormElement, MessageEditorProps>(function MessageEditor(
  { defaultValue, onSubmit, onCancel, submitLabel = 'Send', className, ...props },
  ref,
) {
  const [value, setValue] = React.useState(defaultValue);
  const send = () => {
    if (value.trim()) onSubmit(value.trim());
  };
  return (
    <form
      ref={ref}
      data-slot="message-editor"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      className={cn('grid w-full max-w-[85%] gap-2 justify-self-end', className)}
      {...props}
    >
      <textarea
        aria-label="Edit message"
        value={value}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- editing was just asked for
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
          if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        className={cn(
          'field-sizing-content max-h-60 min-h-16 w-full resize-none rounded-lg border border-ring bg-surface px-3 py-2 text-base leading-6 inset-ring-1 inset-ring-ring sm:text-sm',
          noOutlineClasses,
        )}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!value.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
});

export interface MessageFile {
  name: string;
  /** Bytes. */
  size?: number;
  /** MIME type; audio renders a player, images a thumbnail. */
  type?: string;
  /** Where to open or play it. */
  href?: string;
  /** Waveform peaks for audio (see computePeaks). */
  peaks?: number[];
  /** Seconds, for audio. */
  duration?: number;
  /** Transcript for audio. */
  transcript?: React.ReactNode;
  /** What an image shows. Defaults to the file name; write a real description when you have one. */
  alt?: string;
}

export interface MessageAttachmentsProps extends React.ComponentProps<'div'> {
  files: MessageFile[];
  /**
   * Open images in an ImageLightbox in the page instead of a new tab. With
   * several images the viewer moves between them.
   */
  lightbox?: boolean;
}

/**
 * Files sent with a message: voice notes play inline, images show a
 * thumbnail, anything else is a named chip that opens the file.
 */
const MessageAttachments = React.forwardRef<HTMLDivElement, MessageAttachmentsProps>(
  function MessageAttachments({ files, lightbox = false, className, ...props }, ref) {
    if (!files.length) return null;
    const isImage = (f: MessageFile) =>
      (f.type ?? '').startsWith('image/') && !!safeImageSrc(f.href);
    const images = lightbox ? files.filter(isImage) : [];
    return (
      <div
        ref={ref}
        data-slot="message-attachments"
        className={cn('flex flex-wrap gap-2', className)}
        {...props}
      >
        {images.length > 0 && (
          <ImageGallery
            className="contents"
            images={images.map((f) => ({
              src: f.href ?? '',
              alt: f.alt || f.name,
              caption: f.name,
            }))}
          />
        )}
        {files.map((f, i) => {
          const type = f.type ?? '';
          if (lightbox && isImage(f)) return null;
          const href = safeLinkHref(f.href, { blob: true });
          if (type.startsWith('audio/') && href) {
            return (
              <VoiceMessage
                key={`${f.name}-${i}`}
                src={href}
                peaks={f.peaks}
                duration={f.duration}
                transcript={f.transcript}
                title={f.name}
              />
            );
          }
          const src = safeImageSrc(f.href);
          if (type.startsWith('image/') && src) {
            const img = (
              <img src={src} alt={f.alt || f.name} className="h-28 w-auto max-w-56 object-cover" />
            );
            // A data: image can be shown but is not a link target.
            return href ? (
              <a
                key={`${f.name}-${i}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('block overflow-hidden rounded-lg border', focusRingClasses)}
              >
                {img}
              </a>
            ) : (
              <span key={`${f.name}-${i}`} className="block overflow-hidden rounded-lg border">
                {img}
              </span>
            );
          }
          const chip = (
            <>
              <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 truncate">{f.name}</span>
              {f.size !== undefined && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(f.size)}
                </span>
              )}
            </>
          );
          const chipClass =
            'inline-flex max-w-64 items-center gap-2 rounded-md border bg-surface px-2.5 py-1.5 text-sm pointer-coarse:min-h-11';
          return href ? (
            <a
              key={`${f.name}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(chipClass, 'hover:bg-muted', focusRingClasses)}
            >
              {chip}
            </a>
          ) : (
            <span key={`${f.name}-${i}`} className={chipClass}>
              {chip}
            </span>
          );
        })}
      </div>
    );
  },
);

export { MessageActions, MessageAttachments, MessageEditor };
