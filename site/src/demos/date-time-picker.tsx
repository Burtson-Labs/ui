import * as React from 'react';

import { DateTimePicker, Field } from '@burtson-labs/ui';

export default function DateTimePickerDemo() {
  const [value, setValue] = React.useState<Date | null>(null);
  const today = new Date();
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Field label="Appointment" description="Weekdays, from tomorrow.">
        <DateTimePicker
          width="full"
          value={value}
          onValueChange={setValue}
          min={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0)}
          disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6}
          slots
          step={30}
          name="appointment"
        />
      </Field>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {value
          ? `Booked: ${new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'short' }).format(value)}`
          : 'Choose a day and a time.'}
      </p>
    </div>
  );
}
