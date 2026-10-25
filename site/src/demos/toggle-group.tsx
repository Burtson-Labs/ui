import Bold from '@burtson-labs/icons/react/bold';
import Italic from '@burtson-labs/icons/react/italic';
import LayoutGrid from '@burtson-labs/icons/react/layout-grid';
import List from '@burtson-labs/icons/react/list';
import * as React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@burtson-labs/ui';

export default function ToggleGroupDemo() {
  const [view, setView] = React.useState('list');
  return (
    <div className="grid gap-4">
      <ToggleGroup
        type="single"
        aria-label="View"
        variant="outline"
        value={view}
        onValueChange={setView}
      >
        <ToggleGroupItem value="list">
          <List />
          List
        </ToggleGroupItem>
        <ToggleGroupItem value="grid">
          <LayoutGrid />
          Grid
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="multiple" aria-label="Text style" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
