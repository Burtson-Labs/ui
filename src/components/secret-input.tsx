import Eye from '@burtson-labs/icons/react/eye';
import EyeOff from '@burtson-labs/icons/react/eye-off';
import * as React from 'react';

import { cn } from '../lib/utils';

import { IconButton } from './icon-button';
import { Input, type InputProps } from './input';

export interface SecretInputProps extends Omit<InputProps, 'type'> {
  /** What is hidden, for the toggle's name ("Show API key"). */
  revealLabel?: string;
}

/**
 * Password-style input with a show/hide toggle, in monospace so keys and
 * tokens read cleanly. The toggle is hidden while the field is disabled.
 */
const SecretInput = React.forwardRef<HTMLInputElement, SecretInputProps>(function SecretInput(
  { className, revealLabel = 'value', disabled, width, ...props },
  ref,
) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div data-slot="secret-input" className={cn('relative', width ? undefined : 'w-full')}>
      <Input
        ref={ref}
        type={revealed && !disabled ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        width={width}
        className={cn('pr-10 font-mono', className)}
        {...props}
      />
      {!disabled && (
        <IconButton
          type="button"
          variant="ghost"
          size="icon-sm"
          label={revealed ? `Hide ${revealLabel}` : `Show ${revealLabel}`}
          aria-pressed={revealed}
          // Inside the field, so it never grows past it on touch screens.
          className="absolute top-1/2 right-1 -translate-y-1/2 pointer-coarse:min-h-8 pointer-coarse:min-w-8"
          onClick={() => setRevealed((r) => !r)}
        >
          {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </IconButton>
      )}
    </div>
  );
});

export { SecretInput };
