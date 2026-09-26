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
import { fieldClasses, type FieldWidth, fieldWidthClasses } from './input';
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
  /** Controlled: the chosen value, or null. Leave out for an uncontrolled combobox. */
  value?: string | null;
  /** The starting value when uncontrolled. */
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
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
  /** How wide the trigger is from 640px up; full width on phones. */
  width?: FieldWidth;
  id?: string;
  className?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  name?: string;
  required?: boolean;
}

/**
 * Pick one value from a long or remote list by typing. The ref reaches the
 * trigger button, so a form library or an ErrorSummary can focus it.
 */
const Combobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(function Combobox(
  {
    options,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText = 'No matches.',
    disabled,
    loading,
    onSearchChange,
    clearable = true,
    width,
    id,
    className,
    name,
    required,
    ...aria
  },
  ref,
) {
  const [open, setOpen] = React.useState(false);
  const [own, setOwn] = React.useState<string | null>(defaultValue);
  const value = valueProp === undefined ? own : valueProp;
  const setValue = (next: string | null) => {
    if (valueProp === undefined) setOwn(next);
    onValueChange?.(next);
  };
  const listId = React.useId();
  const selected = options.find((o) => o.value === value);
  return (
    <>
      {name && <input type="hidden" name={name} value={value ?? ''} disabled={disabled} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-required={aria['aria-required'] ?? (required || undefined)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setOpen(true);
              }
            }}
            id={id}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={open ? listId : undefined}
            aria-label={
              aria['aria-label'] ?? (aria['aria-labelledby'] || id ? undefined : placeholder)
            }
            aria-labelledby={aria['aria-labelledby']}
            aria-describedby={aria['aria-describedby']}
            data-required={required || undefined}
            aria-invalid={aria['aria-invalid']}
            disabled={disabled}
            data-slot="combobox-trigger"
            className={cn(
              fieldClasses,
              'flex h-9 items-center justify-between gap-2 text-left',
              !selected && 'text-muted-foreground',
              width && fieldWidthClasses[width],
              className,
            )}
          >
            <span className="truncate">{selected?.label ?? value ?? placeholder}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={listId}
          aria-label={aria['aria-label'] ?? placeholder}
          className="w-(--radix-popover-trigger-width) min-w-64 p-0"
          align="start"
        >
          <Command shouldFilter={!onSearchChange}>
            <CommandInput
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              onValueChange={onSearchChange}
            />
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
                        setValue(clearable && o.value === value ? null : o.value);
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
    </>
  );
});

export { Combobox };
