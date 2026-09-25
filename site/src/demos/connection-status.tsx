import * as React from 'react';

import {
  Button,
  ConnectionBanner,
  ConnectionStatus,
  SyncStatus,
  type ConnectionState,
} from '@burtson-labs/ui';

const states: ConnectionState[] = ['connected', 'reconnecting', 'offline', 'error', 'unknown'];

export default function ConnectionStatusDemo() {
  const [state, setState] = React.useState<ConnectionState>('connected');
  return (
    <div className="grid w-full max-w-xl gap-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Example state">
        {states.map((s) => (
          <Button
            key={s}
            size="xs"
            variant={s === state ? 'default' : 'outline'}
            aria-pressed={s === state}
            onClick={() => setState(s)}
          >
            {s}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <ConnectionStatus
          state={state}
          detail="Ollama at localhost:11434"
          onRetry={() => setState('connected')}
        />
        <SyncStatus
          state={state === 'connected' ? 'synced' : state === 'unknown' ? 'unknown' : 'pending'}
          lastSynced={new Date(2026, 8, 25, 9, 41)}
          pendingCount={3}
        />
      </div>
      <ConnectionBanner
        state={state}
        description="Messages you send now will go out when the connection is back."
        onRetry={() => setState('connected')}
      />
    </div>
  );
}
