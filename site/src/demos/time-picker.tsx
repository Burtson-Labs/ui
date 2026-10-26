import { Field, FieldGrid, TimePicker } from '@burtson-labs/ui';

export default function TimePickerDemo() {
  return (
    <FieldGrid columns={2} className="w-full max-w-xl">
      <Field label="Pickup time" description="Every 15 minutes, 8 AM to 6 PM.">
        <TimePicker slots step={15} min="08:00" max="18:00" defaultValue="09:30" name="pickup" />
      </Field>
      <Field label="Departure (24-hour)">
        <TimePicker hourCycle={24} seconds defaultValue="17:45:00" />
      </Field>
    </FieldGrid>
  );
}
