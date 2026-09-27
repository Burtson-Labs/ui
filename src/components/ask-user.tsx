import HelpCircle from '@burtson-labs/icons/react/help-circle';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import { Textarea } from './textarea';

export interface AskUserOption {
  value: string;
  label: string;
  description?: string;
}
export interface AskUserQuestion {
  id: string;
  prompt: string;
  description?: string;
  options?: AskUserOption[];
  multiple?: boolean;
  /** Adds an alternative free-text answer to a choice question. */
  allowCustom?: boolean;
  /** Questions are required unless explicitly marked optional. */
  required?: boolean;
}
export interface AskUserAnswer {
  selected: string[];
  text: string;
}
export type AskUserAnswers = Record<string, AskUserAnswer>;
export interface AskUserProps extends Omit<
  React.ComponentProps<'form'>,
  'title' | 'onSubmit' | 'defaultValue'
> {
  title?: string;
  description?: React.ReactNode;
  questions: AskUserQuestion[];
  /** Initial answers. Remount with a new key for a different request. */
  defaultValue?: AskUserAnswers;
  onSubmit: (answers: AskUserAnswers) => void | Promise<void>;
  onSkip?: () => void;
  busy?: boolean;
  submitLabel?: string;
  skipLabel?: string;
}

/** An agent's request for clarification. Answers remain editable when submission fails. */
export function AskUser({
  title = 'A question before I continue',
  description,
  questions,
  defaultValue = {},
  onSubmit,
  onSkip,
  busy = false,
  submitLabel = 'Send answers',
  skipLabel = 'Skip for now',
  className,
  ...props
}: AskUserProps) {
  const id = React.useId();
  const [answers, setAnswers] = React.useState<AskUserAnswers>(defaultValue);
  const [pending, setPending] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');
  const [invalid, setInvalid] = React.useState<string[]>([]);
  const submitting = React.useRef(false);
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const disabled = busy || pending || submitted;
  const answerFor = (q: AskUserQuestion): AskUserAnswer => {
    const value = answers[q.id];
    const selected = (value?.selected ?? []).filter((v) => q.options?.some((o) => o.value === v));
    return {
      selected: q.multiple ? selected : selected.slice(0, 1),
      text: q.allowCustom || !q.options?.length ? (value?.text ?? '').trim() : '',
    };
  };
  const update = (question: string, value: AskUserAnswer) => {
    setAnswers((previous) => ({ ...previous, [question]: value }));
    setInvalid((previous) => previous.filter((q) => q !== question));
    setError('');
  };
  return (
    <form
      data-slot="ask-user"
      aria-labelledby={`${id}-title`}
      aria-busy={pending || busy || undefined}
      className={cn('grid min-w-0 gap-5 rounded-lg border border-border bg-surface p-5', className)}
      {...props}
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled || submitting.current) return;
        const missing = questions
          .filter(
            (q) => q.required !== false && !answerFor(q).selected.length && !answerFor(q).text,
          )
          .map((q) => q.id);
        setInvalid(missing);
        if (missing.length) {
          setError('Answer the required questions to continue.');
          event.currentTarget
            .querySelector<HTMLElement>(
              `[data-question-index="${questions.findIndex((q) => q.id === missing[0])}"] input, [data-question-index="${questions.findIndex((q) => q.id === missing[0])}"] textarea`,
            )
            ?.focus();
          return;
        }
        submitting.current = true;
        setPending(true);
        setError('');
        void (async () => {
          try {
            await onSubmit(Object.fromEntries(questions.map((q) => [q.id, answerFor(q)])));
            if (mounted.current) setSubmitted(true);
          } catch (cause) {
            if (mounted.current)
              setError(
                cause instanceof Error ? cause.message : 'Answers could not be sent. Try again.',
              );
          } finally {
            submitting.current = false;
            if (mounted.current) setPending(false);
          }
        })();
      }}
    >
      <div className="flex items-start gap-3">
        <HelpCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
        <div className="grid min-w-0 gap-1">
          <h3 id={`${id}-title`} className="text-sm font-semibold break-words">
            {title}
          </h3>
          {description && (
            <div className="text-sm leading-relaxed text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {questions.map((question, index) => {
        const value = answers[question.id] ?? { selected: [], text: '' };
        const custom = Boolean(question.allowCustom && value.text);
        const invalidQuestion = invalid.includes(question.id);
        const questionId = `${id}-${index}`;
        return (
          <fieldset
            key={question.id}
            disabled={disabled}
            data-question-index={index}
            className="grid min-w-0 gap-2"
            aria-describedby={
              invalidQuestion
                ? `${questionId}-error`
                : question.description
                  ? `${questionId}-description`
                  : undefined
            }
          >
            <legend className="mb-2 text-sm font-medium break-words">
              {question.prompt}
              {question.required !== false && <span className="sr-only"> (required)</span>}
              {question.required === false && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
              )}
            </legend>
            {question.description && (
              <p id={`${questionId}-description`} className="text-xs text-muted-foreground">
                {question.description}
              </p>
            )}
            {question.options?.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-md border p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                  value.selected.includes(option.value) && !custom
                    ? 'border-brand bg-brand-soft'
                    : 'border-border hover:bg-muted',
                  disabled && 'cursor-default opacity-70',
                )}
              >
                <input
                  type={question.multiple ? 'checkbox' : 'radio'}
                  name={questionId}
                  value={option.value}
                  checked={!custom && value.selected.includes(option.value)}
                  className={'mt-0.5 size-4 shrink-0 accent-brand outline-none'}
                  onChange={() =>
                    update(question.id, {
                      text: '',
                      selected: question.multiple
                        ? value.selected.includes(option.value)
                          ? value.selected.filter((v) => v !== option.value)
                          : [...value.selected, option.value]
                        : [option.value],
                    })
                  }
                />
                <span className="grid min-w-0 gap-1 text-sm break-words">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
              </label>
            ))}
            {(!question.options?.length || question.allowCustom) && (
              <label className="grid gap-2 text-xs font-medium text-muted-foreground">
                {question.options?.length ? 'Or write your own answer' : 'Your answer'}
                <Textarea
                  value={value.text}
                  rows={2}
                  aria-invalid={invalidQuestion || undefined}
                  aria-describedby={invalidQuestion ? `${questionId}-error` : undefined}
                  onChange={(event) =>
                    update(question.id, { selected: [], text: event.target.value })
                  }
                />
              </label>
            )}
            {invalidQuestion && (
              <p id={`${questionId}-error`} className="text-xs text-destructive">
                An answer is required.
              </p>
            )}
          </fieldset>
        );
      })}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
        <p role="status" className="mr-auto text-sm text-muted-foreground">
          {submitted ? 'Answers sent' : pending ? 'Sending answers…' : ''}
        </p>
        {!submitted && onSkip && (
          <Button variant="ghost" disabled={disabled} onClick={onSkip}>
            {skipLabel}
          </Button>
        )}
        {!submitted && (
          <Button type="submit" loading={pending} disabled={disabled || questions.length === 0}>
            {submitLabel}
          </Button>
        )}
      </div>
    </form>
  );
}
