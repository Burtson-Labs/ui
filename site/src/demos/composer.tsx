import Paperclip from '@burtson-labs/icons/react/paperclip';
import * as React from 'react';

import { Badge, Composer, IconButton, Suggestions } from '@burtson-labs/ui';

export default function ComposerDemo() {
  const [sent, setSent] = React.useState<string[]>([]);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Suggestions
        items={['Summarize today’s runs', 'Why did the build fail?']}
        onSelect={(s) => setSent((x) => [...x, s])}
      />
      <Composer
        onSubmit={(t) => setSent((x) => [...x, t])}
        attachments={<Badge variant="outline">build-4821.log</Badge>}
        actions={
          <IconButton label="Attach a file" variant="ghost" size="icon-sm">
            <Paperclip />
          </IconButton>
        }
      />
      {sent.length > 0 && <p className="text-xs text-muted-foreground">Sent: {sent.join(' · ')}</p>}
    </div>
  );
}
