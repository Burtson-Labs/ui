import { Label, RadioGroup, RadioGroupItem } from '@burtson-labs/ui';

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="ollama" aria-label="Provider">
      <Label>
        <RadioGroupItem value="ollama" /> Ollama (local)
      </Label>
      <Label>
        <RadioGroupItem value="bandit" /> Bandit Cloud
      </Label>
      <Label>
        <RadioGroupItem value="openai-compatible" /> OpenAI-compatible
      </Label>
    </RadioGroup>
  );
}
