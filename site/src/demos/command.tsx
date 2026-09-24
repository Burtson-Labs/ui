import FileText from '@burtson-labs/icons/react/file-text';
import Plus from '@burtson-labs/icons/react/plus';
import Settings from '@burtson-labs/icons/react/settings';
import TruckRoute from '@burtson-labs/icons/react/truck-route';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@burtson-labs/ui';

export default function CommandDemo() {
  return (
    <Command className="w-full max-w-md rounded-lg border shadow-md">
      <CommandInput placeholder="Search pages and actions…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>
            <TruckRoute /> Loads
          </CommandItem>
          <CommandItem>
            <FileText /> Documents
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem>
            <Plus /> New load <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings /> Settings <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
