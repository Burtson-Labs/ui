import * as React from 'react';

import { Composer, ModelPicker, type ModelOption } from '@burtson-labs/ui';

const models: ModelOption[] = [
  {
    value: 'claude-sonnet',
    label: 'Claude Sonnet',
    provider: 'Anthropic',
    description: 'Balanced speed and depth',
    contextWindow: 200_000,
    capabilities: ['Vision', 'Tools'],
  },
  {
    value: 'claude-opus',
    label: 'Claude Opus',
    provider: 'Anthropic',
    description: 'Hardest problems, long tasks',
    contextWindow: 200_000,
    capabilities: ['Vision', 'Tools'],
  },
  {
    value: 'gpt-large',
    label: 'GPT Large',
    provider: 'OpenAI',
    contextWindow: 128_000,
    capabilities: ['Tools'],
    disabled: true,
    disabledReason: 'Add an OpenAI API key in Settings to use this model.',
  },
  {
    value: 'qwen-27b',
    label: 'Qwen 27B',
    provider: 'Local (Ollama)',
    description: 'Runs on this machine; nothing leaves it',
    contextWindow: 32_768,
  },
];

export default function ModelPickerDemo() {
  const [model, setModel] = React.useState<string | null>('claude-sonnet');
  const [sent, setSent] = React.useState('');
  const label = models.find((m) => m.value === model)?.label;
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Composer
        onSubmit={(text) => setSent(`${text} → ${label}`)}
        actions={<ModelPicker models={models} value={model} onValueChange={setModel} />}
      />
      {sent && <p className="text-xs text-muted-foreground">Sent: {sent}</p>}
    </div>
  );
}
