import { DatePicker, DateRangePicker, Field, FieldGrid } from '@burtson-labs/ui';

const today = new Date();

export default function DatePickerDemo() {
  return (
    <FieldGrid columns={2} className="w-full max-w-xl">
      <Field label="Pickup date" description="Next 60 days.">
        <DatePicker
          width="full"
          min={today}
          max={new Date(today.getFullYear(), today.getMonth(), today.getDate() + 60)}
        />
      </Field>
      <Field label="Out of office">
        <DateRangePicker width="full" />
      </Field>
    </FieldGrid>
  );
}
