import Copy from '@burtson-labs/icons/react/copy';

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@burtson-labs/ui';

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Copy">
          <Copy />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  );
}
