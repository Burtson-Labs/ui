import ChevronDown from '@burtson-labs/icons/react/chevron-down';

import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@burtson-labs/ui';

export default function CollapsibleDemo() {
  return (
    <Collapsible defaultOpen className="w-64 rounded-lg border p-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between [&[data-state=open]>svg]:rotate-180"
        >
          DNS <ChevronDown className="transition-transform" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="grid gap-1 pt-1 pl-3 text-sm">
        <span className="rounded-md bg-accent px-2 py-1.5 text-accent-foreground">Records</span>
        <span className="px-2 py-1.5 text-muted-foreground">Analytics</span>
        <span className="px-2 py-1.5 text-muted-foreground">Settings</span>
      </CollapsibleContent>
    </Collapsible>
  );
}
