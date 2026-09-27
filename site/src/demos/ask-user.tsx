import * as React from 'react';

import { AskUser, Button, type AskUserAnswers } from '@burtson-labs/ui';

export default function AskUserDemo() {
  const [answer, setAnswer] = React.useState<AskUserAnswers | null>(null);
  const [request, setRequest] = React.useState(0);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <AskUser
        key={request}
        title="How should I build the export?"
        description="A couple of choices before I prepare the report."
        questions={[
          {
            id: 'format',
            prompt: 'Which format works best?',
            options: [
              { value: 'csv', label: 'CSV', description: 'Open and filter it in a spreadsheet.' },
              { value: 'pdf', label: 'PDF', description: 'A formatted report ready to share.' },
            ],
            allowCustom: true,
          },
          {
            id: 'include',
            prompt: 'What should I include?',
            multiple: true,
            options: [
              { value: 'summary', label: 'Summary' },
              { value: 'details', label: 'Individual records' },
            ],
            required: false,
          },
        ]}
        onSubmit={(answers) => {
          setAnswer(answers);
        }}
      />
      {answer && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Selected: {answer.format?.text || answer.format?.selected.join(', ')}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAnswer(null);
              setRequest((n) => n + 1);
            }}
          >
            Ask again
          </Button>
        </div>
      )}
    </div>
  );
}
