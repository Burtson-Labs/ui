import Check from '@burtson-labs/icons/react/check';
import ChevronDown from '@burtson-labs/icons/react/chevron-down';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

import { Badge } from './badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface ModelOption {
  /** Stable id your runtime understands, e.g. "claude-sonnet-4". */
  value: string;
  /** Display name. */
  label: string;
  /** Groups the list, e.g. "Anthropic" or "Local". Models without one come first. */
  provider?: string;
  /** A short line under the name. Also searched. */
  description?: string;
  /** Context window in tokens; shown compactly ("200K"). */
  contextWindow?: number;
  /** Short capability tags, e.g. ["Vision", "Tools"]. Also searched. */
  capabilities?: string[];
  /** An icon or provider logo before the name. */
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Why it cannot be picked ("Needs an API key"). Shown in place of the description. */
  disabledReason?: string;
}

const modelPickerLabels = {
  /** Prefix of the trigger's accessible name: "Model: Claude Sonnet". */
  trigger: 'Model',
  placeholder: 'Choose a model',
  search: 'Search models',
  empty: 'No models found.',
  /** After the context size: "200K context". */
  context: 'context',
  unavailable: 'Unavailable',
  /** Read after the chosen model's name in the list. */
  current: 'current',
};

export interface ModelPickerProps {
  models: ModelOption[];
  /** Controlled: the chosen model's value, or null. Leave out for an uncontrolled picker. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** Locale for the context size; defaults to the browser's. */
  locale?: string;
  /** Visible and accessible strings, for translation. */
  labels?: Partial<typeof modelPickerLabels>;
  /** Which side of the trigger the list opens on. It flips when there is no room. */
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  /** Show the context window and capability badges in the list. Default true. */
  showDetails?: boolean;
  id?: string;
  className?: string;
  'aria-describedby'?: string;
}

/** 200000 → "200K", 1048576 → "1M". */
export function formatContextWindow(tokens: number, locale?: string): string {
  if (!Number.isFinite(tokens) || tokens <= 0) return '';
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(
    tokens,
  );
}

function groupByProvider(models: ModelOption[]) {
  const groups = new Map<string, ModelOption[]>();
  for (const m of models) {
    const key = m.provider ?? '';
    const list = groups.get(key);
    if (list) list.push(m);
    else groups.set(key, [m]);
  }
  // Ungrouped models first, then providers in the order they first appear.
  return [...groups.entries()].sort(([a], [b]) => (a === '' ? -1 : b === '' ? 1 : 0));
}

/**
 * A searchable model selector for a Composer's `actions` slot or a chat
 * header: models grouped by provider, with optional context size and
 * capability badges. Models that cannot be used stay listed, disabled, with
 * the reason. The ref reaches the trigger button.
 */
const ModelPicker = React.forwardRef<HTMLButtonElement, ModelPickerProps>(function ModelPicker(
  {
    models,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    disabled,
    locale,
    labels,
    side = 'bottom',
    align = 'start',
    showDetails = true,
    id,
    className,
    'aria-describedby': describedBy,
  },
  ref,
) {
  const l = { ...modelPickerLabels, ...labels };
  const [open, setOpen] = React.useState(false);
  const [own, setOwn] = React.useState<string | null>(defaultValue);
  const value = valueProp === undefined ? own : valueProp;
  const selected = models.find((m) => m.value === value);
  const listId = React.useId();
  const groups = React.useMemo(() => groupByProvider(models), [models]);
  const choose = (next: string) => {
    if (valueProp === undefined) setOwn(next);
    if (next !== value) onValueChange?.(next);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          id={id}
          type="button"
          data-slot="model-picker-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`${l.trigger}: ${selected?.label ?? l.placeholder}`}
          aria-describedby={describedBy}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            'inline-flex h-8 max-w-56 min-w-0 items-center gap-1.5 rounded-md border border-transparent px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-muted aria-expanded:text-foreground pointer-coarse:min-h-11',
            focusRingClasses,
            className,
          )}
        >
          {selected?.icon && (
            <span aria-hidden className="grid shrink-0 place-items-center [&_svg]:size-4">
              {selected.icon}
            </span>
          )}
          <span className="truncate">{selected?.label ?? l.placeholder}</span>
          <ChevronDown aria-hidden className="size-3.5 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        id={listId}
        aria-label={l.search}
        side={side}
        align={align}
        className="w-80 p-0"
      >
        {/* Opens with the current model highlighted. */}
        <Command defaultValue={value ?? undefined}>
          <CommandInput aria-label={l.search} placeholder={`${l.search}…`} />
          <CommandList>
            <CommandEmpty>{l.empty}</CommandEmpty>
            {groups.map(([provider, list]) => (
              <CommandGroup key={provider || '_'} heading={provider || undefined}>
                {list.map((m) => {
                  const context =
                    m.contextWindow !== undefined
                      ? formatContextWindow(m.contextWindow, locale)
                      : '';
                  const note = m.disabled ? (m.disabledReason ?? l.unavailable) : m.description;
                  return (
                    <CommandItem
                      key={m.value}
                      value={m.value}
                      keywords={[
                        m.label,
                        m.provider ?? '',
                        m.description ?? '',
                        ...(m.capabilities ?? []),
                      ]}
                      disabled={m.disabled}
                      data-slot="model-picker-item"
                      onSelect={() => choose(m.value)}
                      className="items-start gap-2.5 py-1.5 data-[disabled=true]:opacity-100"
                    >
                      {m.icon && (
                        <span
                          aria-hidden
                          className={cn(
                            'mt-0.5 grid shrink-0 place-items-center [&_svg]:size-4',
                            m.disabled && 'opacity-50',
                          )}
                        >
                          {m.icon}
                        </span>
                      )}
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span
                          className={cn(
                            'flex min-w-0 items-center gap-1.5',
                            m.disabled && 'text-muted-foreground',
                          )}
                        >
                          <span className="truncate font-medium">
                            {m.label}
                            {m.value === value && <span className="sr-only">, {l.current}</span>}
                          </span>
                          {showDetails && context && (
                            <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                              {context} {l.context}
                            </span>
                          )}
                        </span>
                        {note && (
                          <span
                            className={cn(
                              'text-xs leading-4 text-muted-foreground',
                              !m.disabled && 'truncate',
                            )}
                          >
                            {note}
                          </span>
                        )}
                        {showDetails && !!m.capabilities?.length && (
                          <span className="flex flex-wrap gap-1 pt-0.5">
                            {m.capabilities.map((c) => (
                              <Badge key={c} variant="outline" className="px-1.5 py-0 text-[10px]">
                                {c}
                              </Badge>
                            ))}
                          </span>
                        )}
                      </span>
                      <Check
                        aria-hidden
                        className={cn(
                          'mt-0.5 size-4 text-brand',
                          m.value === value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});

export { ModelPicker };
