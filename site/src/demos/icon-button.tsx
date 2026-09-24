import Copy from '@burtson-labs/icons/react/copy';
import GitBranch from '@burtson-labs/icons/react/git-branch';
import Settings from '@burtson-labs/icons/react/settings';
import Terminal from '@burtson-labs/icons/react/terminal';

import { IconButton } from '@burtson-labs/ui';

export default function IconButtonDemo() {
  return (
    <div className="flex items-center gap-1">
      <IconButton label="Open terminal" variant="ghost">
        <Terminal />
      </IconButton>
      <IconButton label="Source control" variant="ghost">
        <GitBranch />
      </IconButton>
      <IconButton label="Copy run ID" variant="outline" size="icon-sm">
        <Copy />
      </IconButton>
      <IconButton label="Settings" variant="soft">
        <Settings />
      </IconButton>
    </div>
  );
}
