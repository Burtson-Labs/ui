import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';

/** Built-in character sets for a code. */
export type InputOTPPreset = 'numeric' | 'alphanumeric' | 'alpha';

const PRESETS: Record<InputOTPPreset, RegExp> = {
  numeric: /^[0-9]$/,
  alphanumeric: /^[A-Za-z0-9]$/,
  alpha: /^[A-Za-z]$/,
};

const MAX_PATTERN = 256;

/**
 * Builds the per-character test. A pattern only ever sees one character, so a
 * pathological expression cannot backtrack over a long string; the global and
 * sticky flags are dropped (they make `test` stateful); an invalid or
 * oversized source falls back to digits rather than throwing.
 */
export function otpCharTest(pattern: RegExp | string = 'numeric') {
  let re: RegExp = PRESETS.numeric;
  if (pattern instanceof RegExp) {
    if (pattern.source.length <= MAX_PATTERN)
      re = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''));
  } else if (pattern in PRESETS) {
    re = PRESETS[pattern as InputOTPPreset];
  } else if (typeof pattern === 'string' && pattern.length <= MAX_PATTERN) {
    try {
      re = new RegExp(pattern);
    } catch {
      re = PRESETS.numeric;
    }
  }
  return (ch: string) => ch.length === 1 && re.test(ch);
}

export interface InputOTPProps extends Omit<
  React.ComponentProps<'input'>,
  'value' | 'defaultValue' | 'onChange' | 'pattern' | 'maxLength' | 'size' | 'type'
> {
  /** Number of characters. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once every slot is filled (after typing, autofill or paste). */
  onComplete?: (value: string) => void;
  /**
   * Which characters are allowed: a preset, or a RegExp tested against one
   * character at a time. Anything else (spaces and dashes in a pasted code)
   * is dropped.
   */
  pattern?: InputOTPPreset | RegExp;
  /** Draw a separator after every N slots (3 for "123 456"). */
  groupSize?: number;
  /** Classes for the box around the slots (className goes to the input). */
  containerClassName?: string;
}

/**
 * A one-time code field drawn as N slots. It is one real input, so a screen
 * reader announces one field and the platform can fill it: autocomplete is
 * "one-time-code" and the numeric keyboard shows on phones. Pasting a whole
 * code fills every slot; characters outside the pattern are dropped. Label
 * it with Field or aria-label ("Verification code").
 */
const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    length = 6,
    value: valueProp,
    defaultValue = '',
    onValueChange,
    onComplete,
    pattern = 'numeric',
    groupSize,
    className,
    containerClassName,
    disabled,
    inputMode,
    onFocus,
    onSelect,
    onPaste,
    ...props
  },
  ref,
) {
  const size = Math.max(1, Math.floor(length));
  const test = React.useMemo(() => otpCharTest(pattern), [pattern]);
  const clean = React.useCallback(
    (raw: string) => [...raw].filter(test).slice(0, size).join(''),
    [test, size],
  );
  const [uncontrolled, setUncontrolled] = React.useState(() => clean(defaultValue));
  const value = valueProp !== undefined ? clean(valueProp) : uncontrolled;

  // Editing happens at the end: keep the caret there so the active slot is
  // always the next empty one.
  const toEnd = (el: HTMLInputElement) => {
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  const commit = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next);
    onValueChange?.(next);
    if (next.length === size) onComplete?.(next);
  };

  const active = Math.min(value.length, size - 1);
  const slots = Array.from({ length: size }, (_, i) => i);
  const numeric = pattern === 'numeric';

  return (
    <div
      data-slot="input-otp"
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'group/otp relative inline-flex w-fit items-center gap-2 has-disabled:opacity-60',
        containerClassName,
      )}
    >
      <div aria-hidden="true" className="flex items-center gap-2">
        {slots.map((i) => (
          <React.Fragment key={i}>
            {groupSize && i > 0 && i % groupSize === 0 ? (
              <span data-slot="input-otp-separator" className="h-0.5 w-2 rounded-full bg-border" />
            ) : null}
            <span
              data-slot="input-otp-slot"
              data-active={i === active ? '' : undefined}
              data-filled={i < value.length ? '' : undefined}
              className={cn(
                'relative flex h-10 w-9 items-center justify-center rounded-md border border-input bg-surface font-mono text-lg text-foreground shadow-xs transition-[border-color,box-shadow] pointer-coarse:h-11 pointer-coarse:w-10 dark:bg-surface-raised',
                'group-has-[input[aria-invalid=true]]/otp:border-destructive',
                'group-has-[input:focus]/otp:data-[active]:border-ring group-has-[input:focus]/otp:data-[active]:inset-ring-1 group-has-[input:focus]/otp:data-[active]:inset-ring-ring',
                'group-has-[input[aria-invalid=true]:focus]/otp:data-[active]:inset-ring-destructive',
                'forced-colors:group-has-[input:focus]/otp:data-[active]:[outline:2px_solid_Highlight]!',
              )}
            >
              {value[i] ?? ''}
              {i === active && i === value.length ? (
                <span className="pointer-events-none absolute h-5 w-px bg-foreground opacity-0 group-has-[input:focus]/otp:opacity-100" />
              ) : null}
            </span>
          </React.Fragment>
        ))}
      </div>
      <input
        ref={ref}
        data-slot="input-otp-input"
        type="text"
        autoComplete="one-time-code"
        inputMode={inputMode ?? (numeric ? 'numeric' : 'text')}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        disabled={disabled}
        value={value}
        className={cn(
          'absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent selection:bg-transparent disabled:cursor-not-allowed',
          noOutlineClasses,
          // The slots draw the text; the input still has a box for taps and autofill.
          '[font-size:16px] tracking-[1em]',
          className,
        )}
        onFocus={(event) => {
          onFocus?.(event);
          toEnd(event.currentTarget);
        }}
        onSelect={(event) => {
          onSelect?.(event);
          toEnd(event.currentTarget);
        }}
        onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented) return;
          // A pasted code replaces the field, whatever was typed before it.
          event.preventDefault();
          const next = clean(event.clipboardData.getData('text'));
          if (!next || next === value) return;
          commit(next);
        }}
        onChange={(event) => {
          const next = clean(event.currentTarget.value);
          if (next === value) {
            // Rejected characters: put the field back.
            event.currentTarget.value = value;
            return;
          }
          commit(next);
        }}
        {...props}
      />
    </div>
  );
});

export { InputOTP };
