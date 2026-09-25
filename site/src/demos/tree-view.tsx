import FileCode from '@burtson-labs/icons/react/file-code';
import FileText from '@burtson-labs/icons/react/file-text';
import Folder from '@burtson-labs/icons/react/folder';
import * as React from 'react';

import { TreeView, type TreeNode } from '@burtson-labs/ui';

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder />,
    children: [
      {
        id: 'src/components',
        label: 'components',
        icon: <Folder />,
        children: [
          { id: 'src/components/button.tsx', label: 'button.tsx', icon: <FileCode /> },
          {
            id: 'src/components/tree-view.tsx',
            label: 'tree-view.tsx',
            icon: <FileCode />,
            meta: 'M',
          },
        ],
      },
      { id: 'src/index.ts', label: 'index.ts', icon: <FileCode /> },
    ],
  },
  { id: 'test', label: 'test', icon: <Folder />, hasChildren: true },
  { id: 'package.json', label: 'package.json', icon: <FileText /> },
  { id: 'README.md', label: 'README.md', icon: <FileText /> },
];

export default function TreeViewDemo() {
  const [expanded, setExpanded] = React.useState(['src', 'src/components']);
  const [selected, setSelected] = React.useState(['src/components/tree-view.tsx']);
  const [opened, setOpened] = React.useState('src/components/tree-view.tsx');
  return (
    <div className="w-full max-w-xs">
      <TreeView
        aria-label="Files"
        className="rounded-lg border bg-surface px-1"
        nodes={nodes}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelectedChange={setSelected}
        selectionMode="multiple"
        onAction={setOpened}
      />
      <p className="mt-2 truncate text-xs text-muted-foreground">Opened: {opened}</p>
    </div>
  );
}
