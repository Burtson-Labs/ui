import * as React from 'react';

import {
  ArtifactPanel,
  Button,
  CodeBlock,
  Composer,
  Conversation,
  CopyButton,
  Message,
  useNarrowerThan,
} from '@burtson-labs/ui';

const code = `export function surcharge(dieselPrice: number): number {
  // $0.01/mi for every 6¢ over the $3.25 base
  const over = Math.max(0, dieselPrice - 3.25);
  return Math.round((over / 0.06) * 100) / 10000;
}`;

export default function ArtifactPanelDemo() {
  // Side by side on wide screens; on smaller ones the panel is a sheet, so it waits for Open.
  const narrow = useNarrowerThan('lg');
  const [open, setOpen] = React.useState(!narrow);
  return (
    <div className="h-[30rem] w-full overflow-hidden rounded-lg border">
      <ArtifactPanel
        open={open}
        onOpenChange={setOpen}
        title="surcharge.ts"
        description="Version 2 · TypeScript"
        actions={
          <CopyButton value={code} label="Copy surcharge.ts" className="pointer-coarse:size-11" />
        }
        artifact={<CodeBlock code={code} lang="ts" className="m-3 border-0" />}
      >
        <Conversation className="flex-1">
          <Message from="user">Write the surcharge function for the new table.</Message>
          <Message from="assistant" name="Assistant">
            <div className="grid justify-items-start gap-2">
              Here it is: one cent per mile for every 6¢ over the base price.
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpen(true)}
                aria-expanded={open}
              >
                Open surcharge.ts
              </Button>
            </div>
          </Message>
        </Conversation>
        <div className="p-3">
          <Composer onSubmit={() => undefined} />
        </div>
      </ArtifactPanel>
    </div>
  );
}
