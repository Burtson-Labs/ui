import Check from '@burtson-labs/icons/react/check';
import ChevronsUpDown from '@burtson-labs/icons/react/chevrons-up-down';
import * as React from 'react';

import { cn } from '../lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { fieldClasses } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Spinner } from './spinner';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line, e.g. an email under a name. Also searched. */
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Show a spinner in the list, e.g. while `onSearchChange` fetches. */
  loading?: boolean;
  /**
   * Called as the person types. Pass it to search on a server; the options
   * you pass back are shown as-is (no client filtering).
   */
  onSearchChange?: (search: string) => void;
  /** Let the person clear the selection by picking it again. */
  clearable?: boolean;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean;
}

/** Pick one value from a long or remote list by typing. */
function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No matches.',
  disabled,
  loading,
  onSearchChange,
  clearable = true,
  id,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listId = React.useId();
  const selected = options.find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-invalid={aria['aria-invalid']}
          disabled={disabled}
          data-slot="combobox-trigger"
          className={cn(
            fieldClasses,
            'flex h-9 items-center justify-between gap-2 text-left',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{selected?.label ?? value ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        className="w-(--radix-popover-trigger-width) min-w-64 p-0"
        align="start"
      >
        <Command shouldFilter={!onSearchChange}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchChange} />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Spinner /> Searching…
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {!loading && (
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={`${o.label} ${o.description ?? ''} ${o.value}`}
                    disabled={o.disabled}
                    onSelect={() => {
                      onValueChange(clearable && o.value === value ? null : o.value);
                      setOpen(false);
                    }}
                  >
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate">{o.label}</span>
                      {o.description && (
                        <span className="truncate text-xs text-muted-foreground">
                          {o.description}
                        </span>
                      )}
                    </span>
                    <Check
                      aria-hidden
                      className={cn(
                        'ml-auto size-4 text-brand',
                        o.value === value ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { Combobox };
