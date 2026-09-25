import * as React from 'react';

import {
  AttachmentItem,
  AttachmentTray,
  ChatHistory,
  type ChatHistoryItem,
  ChatLayout,
  Composer,
  Conversation,
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
  Markdown,
  Message,
  MessageActions,
  MessageAttachments,
  type MessageFile,
  StreamingIndicator,
  VoiceRecorder,
} from '@burtson-labs/ui';

type Turn = { id: string; from: 'user' | 'assistant'; text: string; files?: MessageFile[] };
type Upload = { id: string; file: File; state: 'uploading' | 'ready'; progress: number };
type Chat = ChatHistoryItem & { turns: Turn[] };

const uid = () => Math.random().toString(36).slice(2);

// Stand-in for your model: streams a reply a few words at a time.
function streamReply(prompt: string, files: number, onToken: (t: string) => void) {
  const reply = files
    ? `Got **${files} file${files > 1 ? 's' : ''}**. Here is what stands out:\n\n- Totals reconcile\n- Two rows need a PO number`
    : `You asked: _${prompt}_.\n\nA real app would call its model here and stream the answer back.`;
  const words = reply.split(/(\s+)/);
  let i = 0;
  const timer = setInterval(() => {
    onToken(words.slice(0, (i += 2)).join(''));
    if (i >= words.length) clearInterval(timer);
  }, 40);
  return () => clearInterval(timer);
}

export default function ChatApp() {
  const [chats, setChats] = React.useState<Chat[]>(() => [
    { id: 'welcome', title: 'Welcome', updatedAt: Date.now(), turns: [] },
  ]);
  const [activeId, setActiveId] = React.useState('welcome');
  const [uploads, setUploads] = React.useState<Upload[]>([]);
  const [streaming, setStreaming] = React.useState(false);
  const stop = React.useRef<() => void>(() => undefined);
  const chat = chats.find((c) => c.id === activeId) ?? chats[0]!;

  const update = (id: string, fn: (c: Chat) => Chat) =>
    setChats((all) => all.map((c) => (c.id === id ? fn(c) : c)));

  const attach = (files: File[]) => {
    const added = files.map((file) => ({
      id: uid(),
      file,
      state: 'uploading' as const,
      progress: 0,
    }));
    setUploads((u) => [...u, ...added]);
    // Pretend upload: your app would PUT the file and report progress.
    for (const a of added) {
      let p = 0;
      const t = setInterval(() => {
        p += 25;
        setUploads((u) =>
          u.map((x) =>
            x.id === a.id ? { ...x, progress: p, state: p >= 100 ? 'ready' : 'uploading' } : x,
          ),
        );
        if (p >= 100) clearInterval(t);
      }, 150);
    }
  };

  const send = (text: string, extra: MessageFile[] = []) => {
    const files = [
      ...uploads.map((u) => ({ name: u.file.name, size: u.file.size, type: u.file.type })),
      ...extra,
    ];
    const replyId = uid();
    const chatId = chat.id;
    update(chatId, (c) => ({
      ...c,
      title: c.turns.length ? c.title : text.slice(0, 40) || 'Files',
      updatedAt: Date.now(),
      turns: [
        ...c.turns,
        { id: uid(), from: 'user', text, files },
        { id: replyId, from: 'assistant', text: '' },
      ],
    }));
    setUploads([]);
    setStreaming(true);
    stop.current = streamReply(text, files.length, (partial) => {
      update(chatId, (c) => ({
        ...c,
        turns: c.turns.map((t) => (t.id === replyId ? { ...t, text: partial } : t)),
      }));
    });
    setTimeout(() => setStreaming(false), 1500);
  };

  return (
    <ChatLayout
      title={chat.title}
      sidebar={
        <ChatHistory
          items={chats}
          activeId={chat.id}
          onSelect={setActiveId}
          onNewChat={() => {
            const id = uid();
            setChats((all) => [
              { id, title: 'New chat', updatedAt: Date.now(), turns: [] },
              ...all,
            ]);
            setActiveId(id);
          }}
          onRename={(id, title) => update(id, (c) => ({ ...c, title }))}
          onDelete={(id) => setChats((all) => all.filter((c) => c.id !== id))}
        />
      }
    >
      <Conversation
        className="flex-1"
        empty={
          <EmptyState>
            <EmptyStateTitle>Ask anything</EmptyStateTitle>
            <EmptyStateDescription>
              Attach files, paste a screenshot or record a voice note.
            </EmptyStateDescription>
          </EmptyState>
        }
      >
        {chat.turns.map((t) => (
          <Message
            key={t.id}
            from={t.from}
            name={t.from === 'assistant' ? 'Assistant' : undefined}
            actions={
              t.from === 'assistant' && t.text ? <MessageActions copyText={t.text} /> : undefined
            }
          >
            {t.text ? (
              <Markdown>{t.text}</Markdown>
            ) : (
              t.from === 'assistant' && <StreamingIndicator />
            )}
            {t.files && <MessageAttachments files={t.files} className="mt-2" />}
          </Message>
        ))}
      </Conversation>
      <div className="p-3">
        <Composer
          onSubmit={(text) => send(text)}
          streaming={streaming}
          onStop={() => {
            stop.current();
            setStreaming(false);
          }}
          onAttach={attach}
          attachmentCount={uploads.length}
          canSubmit={uploads.every((u) => u.state === 'ready')}
          attachments={
            uploads.length > 0 && (
              <AttachmentTray>
                {uploads.map((u) => (
                  <AttachmentItem
                    key={u.id}
                    name={u.file.name}
                    size={u.file.size}
                    state={u.state}
                    progress={u.progress}
                    onRemove={() => setUploads((x) => x.filter((y) => y.id !== u.id))}
                  />
                ))}
              </AttachmentTray>
            )
          }
          actions={
            <VoiceRecorder
              onRecorded={({ blob, durationMs, mimeType }) =>
                send('', [
                  {
                    name: 'Voice note',
                    type: mimeType,
                    href: URL.createObjectURL(blob),
                    duration: durationMs / 1000,
                  },
                ])
              }
            />
          }
        />
      </div>
    </ChatLayout>
  );
}
