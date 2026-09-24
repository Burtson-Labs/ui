import GitBranch from '@burtson-labs/icons/react/git-branch';
import LogOut from '@burtson-labs/icons/react/log-out';
import Settings from '@burtson-labs/icons/react/settings';
import User from '@burtson-labs/icons/react/user';

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@burtson-labs/ui';

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <User /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <GitBranch /> Switch branch
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem defaultChecked>Auto-approve reads</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
