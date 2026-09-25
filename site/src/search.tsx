import Search from '@burtson-labs/icons/react/search';
import * as React from 'react';

import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  shortcutLabel,
} from '@burtson-labs/ui';

import { components } from './docs';
import { navigate } from './router';

export function DocsSearch() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, []);
  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Search documentation"
        aria-keyshortcuts="Control+k Meta+k"
        className="gap-2 text-muted-foreground"
      >
        <Search aria-hidden />
        <span className="hidden sm:inline">Search docs</span>
        <Kbd className="hidden md:inline">{shortcutLabel('k')}</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search documentation"
        description="Find a component or guide. Use arrow keys to navigate and Enter to open."
      >
        <CommandInput
          placeholder="Search components and guides…"
          aria-label="Search components and guides"
        />
        <CommandList>
          <CommandEmpty>No matches. Try “button”, “chat”, or “theme”.</CommandEmpty>
          <CommandGroup heading="Guides">
            {['Installation', 'Theming', 'Using with MUI'].map((title, i) => (
              <CommandItem
                key={title}
                onSelect={() => go(['/docs/installation', '/docs/theming', '/docs/mui'][i]!)}
              >
                {title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Components">
            {components.map((component) => (
              <CommandItem
                key={component.name}
                value={`${component.title} ${component.description}`}
                onSelect={() => go(`/docs/components/${component.name}`)}
              >
                <span className="grid gap-1">
                  <span>{component.title}</span>
                  <span className="text-xs text-muted-foreground">{component.description}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
