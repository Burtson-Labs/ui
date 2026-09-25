import * as React from 'react';

import { ChatHistory, type ChatHistoryItem } from '@burtson-labs/ui';

const day = 24 * 60 * 60 * 1000;
const seed = (): ChatHistoryItem[] => [
  { id: '1', title: 'Fuel surcharge for next week', updatedAt: Date.now() - 20 * 60 * 1000 },
  { id: '2', title: 'Why was L-8131 late?', updatedAt: Date.now() - 3 * 60 * 60 * 1000 },
  { id: '3', title: 'Detention at Phillips 66', updatedAt: Date.now() - day },
  { id: '4', title: 'IFTA Q3 miles by state', updatedAt: Date.now() - 4 * day },
  { id: '5', title: 'Driver onboarding checklist', updatedAt: Date.now() - 20 * day },
  { id: '6', title: 'Dispatch runbook', updatedAt: Date.now() - 40 * day, pinned: true },
];

export default function ChatHistoryDemo() {
  const [items, setItems] = React.useState(seed);
  const [active, setActive] = React.useState('1');
  return (
    <div className="h-96 w-full max-w-xs overflow-hidden rounded-lg border bg-surface-muted/50">
      <ChatHistory
        items={items}
        activeId={active}
        onSelect={setActive}
        onNewChat={() => {
          const id = String(Date.now());
          setItems((x) => [{ id, title: 'New chat', updatedAt: Date.now() }, ...x]);
          setActive(id);
        }}
        onRename={(id, title) => setItems((x) => x.map((i) => (i.id === id ? { ...i, title } : i)))}
        onPinChange={(id, pinned) =>
          setItems((x) => x.map((i) => (i.id === id ? { ...i, pinned } : i)))
        }
        onDelete={(id) => setItems((x) => x.filter((i) => i.id !== id))}
      />
    </div>
  );
}
