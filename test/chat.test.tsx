import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Composer,
  Conversation,
  Markdown,
  Message,
  parseMarkdown,
  Reasoning,
  StreamingIndicator,
  Suggestions,
  ToolApproval,
  ToolCall,
} from '@burtson-labs/ui';

describe('Markdown', () => {
  it('parses headings, lists, quotes and fenced code', () => {
    const blocks = parseMarkdown(
      '# Title\n\n- a\n- b\n\n1. one\n\n> note\n\n```ts\nconst x = 1;\n```\ntext',
    );
    expect(blocks.map((b) => b.type)).toEqual(['h', 'ul', 'ol', 'quote', 'code', 'p']);
  });

  it('renders inline formatting as elements and never unsafe links', () => {
    const { container } = render(
      <Markdown>
        {
          '**bold** and `code` [ok](https://burtson.ai) [bad](javascript:alert(1)) <img src=x onerror=alert(1)>'
        }
      </Markdown>,
    );
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('code')?.textContent).toBe('code');
    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toBe('https://burtson.ai');
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('gives code blocks a copy button', () => {
    render(<Markdown>{'```bash\nnpm test\n```'}</Markdown>);
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
  });
});

describe('Conversation and Message', () => {
  it('is a polite live log and shows the empty slot without messages', () => {
    const { rerender } = render(<Conversation empty={<p>Say hello</p>}>{[]}</Conversation>);
    const log = screen.getByRole('log', { name: 'Conversation' });
    expect(log.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByText('Say hello')).toBeTruthy();
    rerender(
      <Conversation empty={<p>Say hello</p>}>
        <Message from="user">Hi</Message>
      </Conversation>,
    );
    expect(screen.queryByText('Say hello')).toBeNull();
    expect(screen.getByText('Hi').closest('[data-role]')?.getAttribute('data-role')).toBe('user');
  });
});

describe('Composer', () => {
  it('sends on Enter, adds a line on Shift+Enter, and clears', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await userEvent.type(box, 'line one{Shift>}{Enter}{/Shift}line two{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('line one\nline two');
    expect((box as HTMLTextAreaElement).value).toBe('');
  });

  it('will not send blank text and shows Stop while streaming', async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(<Composer onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(true);
    rerender(<Composer onSubmit={onSubmit} streaming onStop={onStop} />);
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(onStop).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('suggestions send their text', async () => {
    const onSelect = vi.fn();
    render(<Suggestions items={['Rerun the audit']} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Rerun the audit' }));
    expect(onSelect).toHaveBeenCalledWith('Rerun the audit');
  });
});

describe('ToolCall and ToolApproval', () => {
  it('expands to show arguments and result', async () => {
    render(
      <ToolCall
        name="get_load"
        status="success"
        durationMs={1500}
        args={{ id: 'L-1' }}
        result={{ ok: true }}
      />,
    );
    expect(screen.getByText('1.5s', { exact: false })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /get_load/ }));
    expect(screen.getByText(/"id": "L-1"/)).toBeTruthy();
    expect(screen.getByText(/"ok": true/)).toBeTruthy();
  });

  it('shows errors as alerts', () => {
    render(<ToolCall name="git_push" status="error" error="Rejected" defaultOpen />);
    expect(screen.getByRole('alert').textContent).toBe('Rejected');
  });

  it('asks before running and records the decision', async () => {
    const onApprove = vi.fn();
    const { rerender } = render(
      <ToolApproval name="approve_load" description="Approve L-1042" onApprove={onApprove} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).toHaveBeenCalled();
    rerender(<ToolApproval name="approve_load" description="Approve L-1042" state="approved" />);
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(screen.getByText('Approved')).toBeTruthy();
  });
});

describe('Reasoning and StreamingIndicator', () => {
  it('labels thinking time and typing', () => {
    render(
      <>
        <Reasoning durationMs={3200}>steps</Reasoning>
        <StreamingIndicator />
      </>,
    );
    expect(screen.getByRole('button', { name: /Thought for 3s/ })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Assistant is typing' })).toBeTruthy();
  });
});
