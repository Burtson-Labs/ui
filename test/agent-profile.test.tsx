import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AgentRun, AvatarUpload } from '@burtson-labs/ui';

describe('profile photo selection', () => {
  it('rejects unsupported, empty and oversized photos before upload', () => {
    const upload = vi.fn();
    render(<AvatarUpload name="Alex" onUpload={upload} maxBytes={1024} />);
    const input = screen.getByLabelText('Choose profile photo');
    for (const file of [
      new File(['x'], 'photo.svg', { type: 'image/svg+xml' }),
      new File([], 'empty.jpg', { type: 'image/jpeg' }),
      new File(['x'.repeat(1025)], 'large.png', { type: 'image/png' }),
    ]) {
      fireEvent.change(input, { target: { files: [file] } });
      expect(screen.getByRole('alert').textContent).toBeTruthy();
      expect(upload).not.toHaveBeenCalled();
    }
  });
  it('keeps the current photo and allows retry after a removal fails', async () => {
    const remove = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection lost. Try again.'))
      .mockResolvedValueOnce(undefined);
    render(<AvatarUpload name="Alex" src="/photo.jpg" onUpload={vi.fn()} onRemove={remove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect((await screen.findByRole('alert')).textContent).toContain('Connection lost');
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('removed'));
    expect(remove).toHaveBeenCalledTimes(2);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Change photo' }));
  });
  it('can remove a stored photo when its preview fails to load', async () => {
    const remove = vi.fn().mockResolvedValue(undefined);
    render(<AvatarUpload name="Alex" hasPhoto onUpload={vi.fn()} onRemove={remove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it('blocks duplicate actions while a save is pending', async () => {
    let finish!: () => void;
    const remove = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<AvatarUpload name="Alex" src="/photo.jpg" onUpload={vi.fn()} onRemove={remove} />);
    const button = screen.getByRole('button', { name: 'Remove photo' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Change photo' }).hasAttribute('disabled')).toBe(
      true,
    );
    await act(async () => {
      finish();
      await Promise.resolve();
    });
  });
});

describe('agent run controls', () => {
  it('requests a pause without inventing a runtime transition', async () => {
    const pause = vi.fn();
    const { rerender } = render(
      <AgentRun
        title="Review"
        state="running"
        steps={[{ id: '1', label: 'Run checks', state: 'running' }]}
        onPause={pause}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pause run' }));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Pause run' })).toBeTruthy();
    rerender(
      <AgentRun
        title="Review"
        state="paused"
        steps={[{ id: '1', label: 'Run checks', state: 'paused' }]}
        onResume={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Resume run' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pause run' })).toBeNull();
  });
  it('limits retry to failed runs, and disables decisions while pending', async () => {
    const retry = vi.fn();
    const { rerender } = render(
      <AgentRun title="Review" state="failed" steps={[]} onRetry={retry} busy />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Retry run' }));
    expect(retry).not.toHaveBeenCalled();
    rerender(
      <AgentRun title="Review" state="completed" steps={[]} onRetry={retry} onCancel={vi.fn()} />,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });
});
