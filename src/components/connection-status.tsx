import CloudOff from '@burtson-labs/icons/react/cloud-off';
import WifiOff from '@burtson-labs/icons/react/wifi-off';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';
import { Status } from './status';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

/**
 * The host reports the state; these components only present it. `unknown`
 * means nobody has checked yet and never reads as connected.
 */
export type ConnectionState =
  'connected' | 'connecting' | 'reconnecting' | 'offline' | 'error' | 'unknown';

const connection: Record<ConnectionState, { text: string; tone: Tone; pulse?: boolean }> = {
  connected: { text: 'Connected', tone: 'success' },
  connecting: { text: 'Connecting', tone: 'info', pulse: true },
  reconnecting: { text: 'Reconnecting', tone: 'warning', pulse: true },
  offline: { text: 'Offline', tone: 'neutral' },
  error: { text: 'Connection failed', tone: 'danger' },
  unknown: { text: 'Status unknown', tone: 'neutral' },
};

export type SyncState = 'synced' | 'syncing' | 'pending' | 'offline' | 'error' | 'unknown';

const sync: Record<SyncState, { text: string; tone: Tone; pulse?: boolean }> = {
  synced: { text: 'Synced', tone: 'success' },
  syncing: { text: 'Syncing', tone: 'info', pulse: true },
  pending: { text: 'Changes not synced yet', tone: 'warning' },
  offline: { text: 'Offline, saved on this device', tone: 'neutral' },
  error: { text: 'Sync failed', tone: 'danger' },
  unknown: { text: 'Sync status unknown', tone: 'neutral' },
};

function WithDetail({
  detail,
  children,
}: {
  detail?: React.ReactNode;
  children: React.ReactElement;
}) {
  if (!detail) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  );
}

function StatusLine({
  slot,
  state,
  text,
  tone,
  pulse,
  detail,
  onRetry,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  slot: string;
  state: string;
  text: React.ReactNode;
  tone: Tone;
  pulse?: boolean;
  detail?: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div
      data-slot={slot}
      data-state={state}
      role="status"
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <WithDetail detail={detail}>
        <Status
          status={tone}
          pulse={pulse}
          tabIndex={detail ? 0 : undefined}
          className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
        >
          {text}
          {detail && typeof detail === 'string' && <span className="sr-only">. {detail}</span>}
        </Status>
      </WithDetail>
      {onRetry && (
        <Button type="button" variant="link" size="xs" className="h-auto px-0" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export interface ConnectionStatusProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  state: ConnectionState;
  /** Overrides the default text, e.g. "Connected to Ollama". */
  label?: React.ReactNode;
  /** More detail in a tooltip, e.g. the endpoint or last error. */
  detail?: React.ReactNode;
  /** Offered when offline or failed. */
  onRetry?: () => void;
}

/** A dot and a word for a live connection: model provider, gateway, socket. */
function ConnectionStatus({ state, label, detail, onRetry, ...props }: ConnectionStatusProps) {
  const c = connection[state];
  return (
    <StatusLine
      slot="connection-status"
      state={state}
      text={label ?? c.text}
      tone={c.tone}
      pulse={c.pulse}
      detail={detail}
      onRetry={state === 'offline' || state === 'error' ? onRetry : undefined}
      {...props}
    />
  );
}

export interface SyncStatusProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  state: SyncState;
  /** When the last successful sync finished. */
  lastSynced?: Date;
  /** Changes waiting to go up. */
  pendingCount?: number;
  detail?: React.ReactNode;
  /** Offered when sync failed. */
  onRetry?: () => void;
  /** Formats `lastSynced`; the default is the local time. */
  formatTime?: (date: Date) => string;
}

/** Whether local changes have reached the server. */
function SyncStatus({
  state,
  lastSynced,
  pendingCount,
  detail,
  onRetry,
  formatTime = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  ...props
}: SyncStatusProps) {
  const s = sync[state];
  let text = s.text;
  if (state === 'synced' && lastSynced) text = `Synced ${formatTime(lastSynced)}`;
  if (state === 'pending' && pendingCount)
    text = `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} not synced yet`;
  return (
    <StatusLine
      slot="sync-status"
      state={state}
      text={text}
      tone={s.tone}
      pulse={s.pulse}
      detail={detail}
      onRetry={state === 'error' ? onRetry : undefined}
      {...props}
    />
  );
}

export interface ConnectionBannerProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  state: ConnectionState;
  /** What still works, e.g. "Messages you send will go out when you reconnect." */
  description?: React.ReactNode;
  onRetry?: () => void;
}

/**
 * A full-width notice for connection trouble. It renders nothing while
 * connected, connecting or unknown, so it can stay mounted.
 */
function ConnectionBanner({
  state,
  description,
  onRetry,
  className,
  ...props
}: ConnectionBannerProps) {
  if (state !== 'offline' && state !== 'error' && state !== 'reconnecting') return null;
  const title =
    state === 'offline'
      ? 'You are offline'
      : state === 'reconnecting'
        ? 'Reconnecting…'
        : 'Could not connect';
  return (
    <Alert
      data-slot="connection-banner"
      data-state={state}
      variant={state === 'error' ? 'destructive' : 'warning'}
      className={cn('items-center', className)}
      {...props}
    >
      {state === 'offline' ? <WifiOff aria-hidden /> : <CloudOff aria-hidden />}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {onRetry && state !== 'reconnecting' && (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}

export { ConnectionBanner, ConnectionStatus, SyncStatus };
