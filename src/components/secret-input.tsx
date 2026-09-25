import Eye from '@burtson-labs/icons/react/eye';
import EyeOff from '@burtson-labs/icons/react/eye-off';
import * as React from 'react';

import { cn } from '../lib/utils';

import { IconButton } from './icon-button';
import { Input } from './input';

export interface SecretInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  /** What is hidden, for the toggle's name ("Show API key"). */
  revealLabel?: string;
}

/**
 * Password-style input with a show/hide toggle, in monospace so keys and
 * tokens read cleanly. The toggle is hidden while the field is disabled.
 */
function SecretInput({ className, revealLabel = 'value', disabled, ...props }: SecretInputProps) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <div data-slot="secret-input" className="relative">
      <Input
        type={revealed && !disabled ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
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
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setRevealed((r) => !r)}
        >
          {revealed ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
        </IconButton>
      )}
    </div>
  );
}

export { SecretInput };
