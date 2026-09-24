import Download from '@burtson-labs/icons/react/download';
import Filter from '@burtson-labs/icons/react/filter';
import Plus from '@burtson-labs/icons/react/plus';
import RotateCw from '@burtson-labs/icons/react/rotate-cw';
import Search from '@burtson-labs/icons/react/search';

import {
  Button,
  IconButton,
  Input,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarSpacer,
} from '@burtson-labs/ui';

export default function ToolbarDemo() {
  return (
    <Toolbar aria-label="Runs" className="w-full max-w-3xl">
      <ToolbarGroup className="relative">
        <Search className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
        <Input aria-label="Search runs" placeholder="Search runs" className="h-8 w-56 pl-8" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <Button variant="ghost" size="sm">
          <Filter /> Status
        </Button>
        <Button variant="ghost" size="sm">
          Agent
        </Button>
      </ToolbarGroup>
      <ToolbarSpacer />
      <ToolbarGroup>
        <IconButton label="Refresh" variant="ghost" size="icon-sm">
          <RotateCw />
        </IconButton>
        <IconButton label="Export" variant="ghost" size="icon-sm">
          <Download />
        </IconButton>
        <Button size="sm">
          <Plus /> New run
        </Button>
      </ToolbarGroup>
    </Toolbar>
  );
}
