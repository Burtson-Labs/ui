import Folder from '@burtson-labs/icons/react/folder';
import History from '@burtson-labs/icons/react/history';
import MessageSquare from '@burtson-labs/icons/react/message-square';
import * as React from 'react';

import { MobileNav } from '@burtson-labs/ui';

export default function MobileNavDemo() {
  const [value, setValue] = React.useState('chat');
  // In an app, position="fixed" pins it to the bottom of the screen.
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border">
      <div className="grid h-40 place-items-center bg-surface-muted text-sm text-muted-foreground">
        {value === 'chat' ? 'Chat' : value === 'history' ? 'History' : 'Projects'}
      </div>
      <MobileNav
        value={value}
        onValueChange={(id) => setValue(id)}
        items={[
          { id: 'chat', label: 'Chat', icon: <MessageSquare /> },
          { id: 'history', label: 'History', icon: <History />, badge: 2 },
          { id: 'projects', label: 'Projects', icon: <Folder /> },
        ]}
      />
    </div>
  );
}
