import * as React from 'react';

import { AgentRun, type AgentRunState, Button, ToolApproval, ToolCall } from '@burtson-labs/ui';

export default function AgentRunDemo() {
  const [state, setState] = React.useState<AgentRunState>('waiting');
  React.useEffect(() => {
    if (state !== 'running') return;
    const timer = window.setTimeout(() => setState('completed'), 4000);
    return () => window.clearTimeout(timer);
  }, [state]);
  return (
    <div className="w-full max-w-xl">
      <AgentRun
        title="Review a workspace change"
        state={state}
        summary={
          state === 'waiting'
            ? 'The change is ready. Review the next action before the agent continues.'
            : state === 'completed'
              ? 'Example run complete. All checks passed.'
              : state === 'paused'
                ? 'Execution is paused. Resume when you are ready.'
                : state === 'canceled'
                  ? 'This example was canceled. No further steps will run.'
                  : 'Running the example checks…'
        }
        steps={[
          {
            id: 'context',
            label: 'Read project context',
            state: 'completed',
            detail: 'README.md · src/auth/session.ts',
          },
          {
            id: 'edit',
            label: 'Prepare the change',
            state: 'completed',
            detail: '1 file changed · +4 / −2 lines',
          },
          {
            id: 'verify',
            label: 'Verify the change',
            state,
            detail: state === 'completed' ? '12 checks passed' : 'npm test -- session',
          },
        ]}
        onPause={() => setState('paused')}
        onResume={() => setState('running')}
        onCancel={state === 'waiting' ? undefined : () => setState('canceled')}
      >
        {state === 'waiting' && (
          <ToolApproval
            name="run_tests"
            description="Run the session tests for this change?"
            args="npm test -- session"
            approveLabel="Run checks"
            denyLabel="Cancel run"
            onApprove={() => setState('running')}
            onDeny={() => setState('canceled')}
          />
        )}
        {state === 'running' && (
          <ToolCall name="run_tests" status="running" args="npm test -- session" />
        )}
        {(state === 'completed' || state === 'canceled') && (
          <Button variant="outline" size="sm" onClick={() => setState('waiting')}>
            Reset example
          </Button>
        )}
      </AgentRun>
      <p className="mt-3 text-xs text-muted-foreground">
        Interactive example · sample data · nothing is executed.
      </p>
    </div>
  );
}
