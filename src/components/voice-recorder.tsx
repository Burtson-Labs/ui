import Mic from '@burtson-labs/icons/react/mic';
import Pause from '@burtson-labs/icons/react/pause';
import Play from '@burtson-labs/icons/react/play';
import Square from '@burtson-labs/icons/react/square';
import Trash from '@burtson-labs/icons/react/trash';
import * as React from 'react';

import { cn } from '../lib/utils';

import { formatDuration } from './audio-player';
import { Button } from './button';

export type VoiceRecorderState =
  'idle' | 'requesting' | 'recording' | 'paused' | 'denied' | 'unsupported' | 'error';

export interface VoiceRecording {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export interface VoiceRecorderProps extends React.ComponentProps<'div'> {
  /** The finished recording, after Stop. */
  onRecorded: (recording: VoiceRecording) => void;
  onCancel?: () => void;
  onStateChange?: (state: VoiceRecorderState) => void;
  /** Stops by itself at this length. Default 5 minutes. */
  maxDurationMs?: number;
  /** Preferred container, used when the browser supports it (e.g. "audio/webm"). */
  mimeType?: string;
  /** Accessible name of the record button. */
  label?: string;
}

const LEVEL_BARS = 12;

function recordingSupported() {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof (globalThis as { MediaRecorder?: unknown }).MediaRecorder === 'function'
  );
}

/**
 * A microphone control for a composer: tap to record, then pause, stop to
 * keep the clip or discard it. While recording it shows a live level meter
 * and the elapsed time, in the recording colour (a state, not an error).
 * When the browser can't record or the microphone is blocked it says so and
 * how to fix it.
 */
function VoiceRecorder({
  onRecorded,
  onCancel,
  onStateChange,
  maxDurationMs = 5 * 60 * 1000,
  mimeType,
  label = 'Record a voice message',
  className,
  ...props
}: VoiceRecorderProps) {
  const [state, setStateRaw] = React.useState<VoiceRecorderState>('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array.from({ length: LEVEL_BARS }, () => 0),
  );
  const recorder = React.useRef<MediaRecorder | null>(null);
  const stream = React.useRef<MediaStream | null>(null);
  const chunks = React.useRef<Blob[]>([]);
  const started = React.useRef(0);
  const pausedTotal = React.useRef(0);
  const pausedAt = React.useRef(0);
  const discard = React.useRef(false);
  const frame = React.useRef(0);
  const audioCtx = React.useRef<AudioContext | null>(null);
  const tick = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const setState = React.useCallback(
    (s: VoiceRecorderState) => {
      setStateRaw(s);
      onStateChange?.(s);
    },
    [onStateChange],
  );

  const cleanup = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    clearInterval(tick.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void audioCtx.current?.close().catch(() => undefined);
    audioCtx.current = null;
    setLevels(Array.from({ length: LEVEL_BARS }, () => 0));
  }, []);

  React.useEffect(() => cleanup, [cleanup]);

  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const recordedMs = () =>
    now() -
    started.current -
    pausedTotal.current -
    (pausedAt.current ? now() - pausedAt.current : 0);

  const meter = (s: MediaStream) => {
    const Ctx =
      globalThis.AudioContext ??
      (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    try {
      const ctx = new Ctx();
      audioCtx.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(s).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const draw = () => {
        analyser.getByteFrequencyData(data);
        const per = Math.floor(data.length / LEVEL_BARS) || 1;
        setLevels(
          Array.from({ length: LEVEL_BARS }, (_, i) => {
            let sum = 0;
            for (let j = i * per; j < (i + 1) * per; j++) sum += data[j] ?? 0;
            return Math.min(1, sum / per / 180);
          }),
        );
        frame.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      // No meter is fine; recording still works. Drop the half-made context.
      void audioCtx.current?.close().catch(() => undefined);
      audioCtx.current = null;
    }
  };

  const start = async () => {
    if (!recordingSupported()) {
      setState('unsupported');
      return;
    }
    setState('requesting');
    let s: MediaStream;
    try {
      s = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string })?.name;
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'error');
      return;
    }
    stream.current = s;
    const type = mimeType && MediaRecorder.isTypeSupported?.(mimeType) ? mimeType : undefined;
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(s, type ? { mimeType: type } : undefined);
    } catch {
      cleanup();
      setState('error');
      return;
    }
    recorder.current = rec;
    chunks.current = [];
    discard.current = false;
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.current.push(e.data);
    };
    rec.onstop = () => {
      const durationMs = Math.round(recordedMs());
      const mime = rec.mimeType || type || 'audio/webm';
      cleanup();
      setElapsed(0);
      setState('idle');
      if (!discard.current)
        onRecorded({ blob: new Blob(chunks.current, { type: mime }), mimeType: mime, durationMs });
      chunks.current = [];
    };
    started.current = now();
    pausedTotal.current = 0;
    pausedAt.current = 0;
    rec.start(250);
    setState('recording');
    meter(s);
    tick.current = setInterval(() => {
      const ms = recordedMs();
      setElapsed(ms);
      if (ms >= maxDurationMs && rec.state !== 'inactive') rec.stop();
    }, 200);
  };

  const pause = () => {
    const rec = recorder.current;
    if (!rec) return;
    if (rec.state === 'recording') {
      rec.pause();
      pausedAt.current = now();
      setState('paused');
    } else if (rec.state === 'paused') {
      rec.resume();
      pausedTotal.current += now() - pausedAt.current;
      pausedAt.current = 0;
      setState('recording');
    }
  };

  const stop = (keep: boolean) => {
    const rec = recorder.current;
    discard.current = !keep;
    if (rec && rec.state !== 'inactive') rec.stop();
    else {
      cleanup();
      setState('idle');
    }
    if (!keep) onCancel?.();
  };

  const live = state === 'recording' || state === 'paused';

  if (!live) {
    const note =
      state === 'denied'
        ? 'Microphone access is blocked. Allow it in your browser’s site settings, then try again.'
        : state === 'unsupported'
          ? 'This browser can’t record audio. Try a current Chrome, Edge, Firefox or Safari.'
          : state === 'error'
            ? 'The microphone could not start. Check that one is connected and not in use.'
            : null;
    return (
      <div
        data-slot="voice-recorder"
        data-state={state}
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={label}
          title={label}
          disabled={state === 'requesting' || state === 'unsupported'}
          onClick={() => void start()}
          className="pointer-coarse:size-11"
        >
          <Mic />
        </Button>
        {note && (
          <p role="alert" className="max-w-xs text-xs text-muted-foreground">
            {note}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      data-slot="voice-recorder"
      data-state={state}
      role="group"
      aria-label="Recording"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-recording/30 bg-recording/8 py-1 pr-1 pl-3',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'size-2 shrink-0 rounded-full bg-recording',
          state === 'recording' && 'motion-safe:animate-pulse',
        )}
      />
      <span aria-hidden className="flex h-5 items-center gap-[2px]">
        {levels.map((l, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-recording/80 transition-[height] duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
            style={{ height: `${Math.max(15, Math.round(l * 100))}%` }}
          />
        ))}
      </span>
      <span
        role="timer"
        aria-label={`${state === 'paused' ? 'Paused at' : 'Recording'} ${formatDuration(elapsed / 1000)}`}
        className="font-mono text-xs text-foreground tabular-nums"
      >
        {formatDuration(elapsed / 1000)}
      </span>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label={state === 'paused' ? 'Resume recording' : 'Pause recording'}
        onClick={pause}
        className="rounded-full pointer-coarse:size-11"
      >
        {state === 'paused' ? (
          <Play className="fill-current" />
        ) : (
          <Pause className="fill-current" />
        )}
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Discard recording"
        onClick={() => stop(false)}
        className="rounded-full pointer-coarse:size-11"
      >
        <Trash />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        aria-label="Stop and attach recording"
        onClick={() => stop(true)}
        className="rounded-full bg-recording text-recording-foreground hover:bg-recording/90 pointer-coarse:size-11"
      >
        <Square className="fill-current" />
      </Button>
    </div>
  );
}

export { VoiceRecorder };
