import * as React from 'react';

import { AudioPlayer, VoiceMessage } from '@burtson-labs/ui';

import { makeDemoAudio } from '../demo-audio';

export default function AudioPlayerDemo() {
  const [clip] = React.useState(() => makeDemoAudio(6));
  return (
    <div className="grid w-full max-w-md gap-4">
      <AudioPlayer
        src={clip.url}
        peaks={clip.peaks}
        duration={6}
        title="Dispatch voice note"
        downloadName="dispatch-note.wav"
        transcript="Heartland Ag needs seventy-five hundred gallons of dyed diesel at site seven before noon tomorrow."
      />
      <VoiceMessage src={clip.url} peaks={clip.peaks} duration={6} />
    </div>
  );
}
