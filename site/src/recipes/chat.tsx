import * as React from 'react';

import { Badge } from '@burtson-labs/ui';

import { Code } from '../code';
import { Link } from '../router';

import exampleSource from './chat-example.tsx?raw';

const ChatApp = React.lazy(() => import('./chat-example'));

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mt-12 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 leading-7 text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_code]:font-mono [&_code]:text-foreground">
      {children}
    </p>
  );
}

const steps = [
  ['layout', 'Layout'],
  ['history', 'History'],
  ['composer', 'Composer and attachments'],
  ['messages', 'Streaming messages'],
  ['voice', 'Voice and audio'],
  ['fullscreen', 'Full screen'],
  ['complete', 'Complete example'],
] as const;

export function ChatRecipe() {
  return (
    <article>
      <header className="mb-8 grid gap-2">
        <p className="font-mono text-xs text-muted-foreground">Recipe</p>
        <h1 className="text-3xl font-semibold tracking-tight">Build a chat app</h1>
        <p className="text-lg text-muted-foreground">
          History, attachments, streaming replies, voice notes and full screen, from nine
          components. The demo below is the complete example at the end of this page, running.
        </p>
      </header>

      <div className="-mx-1 mb-3 flex flex-wrap gap-1.5">
        {[
          'ChatLayout',
          'ChatHistory',
          'Conversation',
          'Message',
          'Composer',
          'AttachmentTray',
          'VoiceRecorder',
          'AudioPlayer',
          'MessageActions',
        ].map((c) => (
          <Badge key={c} variant="outline" className="font-mono">
            {c}
          </Badge>
        ))}
      </div>
      <div className="h-[34rem] overflow-hidden rounded-xl border shadow-sm">
        <React.Suspense
          fallback={
            <p role="status" className="p-6 text-sm text-muted-foreground">
              Loading the demo…
            </p>
          }
        >
          <ChatApp />
        </React.Suspense>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Try it: drop or paste a file, record a voice note, press Full screen, rename a chat. The
        assistant is a stand-in that streams a canned reply.
      </p>

      <nav aria-label="On this page" className="mt-8 rounded-lg border p-4">
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Steps
        </p>
        <ol className="grid list-decimal gap-1 pl-5 text-sm sm:grid-cols-2">
          {steps.map(([id, title]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:underline">
                {title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <H2 id="install">Install</H2>
      <P>Use the package, or copy the components you need into your app and own them.</P>
      <Code lang="sh" code="npm install @burtson-labs/ui @burtson-labs/icons" />
      <div className="h-3" />
      <Code
        lang="sh"
        code={`npx shadcn@latest add https://ui.burtson.ai/r/chat-layout.json \\
  https://ui.burtson.ai/r/chat-history.json https://ui.burtson.ai/r/composer.json \\
  https://ui.burtson.ai/r/voice-recorder.json https://ui.burtson.ai/r/message-actions.json`}
      />

      <H2 id="layout">1. Layout</H2>
      <P>
        <Link href="/docs/components/chat-layout">ChatLayout</Link> is the frame: a header, a
        resizable sidebar that becomes a sheet on phones, the conversation, and an optional details
        column. Children stack, so the composer stays at the bottom.
      </P>
      <Code
        code={`<ChatLayout title={chat.title} sidebar={<ChatHistory … />} details={<Sources … />}>
  <Conversation className="flex-1">{messages}</Conversation>
  <div className="p-3">
    <Composer onSubmit={send} />
  </div>
</ChatLayout>`}
      />

      <H2 id="history">2. History</H2>
      <P>
        <Link href="/docs/components/chat-history">ChatHistory</Link> groups chats into Pinned,
        Today, Yesterday, Previous 7 days and Older, searches titles and previews, and adds a row
        menu for the actions you handle. Arrow keys move between chats.
      </P>
      <Code
        code={`<ChatHistory
  items={chats}              // { id, title, updatedAt, pinned? }[]
  activeId={chat.id}
  onSelect={setActiveId}
  onNewChat={createChat}
  onRename={(id, title) => rename(id, title)}
  onPinChange={(id, pinned) => pin(id, pinned)}
  onDelete={(id) => remove(id)}  // confirm or offer undo in your app
/>`}
      />

      <H2 id="composer">3. Composer and attachments</H2>
      <P>
        Set <code>onAttach</code> and the <Link href="/docs/components/composer">Composer</Link>{' '}
        gets a paperclip button, accepts files dropped on it and pasted screenshots. It only hands
        the files over: upload them your way and show their state in an AttachmentTray.{' '}
        <code>attachmentCount</code> lets a message with only files send, and <code>canSubmit</code>{' '}
        holds sending until uploads finish.
      </P>
      <Code
        code={`<Composer
  onSubmit={send}
  onAttach={(files) => upload(files)}   // paperclip, drop and paste
  accept="image/*,.pdf,.csv"
  attachmentCount={uploads.length}
  canSubmit={uploads.every((u) => u.state === 'ready')}
  attachments={
    <AttachmentTray>
      {uploads.map((u) => (
        <AttachmentItem key={u.id} name={u.name} size={u.size} state={u.state}
          progress={u.progress} onRemove={() => cancel(u.id)} onRetry={() => retry(u.id)} />
      ))}
    </AttachmentTray>
  }
/>`}
      />

      <H2 id="messages">4. Streaming messages</H2>
      <P>
        <Link href="/docs/components/conversation">Conversation</Link> follows the newest message
        while it streams and offers Jump to latest when the reader scrolls up. Update the last
        message’s text as tokens arrive; show StreamingIndicator until the first one.
      </P>
      <Code
        code={`<Conversation className="flex-1">
  {turns.map((t) => (
    <Message key={t.id} from={t.from}
      actions={<MessageActions copyText={t.text} onRegenerate={() => regenerate(t.id)}
        feedback={t.rating} onFeedback={(v) => rate(t.id, v)} />}>
      {t.text ? <Markdown>{t.text}</Markdown> : <StreamingIndicator />}
      <MessageAttachments files={t.files} />
    </Message>
  ))}
</Conversation>`}
      />
      <P>
        <br />
        Return a promise from <code>onSubmit</code>: the draft clears when it resolves and stays in
        the box, with a message, if it rejects. Pass <code>streaming</code> and <code>onStop</code>{' '}
        and the send button becomes Stop.
      </P>

      <H2 id="voice">5. Voice and audio</H2>
      <P>
        <Link href="/docs/components/voice-recorder">VoiceRecorder</Link> records from the
        microphone with a live level meter, pause and discard, and hands you a Blob. It explains a
        blocked microphone or an unsupported browser instead of failing silently.{' '}
        <Link href="/docs/components/audio-player">AudioPlayer</Link> (and the compact VoiceMessage)
        plays it back with a seekable waveform, speed, download and transcript.
      </P>
      <Code
        code={`<Composer
  onSubmit={send}
  actions={
    <VoiceRecorder
      onRecorded={async ({ blob, durationMs }) => {
        const url = await uploadAudio(blob);
        send('', [{ name: 'Voice note', type: blob.type, href: url, duration: durationMs / 1000 }]);
      }}
    />
  }
/>

// In a message (MessageAttachments does this for audio files):
<VoiceMessage src={url} peaks={await computePeaks(blob)} transcript={text} />`}
      />

      <H2 id="fullscreen">6. Full screen</H2>
      <P>
        The Full screen button in ChatLayout’s header uses the browser’s Fullscreen API where it is
        allowed and pins the layout over the page where it isn’t (iOS, iframes). Escape leaves.
        Nothing remounts, so the draft, scroll position and a playing voice note carry on.{' '}
        <code>useFullscreen(ref)</code> gives any element the same behaviour.
      </P>
      <Code
        code={`<ChatLayout onFullscreenChange={(on) => track('chat_fullscreen', { on })} … />

// Or on your own element:
const ref = React.useRef<HTMLDivElement>(null);
const { fullscreen, toggle } = useFullscreen(ref);`}
      />

      <H2 id="complete">7. Complete example</H2>
      <P>
        The demo at the top of this page, in full. It keeps chats in state and fakes the model and
        the uploads; replace <code>streamReply</code> and the upload timer with your API.
      </P>
      <Code code={exampleSource} />
    </article>
  );
}
