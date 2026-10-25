import Bold from '@burtson-labs/icons/react/bold';
import Pin from '@burtson-labs/icons/react/pin';

import { Toggle } from '@burtson-labs/ui';

export default function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle aria-label="Bold">
        <Bold />
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        <Pin />
        Pinned
      </Toggle>
      <Toggle size="sm" disabled>
        Archived
      </Toggle>
    </div>
  );
}
