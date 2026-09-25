import Edit from '@burtson-labs/icons/react/edit';
import FileText from '@burtson-labs/icons/react/file-text';
import RotateCcw from '@burtson-labs/icons/react/rotate-ccw';
import ThumbsDown from '@burtson-labs/icons/react/thumbs-down';
import ThumbsUp from '@burtson-labs/icons/react/thumbs-up';
import * as React from 'react';

import { cn } from '../lib/utils';

import { formatBytes } from './attachment';
import { VoiceMessage } from './audio-player';
import { Button } from './button';
import { CopyButton } from './copy-button';
import { IconButton } from './icon-button';

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
}

/**
 * The row under a message: copy, regenerate, edit and a thumbs rating, as
 * small icon buttons. Pass it to Message's `actions`, which shows it on
 * hover and focus (always on touch screens).
 */
function MessageActions({
  copyText,
  onRegenerate,
  onEdit,
  feedback = null,
  onFeedback,
  className,
  ...props
}: MessageActionsProps) {
  const small = 'size-7 text-muted-foreground hover:text-foreground pointer-coarse:size-10';
  return (
    <div
      data-slot="message-actions"
      role="toolbar"
      aria-label="Message actions"
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    >
      {copyText !== undefined && (
        <CopyButton value={copyText} label="Copy message" className={small} />
      )}
      {onEdit && (
        <IconButton
          variant="ghost"
          size="icon-sm"
          label="Edit message"
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
          label="Regenerate response"
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
            label="Good response"
            aria-pressed={feedback === 'up'}
            onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
            className={cn(small, feedback === 'up' && 'text-brand hover:text-brand')}
          >
            <ThumbsUp className={cn(feedback === 'up' && 'fill-current')} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="icon-sm"
            label="Bad response"
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
}

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
function MessageEditor({
  defaultValue,
  onSubmit,
  onCancel,
  submitLabel = 'Send',
  className,
  ...props
}: MessageEditorProps) {
  const [value, setValue] = React.useState(defaultValue);
  const send = () => {
    if (value.trim()) onSubmit(value.trim());
  };
  return (
    <form
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
        className="field-sizing-content max-h-60 min-h-16 w-full resize-none rounded-lg border border-ring bg-surface px-3 py-2 text-base leading-6 inset-ring-1 inset-ring-ring outline-hidden! sm:text-sm"
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
}

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
}

export interface MessageAttachmentsProps extends React.ComponentProps<'div'> {
  files: MessageFile[];
}

/**
 * Files sent with a message: voice notes play inline, images show a
 * thumbnail, anything else is a named chip that opens the file.
 */
function MessageAttachments({ files, className, ...props }: MessageAttachmentsProps) {
  if (!files.length) return null;
  return (
    <div
      data-slot="message-attachments"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      {files.map((f, i) => {
        const type = f.type ?? '';
        if (type.startsWith('audio/') && f.href) {
          return (
            <VoiceMessage
              key={`${f.name}-${i}`}
              src={f.href}
              peaks={f.peaks}
              duration={f.duration}
              transcript={f.transcript}
              title={f.name}
            />
          );
        }
        if (type.startsWith('image/') && f.href) {
          return (
            <a
              key={`${f.name}-${i}`}
              href={f.href}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
            >
              <img src={f.href} alt={f.name} className="h-28 w-auto max-w-56 object-cover" />
            </a>
          );
        }
        const chip = (
          <>
            <FileText aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">{f.name}</span>
            {f.size !== undefined && (
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
            )}
          </>
        );
        const chipClass =
          'inline-flex max-w-64 items-center gap-2 rounded-md border bg-surface px-2.5 py-1.5 text-sm';
        return f.href ? (
          <a
            key={`${f.name}-${i}`}
            href={f.href}
            target="_blank"
            rel="noreferrer"
            className={cn(
              chipClass,
              'outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/20',
            )}
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
}

export { MessageActions, MessageAttachments, MessageEditor };
