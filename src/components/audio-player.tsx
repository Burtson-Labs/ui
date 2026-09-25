import Download from '@burtson-labs/icons/react/download';
import FileText from '@burtson-labs/icons/react/file-text';
import Pause from '@burtson-labs/icons/react/pause';
import Play from '@burtson-labs/icons/react/play';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';

/** 83.4 → "1:23"; 3723 → "1:02:03". */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/**
 * Reduce decoded audio to `bars` peak heights between 0 and 1 (the loudest
 * sample in each slice, normalised to the loudest slice).
 */
export function peaksFromChannelData(data: Float32Array, bars = 48): number[] {
  if (!data.length || bars < 1) return [];
  const size = Math.max(1, Math.floor(data.length / bars));
  const peaks: number[] = [];
  for (let b = 0; b < bars; b++) {
    let max = 0;
    const end = Math.min(data.length, (b + 1) * size);
    for (let i = b * size; i < end; i++) {
      const v = Math.abs(data[i] ?? 0);
      if (v > max) max = v;
    }
    peaks.push(max);
  }
  const top = Math.max(...peaks) || 1;
  return peaks.map((p) => p / top);
}

/**
 * Decode an audio file or URL with Web Audio and return its peaks for
 * AudioPlayer. Browser only; for long files compute peaks on the server.
 */
export async function computePeaks(source: Blob | string, bars = 48): Promise<number[]> {
  const Ctx =
    globalThis.AudioContext ??
    (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) throw new Error('Web Audio is not available in this browser.');
  const buf =
    typeof source === 'string'
      ? await (await fetch(source)).arrayBuffer()
      : await source.arrayBuffer();
  const ctx = new Ctx();
  try {
    const audio = await ctx.decodeAudioData(buf);
    return peaksFromChannelData(audio.getChannelData(0), bars);
  } finally {
    void ctx.close();
  }
}

const SPEEDS = [1, 1.5, 2] as const;

export interface AudioPlayerProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  src: string;
  /** Waveform heights 0–1 (see computePeaks). Leave out for a plain progress bar. */
  peaks?: number[];
  /** Name read out with the controls, e.g. "Voice note from Dana". */
  title?: string;
  /** Known length in seconds, shown before the file has loaded. */
  duration?: number;
  /** Text of the recording; adds a Transcript toggle. */
  transcript?: React.ReactNode;
  /** Adds a download link with this file name. */
  downloadName?: string;
  /** `compact` fits inside a message bubble. */
  variant?: 'default' | 'compact';
  onPlayChange?: (playing: boolean) => void;
}

/**
 * Plays one recording: play and pause, a waveform you can click or drive
 * with the arrow keys (5 seconds a step, Home and End), elapsed and total
 * time, speed (1×, 1.5×, 2×), download and a transcript. The waveform is a
 * slider for screen readers.
 */
function AudioPlayer({
  src,
  peaks,
  title = 'Audio',
  duration: knownDuration,
  transcript,
  downloadName,
  variant = 'default',
  onPlayChange,
  className,
  ...props
}: AudioPlayerProps) {
  const audio = React.useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(knownDuration ?? 0);
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>(1);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const transcriptId = React.useId();
  const compact = variant === 'compact';
  const total = duration || knownDuration || 0;
  const ratio = total ? Math.min(1, current / total) : 0;

  React.useEffect(() => {
    if (audio.current) audio.current.playbackRate = speed;
  }, [speed]);

  const seek = (t: number) => {
    const el = audio.current;
    const clamped = Math.max(0, Math.min(total || t, t));
    if (el) el.currentTime = clamped;
    setCurrent(clamped);
  };

  const togglePlay = async () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setFailed(true);
      }
    } else el.pause();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      seek(current + step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      seek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      seek(total);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      void togglePlay();
    }
  };

  const bars = peaks && peaks.length ? peaks : null;

  return (
    <div
      data-slot="audio-player"
      data-variant={variant}
      className={cn(
        'grid min-w-0 gap-2 rounded-lg border bg-surface text-foreground',
        compact ? 'w-full max-w-sm p-2' : 'p-3',
        className,
      )}
      {...props}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the transcript prop is the text alternative */}
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => {
          setPlaying(true);
          onPlayChange?.(true);
        }}
        onPause={() => {
          setPlaying(false);
          onPlayChange?.(false);
        }}
        onEnded={() => setCurrent(0)}
        onError={() => setFailed(true)}
      />
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          size={compact ? 'icon-sm' : 'icon'}
          variant={playing ? 'secondary' : 'default'}
          aria-label={playing ? `Pause ${title}` : `Play ${title}`}
          onClick={() => void togglePlay()}
          disabled={failed}
          className="shrink-0 rounded-full pointer-coarse:size-11"
        >
          {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
        </Button>
        <div
          role="slider"
          tabIndex={failed ? -1 : 0}
          aria-label={`Seek ${title}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={`${formatDuration(current)} of ${formatDuration(total)}`}
          onKeyDown={onKeyDown}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (!rect.width || !total) return;
            seek(((e.clientX - rect.left) / rect.width) * total);
          }}
          className={cn(
            'relative flex min-w-0 flex-1 cursor-pointer items-center rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20',
            compact ? 'h-7' : 'h-9',
          )}
        >
          {bars ? (
            <div aria-hidden className="flex h-full w-full items-center gap-[2px]">
              {bars.map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    'min-w-[2px] flex-1 rounded-full transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                    (i + 0.5) / bars.length <= ratio ? 'bg-brand' : 'bg-border-strong',
                  )}
                  style={{ height: `${Math.max(12, Math.round(p * 100))}%` }}
                />
              ))}
            </div>
          ) : (
            <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-brand" style={{ width: `${ratio * 100}%` }} />
            </div>
          )}
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
          {playing || current ? formatDuration(current) : formatDuration(total)}
        </span>
      </div>
      {failed ? (
        <p role="alert" className="text-xs text-destructive">
          This recording could not be played.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={`Playback speed ${speed}×`}
            onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1)}
            className="font-mono tabular-nums"
          >
            {speed}×
          </Button>
          {transcript && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-expanded={showTranscript}
              aria-controls={transcriptId}
              onClick={() => setShowTranscript((v) => !v)}
            >
              <FileText /> Transcript
            </Button>
          )}
          {downloadName && (
            <Button variant="ghost" size="xs" asChild>
              <a href={src} download={downloadName}>
                <Download /> Download
              </a>
            </Button>
          )}
        </div>
      )}
      {transcript && showTranscript && (
        <div
          id={transcriptId}
          className="animate-in rounded-md bg-muted/60 p-2.5 text-sm leading-6 text-muted-foreground"
        >
          {transcript}
        </div>
      )}
    </div>
  );
}

/** A voice note inside a message: the compact AudioPlayer. */
function VoiceMessage(props: Omit<AudioPlayerProps, 'variant'>) {
  return <AudioPlayer title="Voice message" {...props} variant="compact" />;
}

export { AudioPlayer, VoiceMessage };
