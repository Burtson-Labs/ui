import ArrowUp from '@burtson-labs/icons/react/arrow-up';
import Square from '@burtson-labs/icons/react/square';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';

export interface ComposerProps extends Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onChange'> {
  /**
   * Clears after success. Reject a returned promise to retain the draft. The
   * text can be empty when `attachmentCount` allows an attachment-only send.
   */
  onSubmit: (text: string) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
  submitErrorText?: string;
  /** Controlled value; leave out to let the composer keep its own. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** While a reply streams, the send button becomes Stop. */
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Attachment chips or a file button, shown under the text. */
  attachments?: React.ReactNode;
  /** Attachments ready to send. Above zero, an empty message can be sent. */
  attachmentCount?: number;
  /**
   * Extra gate on sending, e.g. false while an attachment is still parsing.
   * Unlike `disabled`, the person can keep typing.
   */
  canSubmit?: boolean;
  /** Extra controls left of the send button (model picker, tools). */
  actions?: React.ReactNode;
  label?: string;
}

/**
 * The message box: grows with its text, Enter sends, Shift+Enter adds a
 * line, and it never sends mid-composition (IME input).
 */
function Composer({
  onSubmit,
  onSubmitError,
  submitErrorText = 'Message could not be sent. Your draft is saved here. Try again.',
  value: controlled,
  onValueChange,
  streaming = false,
  onStop,
  disabled = false,
  placeholder = 'Ask anything…',
  attachments,
  attachmentCount = 0,
  canSubmit = true,
  actions,
  label = 'Message',
  className,
  ...props
}: ComposerProps) {
  const [own, setOwn] = React.useState('');
  const value = controlled ?? own;
  const [pending, setPending] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const sending = React.useRef(false);
  const latest = React.useRef(value);
  const mounted = React.useRef(true);
  const errorId = React.useId();
  React.useEffect(() => {
    latest.current = value;
  }, [value]);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const setValue = (v: string) => {
    if (controlled === undefined) setOwn(v);
    onValueChange?.(v);
  };
  const canSend =
    canSubmit &&
    !disabled &&
    !streaming &&
    !pending &&
    (value.trim().length > 0 || attachmentCount > 0);
  const send = async () => {
    if (!canSend || sending.current) return;
    const draft = value;
    sending.current = true;
    setFailed(false);
    setPending(true);
    try {
      await onSubmit(draft.trim());
      if (mounted.current && latest.current === draft) setValue('');
    } catch (error) {
      if (mounted.current) setFailed(true);
      onSubmitError?.(error);
    } finally {
      sending.current = false;
      if (mounted.current) setPending(false);
    }
  };

  return (
    <form
      data-slot="composer"
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
      className={cn(
        'grid gap-2 rounded-lg border border-input bg-surface p-2 shadow-xs transition-[border-color,box-shadow] focus-within:border-brand focus-within:ring-[3px] focus-within:ring-ring/15 dark:bg-surface-raised',
        disabled && 'opacity-60',
        className,
      )}
      {...props}
    >
      <textarea
        aria-label={label}
        rows={1}
        value={value}
        disabled={disabled || pending}
        aria-describedby={failed ? errorId : undefined}
        aria-invalid={failed || undefined}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing &&
            e.nativeEvent.keyCode !== 229
          ) {
            e.preventDefault();
            void send();
          }
        }}
        className="field-sizing-content max-h-48 min-h-9 w-full resize-none bg-transparent px-2 py-1.5 text-base sm:text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
      {failed && (
        <p id={errorId} role="alert" className="px-2 text-sm text-destructive">
          {submitErrorText}
        </p>
      )}
      {attachments && <div className="flex flex-wrap gap-1.5 px-1">{attachments}</div>}
      <div className="flex items-center gap-1">
        {actions}
        <div className="ml-auto">
          {streaming ? (
            <Button
              type="button"
              size="icon-sm"
              variant="secondary"
              aria-label="Stop"
              onClick={onStop}
              disabled={!onStop || disabled}
            >
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon-sm"
              aria-label="Send"
              loading={pending}
              disabled={!canSend}
            >
              <ArrowUp />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

export interface SuggestionsProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  items: string[];
  onSelect: (item: string) => void;
}

/** Starter prompts as chips. */
function Suggestions({ items, onSelect, className, ...props }: SuggestionsProps) {
  return (
    <div
      data-slot="suggestions"
      role="group"
      aria-label="Suggestions"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="animate-in rounded-full border border-border-strong bg-surface px-3 py-1.5 text-[13px] text-foreground outline-none transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-soft-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export { Composer, Suggestions };
