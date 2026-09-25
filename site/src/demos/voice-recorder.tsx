import * as React from 'react';

import { VoiceMessage, VoiceRecorder, type VoiceRecording } from '@burtson-labs/ui';

export default function VoiceRecorderDemo() {
  const [clip, setClip] = React.useState<{ url: string; seconds: number } | null>(null);
  return (
    <div className="grid w-full max-w-md justify-items-start gap-3">
      <VoiceRecorder
        onRecorded={({ blob, durationMs }: VoiceRecording) =>
          setClip({ url: URL.createObjectURL(blob), seconds: durationMs / 1000 })
        }
      />
      {clip ? (
        <VoiceMessage src={clip.url} duration={clip.seconds} downloadName="voice-note.webm" />
      ) : (
        <p className="text-xs text-muted-foreground">
          Press the microphone to record. Nothing leaves this page.
        </p>
      )}
    </div>
  );
}
