import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  acceptsFile,
  AudioPlayer,
  ChatHistory,
  ChatLayout,
  Composer,
  formatDuration,
  groupConversations,
  MessageActions,
  MessageAttachments,
  MessageEditor,
  peaksFromChannelData,
  VoiceRecorder,
} from '@burtson-labs/ui';

const file = (name: string, type: string) => new File(['x'], name, { type });

describe('Composer attachments', () => {
  it('attaches files picked with the paperclip', async () => {
    const onAttach = vi.fn();
    const { container } = render(<Composer onSubmit={() => undefined} onAttach={onAttach} />);
    expect(screen.getByRole('button', { name: 'Attach files' })).toBeTruthy();
    const input = container.querySelector<HTMLInputElement>('input[type=file]');
    if (!input) throw new Error('no file input');
    await userEvent.upload(input, [file('a.pdf', 'application/pdf'), file('b.png', 'image/png')]);
    expect(onAttach).toHaveBeenCalledWith([expect.any(File), expect.any(File)]);
    expect((onAttach.mock.calls[0]?.[0] as File[]).map((f) => f.name)).toEqual(['a.pdf', 'b.png']);
  });

  it('attaches dropped files, filtered by accept', () => {
    const onAttach = vi.fn();
    const { container } = render(
      <Composer onSubmit={() => undefined} onAttach={onAttach} accept="image/*" />,
    );
    const form = container.querySelector('form');
    if (!form) throw new Error('no form');
    const files = [file('photo.jpg', 'image/jpeg'), file('notes.txt', 'text/plain')];
    fireEvent.dragEnter(form, { dataTransfer: { types: ['Files'], files } });
    expect(form.getAttribute('data-dragging')).toBe('true');
    fireEvent.drop(form, { dataTransfer: { types: ['Files'], files } });
    expect(form.getAttribute('data-dragging')).toBeNull();
    expect((onAttach.mock.calls[0]?.[0] as File[]).map((f) => f.name)).toEqual(['photo.jpg']);
  });

  it('attaches pasted files but leaves text pastes alone', () => {
    const onAttach = vi.fn();
    render(<Composer onSubmit={() => undefined} onAttach={onAttach} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.paste(box, { clipboardData: { files: [file('shot.png', 'image/png')] } });
    expect(onAttach).toHaveBeenCalledTimes(1);
    fireEvent.paste(box, { clipboardData: { files: [] } });
    expect(onAttach).toHaveBeenCalledTimes(1);
  });

  it('has no attach button without onAttach', () => {
    render(<Composer onSubmit={() => undefined} />);
    expect(screen.queryByRole('button', { name: 'Attach files' })).toBeNull();
  });

  it('matches accept rules', () => {
    expect(acceptsFile({ name: 'a.PDF', type: '' }, '.pdf')).toBe(true);
    expect(acceptsFile({ name: 'a.png', type: 'image/png' }, 'image/*,.pdf')).toBe(true);
    expect(acceptsFile({ name: 'a.txt', type: 'text/plain' }, 'image/*,.pdf')).toBe(false);
    expect(acceptsFile({ name: 'a.txt', type: 'text/plain' })).toBe(true);
  });
});

describe('ChatHistory', () => {
  const now = new Date(2026, 8, 25, 15, 0);
  const at = (days: number, hour = 10) => new Date(2026, 8, 25 - days, hour);
  const items = [
    { id: 'a', title: 'Fuel surcharge table', updatedAt: at(0, 9) },
    { id: 'b', title: 'Detention report', updatedAt: at(1) },
    { id: 'c', title: 'IFTA question', updatedAt: at(4) },
    { id: 'd', title: 'Old planning', updatedAt: at(30) },
    { id: 'e', title: 'Pinned runbook', updatedAt: at(60), pinned: true },
  ];

  it('groups by pinned, today, yesterday, previous 7 days and older', () => {
    const groups = groupConversations(items, now);
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ['Pinned', ['e']],
      ['Today', ['a']],
      ['Yesterday', ['b']],
      ['Previous 7 days', ['c']],
      ['Older', ['d']],
    ]);
  });

  it('searches, opens with the keyboard and marks the active chat', async () => {
    const onSelect = vi.fn();
    render(<ChatHistory items={items} activeId="a" onSelect={onSelect} now={now} />);
    expect(
      screen.getByRole('button', { name: 'Fuel surcharge table' }).getAttribute('aria-current'),
    ).toBe('page');
    screen.getByRole('button', { name: 'Pinned runbook' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Fuel surcharge table');
    await userEvent.keyboard('{End}');
    expect(document.activeElement?.textContent).toBe('Old planning');
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('d');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search chats' }), 'ifta');
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toContain('IFTA question');
    expect(screen.queryByRole('button', { name: 'Detention report' })).toBeNull();
  });

  it('renames in place from the row menu', async () => {
    const onRename = vi.fn();
    render(<ChatHistory items={items} onSelect={() => undefined} onRename={onRename} now={now} />);
    await userEvent.click(screen.getByRole('button', { name: 'Actions for Detention report' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: /Rename/ }));
    const input = await screen.findByRole('textbox', { name: 'Chat title' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Detention by customer{Enter}');
    expect(onRename).toHaveBeenCalledWith('b', 'Detention by customer');
  });

  it('shows loading, error with retry, and empty states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ChatHistory items={[]} onSelect={() => undefined} loading />);
    expect(screen.getByRole('status', { name: 'Loading chats' })).toBeTruthy();
    rerender(
      <ChatHistory
        items={[]}
        onSelect={() => undefined}
        error="Gateway timeout"
        onRetry={onRetry}
      />,
    );
    await userEvent.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Try again' }),
    );
    expect(onRetry).toHaveBeenCalled();
    rerender(<ChatHistory items={[]} onSelect={() => undefined} />);
    expect(screen.getByText(/No chats yet/)).toBeTruthy();
  });
});

describe('ChatLayout full screen', () => {
  it('toggles full screen with the CSS fallback and leaves on Escape', async () => {
    const onFullscreenChange = vi.fn();
    const { container } = render(
      <ChatLayout title="Chat" onFullscreenChange={onFullscreenChange}>
        <p>conversation</p>
      </ChatLayout>,
    );
    const root = container.querySelector('[data-slot="chat-layout"]');
    const button = screen.getByRole('button', { name: 'Full screen' });
    await userEvent.click(button);
    expect(root?.getAttribute('data-fullscreen')).toBe('true');
    expect(screen.getByRole('button', { name: 'Exit full screen' })).toBe(button);
    expect(onFullscreenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Escape}');
    expect(root?.getAttribute('data-fullscreen')).toBeNull();
    expect(onFullscreenChange).toHaveBeenLastCalledWith(false);
  });

  it('hides and shows the sidebar', async () => {
    render(
      <ChatLayout sidebar={<p>history</p>} title="Chat">
        <p>conversation</p>
      </ChatLayout>,
    );
    expect(screen.getByRole('complementary', { name: 'Chats' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Hide chats' }));
    expect(screen.queryByRole('complementary', { name: 'Chats' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Show chats' }).getAttribute('aria-expanded')).toBe(
      'false',
    );
  });
});

describe('AudioPlayer', () => {
  it('seeks with the arrow keys, Home and End, and names the position', async () => {
    render(
      <AudioPlayer src="/note.webm" duration={60} peaks={[0.2, 0.8, 0.5]} title="Voice note" />,
    );
    const slider = screen.getByRole('slider', { name: 'Seek Voice note' });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
    expect(slider.getAttribute('aria-valuetext')).toBe('0:10 of 1:00');
    await userEvent.keyboard('{ArrowLeft}');
    expect(slider.getAttribute('aria-valuenow')).toBe('5');
    await userEvent.keyboard('{End}');
    expect(slider.getAttribute('aria-valuenow')).toBe('60');
    await userEvent.keyboard('{Home}');
    expect(slider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('cycles speed and toggles the transcript', async () => {
    render(<AudioPlayer src="/n.webm" duration={10} transcript="Load for Heartland at 7." />);
    await userEvent.click(screen.getByRole('button', { name: 'Playback speed 1×' }));
    expect(screen.getByRole('button', { name: 'Playback speed 1.5×' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Transcript/ }));
    expect(screen.getByText('Load for Heartland at 7.')).toBeTruthy();
  });

  it('computes normalised peaks and formats time', () => {
    const data = new Float32Array([0, 0.5, -1, 0.25, 0.1, -0.2]);
    const peaks = peaksFromChannelData(data, 3);
    [0.5, 1, 0.2].forEach((v, i) => expect(peaks[i]).toBeCloseTo(v, 5));
    expect(formatDuration(83.4)).toBe('1:23');
    expect(formatDuration(3723)).toBe('1:02:03');
  });
});

describe('VoiceRecorder', () => {
  const original = {
    mediaDevices: navigator.mediaDevices,
    MediaRecorder: globalThis.MediaRecorder,
  };
  afterEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: original.mediaDevices,
      configurable: true,
    });
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = original.MediaRecorder;
  });

  it('says when the browser cannot record', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    render(<VoiceRecorder onRecorded={() => undefined} />);
    await userEvent.click(screen.getByRole('button', { name: 'Record a voice message' }));
    expect(screen.getByRole('alert').textContent).toMatch(/can’t record audio/);
  });

  it('explains a blocked microphone', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: () =>
          Promise.reject(Object.assign(new Error('no'), { name: 'NotAllowedError' })),
      },
      configurable: true,
    });
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = class {};
    render(<VoiceRecorder onRecorded={() => undefined} />);
    await userEvent.click(screen.getByRole('button', { name: 'Record a voice message' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/Microphone access is blocked/);
  });

  it('records, pauses and hands over the clip on stop', async () => {
    const track = { stop: vi.fn() };
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: () => Promise.resolve({ getTracks: () => [track] }) },
      configurable: true,
    });
    class FakeRecorder {
      static isTypeSupported = () => true;
      state: 'inactive' | 'recording' | 'paused' = 'inactive';
      mimeType = 'audio/webm';
      ondataavailable: ((e: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        this.state = 'recording';
      }
      pause() {
        this.state = 'paused';
      }
      resume() {
        this.state = 'recording';
      }
      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['abc'], { type: 'audio/webm' }) });
        this.onstop?.();
      }
    }
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = FakeRecorder;
    const onRecorded = vi.fn();
    render(<VoiceRecorder onRecorded={onRecorded} />);
    await userEvent.click(screen.getByRole('button', { name: 'Record a voice message' }));
    const group = await screen.findByRole('group', { name: 'Recording' });
    await userEvent.click(within(group).getByRole('button', { name: 'Pause recording' }));
    expect(within(group).getByRole('button', { name: 'Resume recording' })).toBeTruthy();
    await act(async () => {
      await userEvent.click(
        within(group).getByRole('button', { name: 'Stop and attach recording' }),
      );
    });
    expect(onRecorded).toHaveBeenCalledTimes(1);
    const rec = onRecorded.mock.calls[0]?.[0] as { blob: Blob; mimeType: string };
    expect(rec.mimeType).toBe('audio/webm');
    expect(rec.blob.size).toBe(3);
    expect(track.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Record a voice message' })).toBeTruthy();
  });
});

describe('Message extras', () => {
  it('toggles feedback and clears it on a second click', async () => {
    const onFeedback = vi.fn();
    const { rerender } = render(<MessageActions onFeedback={onFeedback} copyText="hi" />);
    await userEvent.click(screen.getByRole('button', { name: 'Good response' }));
    expect(onFeedback).toHaveBeenLastCalledWith('up');
    rerender(<MessageActions onFeedback={onFeedback} feedback="up" copyText="hi" />);
    expect(screen.getByRole('button', { name: 'Good response' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Good response' }));
    expect(onFeedback).toHaveBeenLastCalledWith(null);
  });

  it('edits and resends with Enter, cancels with Escape', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<MessageEditor defaultValue="Draft" onSubmit={onSubmit} onCancel={onCancel} />);
    const box = screen.getByRole('textbox', { name: 'Edit message' });
    await userEvent.type(box, ' two{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Draft two');
    await userEvent.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalled();
  });

  it('plays voice notes inline and links other files', () => {
    render(
      <MessageAttachments
        files={[
          { name: 'note.webm', type: 'audio/webm', href: '/note.webm', duration: 12 },
          { name: 'bol.pdf', type: 'application/pdf', href: '/bol.pdf', size: 2048 },
        ]}
      />,
    );
    expect(screen.getByRole('slider', { name: 'Seek note.webm' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /bol\.pdf/ }).getAttribute('href')).toBe('/bol.pdf');
  });
});
