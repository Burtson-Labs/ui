// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
'use client';
export {
  createCheckboxScope,
  //
  Checkbox,
  CheckboxProvider as unstable_CheckboxProvider,
  CheckboxTrigger as unstable_CheckboxTrigger,
  CheckboxIndicator,
  CheckboxBubbleInput as unstable_CheckboxBubbleInput,
  //
  Root,
  Provider as unstable_Provider,
  Trigger as unstable_Trigger,
  Indicator,
  BubbleInput as unstable_BubbleInput,
} from './checkbox';
export type {
  CheckboxProps,
  CheckboxProviderProps as unstable_CheckboxProviderProps,
  CheckboxTriggerProps as unstable_CheckboxTriggerProps,
  CheckboxIndicatorProps,
  CheckboxBubbleInputProps as unstable_CheckboxBubbleInputProps,
  CheckedState,
} from './checkbox';
