import { Label, RadioCard, RadioGroup, RadioGroupItem } from '@burtson-labs/ui';

export default function RadioGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <RadioGroup defaultValue="local" aria-label="Where models run">
        <Label>
          <RadioGroupItem value="local" /> Local (Ollama)
        </Label>
        <Label>
          <RadioGroupItem value="cloud" /> Cloud provider
        </Label>
        <Label>
          <RadioGroupItem value="both" disabled /> Both (coming soon)
        </Label>
      </RadioGroup>
      {/* Cards, for choices that need a sentence each. */}
      <RadioGroup defaultValue="team" aria-label="Plan" className="gap-2">
        <RadioCard value="starter" title="Starter" description="Up to 5 loads a week, one seat." />
        <RadioCard
          value="team"
          title="Team"
          description="Unlimited loads, three seats, audit log."
        />
        <RadioCard
          value="enterprise"
          title="Enterprise"
          description="SSO, SLA and a named contact."
        />
      </RadioGroup>
    </div>
  );
}
