import FileCode from '@burtson-labs/icons/react/file-code';
import MoreHorizontal from '@burtson-labs/icons/react/more-horizontal';
import * as React from 'react';

import { Button, EditorTabs, IconButton, type EditorTab } from '@burtson-labs/ui';

const initial: EditorTab[] = [
  { id: 'src/app.tsx', label: 'app.tsx', description: 'src/app.tsx', icon: <FileCode /> },
  {
    id: 'src/tree.tsx',
    label: 'tree.tsx',
    description: 'src/tree.tsx',
    icon: <FileCode />,
    dirty: true,
  },
  { id: 'README.md', label: 'README.md', description: 'README.md', preview: true },
];

export default function EditorTabsDemo() {
  const [tabs, setTabs] = React.useState(initial);
  const [active, setActive] = React.useState<string | null>('src/app.tsx');
  const [asking, setAsking] = React.useState<string | null>(null);

  const close = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab?.dirty) return setAsking(id);
    remove(id);
  };
  const remove = (id: string) => {
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (active === id) setActive(next[Math.min(i, next.length - 1)]?.id ?? null);
    setAsking(null);
  };
  const move = (id: string, to: number) => {
    const list = tabs.filter((t) => t.id !== id);
    const tab = tabs.find((t) => t.id === id);
    if (tab) list.splice(to, 0, tab);
    setTabs(list);
  };

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-lg border">
      <EditorTabs
        aria-label="Open editors"
        tabs={tabs}
        activeId={active}
        onActiveChange={setActive}
        onClose={close}
        onMove={move}
        actions={
          <IconButton label="More actions" size="icon-sm" variant="ghost">
            <MoreHorizontal />
          </IconButton>
        }
      />
      <div className="flex min-h-24 flex-col justify-center gap-2 bg-background p-4 text-[13px] text-muted-foreground">
        {asking ? (
          <div role="alert" className="flex flex-wrap items-center gap-2">
            <span>Save changes to {asking}?</span>
            <Button size="xs" variant="outline" onClick={() => remove(asking)}>
              Discard
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setAsking(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <span className="font-mono">{active ?? 'No file open'}</span>
        )}
      </div>
    </div>
  );
}
