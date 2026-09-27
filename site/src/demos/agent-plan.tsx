import * as React from 'react';

import { AgentPlan, Button } from '@burtson-labs/ui';

export default function AgentPlanDemo() {
  const [state, setState] = React.useState<'proposed' | 'approved' | 'rejected'>('proposed');
  return (
    <div className="grid w-full max-w-xl gap-3">
      <AgentPlan
        title="Prepare the weekly report"
        state={state}
        summary="Review these steps before the agent starts."
        steps={[
          {
            id: 'read',
            title: 'Read the selected records',
            description: 'Use this week’s completed runs.',
          },
          {
            id: 'draft',
            title: 'Draft a summary',
            description: 'Include totals and flag missing data.',
          },
          {
            id: 'review',
            title: 'Bring the draft back for review',
            description: 'Wait for your approval before sharing.',
          },
        ]}
        onApprove={() => setState('approved')}
        onRevise={() => setState('rejected')}
      />
      {state !== 'proposed' && (
        <Button variant="outline" onClick={() => setState('proposed')}>
          Review again
        </Button>
      )}
    </div>
  );
}
