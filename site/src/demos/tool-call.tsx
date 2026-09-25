import * as React from 'react';

import { ToolApproval, ToolCall } from '@burtson-labs/ui';

export default function ToolCallDemo() {
  const [state, setState] = React.useState<'pending' | 'approved' | 'denied'>('pending');
  return (
    <div className="grid w-full max-w-xl gap-2">
      <ToolCall
        name="read_file"
        status="success"
        durationMs={80}
        args={{ path: 'src/index.ts' }}
        result="export * from './components/button';"
      />
      <ToolCall name="run_tests" status="running" args={{ filter: 'components' }} />
      <ToolCall
        name="git_push"
        status="error"
        durationMs={1200}
        args={{ branch: 'main' }}
        error="Rejected: the branch is protected."
        defaultOpen
      />
      <ToolApproval
        name="delete_branch"
        description="Delete the remote branch ui-scaffold? This cannot be undone."
        args={{ branch: 'ui-scaffold' }}
        state={state}
        onApprove={() => setState('approved')}
        onDeny={() => setState('denied')}
      />
    </div>
  );
}
