import * as React from 'react';

import { Calendar } from '@burtson-labs/ui';

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | null>(null);
  return (
    <div className="grid justify-items-start gap-2">
      <Calendar
        selected={date}
        onSelect={setDate}
        disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
        className="rounded-lg border bg-surface"
      />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {date ? `Chosen: ${date.toDateString()}` : 'Weekdays only.'}
      </p>
    </div>
  );
}
