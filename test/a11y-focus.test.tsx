import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AgentPlan,
  AgentRun,
  AskUser,
  AvatarUpload,
  Composer,
  ContextUsage,
  Conversation,
  MessageActions,
} from '@burtson-labs/ui';

describe('Composer focus', () => {
  it('keeps focus in the text box while a send is pending', async () => {
    let finish!: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((r) => (finish = r)));
    render(<Composer onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, 'hello{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('hello');
    expect((box as HTMLTextAreaElement).disabled).toBe(false);
    expect(box.hasAttribute('readonly')).toBe(true);
    expect(document.activeElement).toBe(box);
    finish();
    await waitFor(() => expect(box.hasAttribute('readonly')).toBe(false));
    expect(document.activeElement).toBe(box);
  });

  it('takes send and stop labels', () => {
    const { rerender } = render(<Composer onSubmit={() => {}} sendLabel="Envoyer" />);
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeTruthy();
    rerender(<Composer onSubmit={() => {}} streaming onStop={() => {}} stopLabel="Arrêter" />);
    expect(screen.getByRole('button', { name: 'Arrêter' })).toBeTruthy();
  });
});

describe('streaming announcements', () => {
  it('marks the conversation log busy while a reply streams', () => {
    const { rerender } = render(
      <Conversation streaming>
        <p>hi</p>
      </Conversation>,
    );
    expect(screen.getByRole('log').getAttribute('aria-busy')).toBe('true');
    rerender(
      <Conversation>
        <p>hi</p>
      </Conversation>,
    );
    expect(screen.getByRole('log').hasAttribute('aria-busy')).toBe(false);
  });

  it('announces a running agent once', () => {
    render(
      <AgentRun
        title="Build"
        state="running"
        steps={[{ id: 'a', label: 'Compile', state: 'running' }]}
      />,
    );
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(1);
    expect(statuses[0]!.textContent).toBe('Running');
  });
});

describe('MessageActions', () => {
  it('is a labelled group with translatable names', () => {
    render(
      <MessageActions
        copyText="x"
        onRegenerate={() => {}}
        labels={{ group: 'Actions', regenerate: 'Regenerar' }}
      />,
    );
    expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
    expect(screen.queryByRole('toolbar')).toBeNull();
    expect(screen.getByRole('button', { name: 'Regenerar' })).toBeTruthy();
  });
});

describe('forwardRef on agent components', () => {
  it('passes refs to the root element', () => {
    const refs = Array.from({ length: 5 }, () => React.createRef<HTMLElement>());
    render(
      <>
        <AgentRun ref={refs[0]} title="t" state="queued" steps={[]} />
        <AgentPlan ref={refs[1]} title="t" steps={[]} />
        <AskUser
          ref={refs[2] as React.Ref<HTMLFormElement>}
          title="t"
          questions={[]}
          onSubmit={() => {}}
        />
        <AvatarUpload
          ref={refs[3] as React.Ref<HTMLDivElement>}
          name="Ada"
          onUpload={async () => {}}
        />
        <ContextUsage ref={refs[4] as React.Ref<HTMLDivElement>} used={1} limit={10} />
      </>,
    );
    for (const r of refs) expect(r.current).toBeInstanceOf(HTMLElement);
  });
});
