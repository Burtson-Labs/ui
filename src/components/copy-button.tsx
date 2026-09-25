import Check from '@burtson-labs/icons/react/check';
import Copy from '@burtson-labs/icons/react/copy';
import * as React from 'react';

import { IconButton, type IconButtonProps } from './icon-button';
import { toast } from './toaster';

export interface CopyButtonProps extends Omit<IconButtonProps, 'label' | 'children' | 'onClick'> {
  /** The text to put on the clipboard. */
  value: string;
  /** Accessible name, e.g. "Copy API key". */
  label?: string;
}

/**
 * Icon button that copies `value` and shows a check for a moment. When the
 * browser blocks the clipboard it raises a toast (needs a mounted Toaster)
 * asking the person to copy by hand.
 */
function CopyButton({
  value,
  label = 'Copy',
  variant = 'ghost',
  size = 'icon-sm',
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({
        title: 'Copy blocked by the browser',
        description: 'Select the text and copy it by hand.',
        variant: 'destructive',
      });
    }
  };

  return (
    <IconButton
      data-slot="copy-button"
      label={copied ? 'Copied' : label}
      variant={variant}
      size={size}
      onClick={() => void copy()}
      {...props}
    >
      {copied ? <Check aria-hidden className="text-success" /> : <Copy aria-hidden />}
    </IconButton>
  );
}

export { CopyButton };
