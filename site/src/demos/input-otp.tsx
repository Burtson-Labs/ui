import { Field, InputOTP } from '@burtson-labs/ui';

export default function InputOTPDemo() {
  return (
    <div className="grid gap-4">
      <Field label="Verification code" description="Sent to the phone ending 0142.">
        <InputOTP length={6} groupSize={3} />
      </Field>
      <Field label="Recovery code">
        <InputOTP length={4} pattern="alphanumeric" defaultValue="A7" />
      </Field>
    </div>
  );
}
