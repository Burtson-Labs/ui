import * as React from 'react';

import { Badge, NativeSelect, ThemeToggle, useTheme, type ThemePreference } from '@burtson-labs/ui';

export default function ThemeProviderDemo() {
  const id = React.useId();
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div className="flex w-full max-w-sm flex-wrap items-end gap-3">
      <div className="grid min-w-40 flex-1 gap-2 text-sm">
        <label htmlFor={id}>Theme preference</label>
        <NativeSelect
          id={id}
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemePreference)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </NativeSelect>
      </div>
      <ThemeToggle />
      <Badge variant="secondary">{resolvedTheme}</Badge>
    </div>
  );
}
