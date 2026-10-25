import { HoverCard, HoverCardContent, HoverCardTrigger } from '@burtson-labs/ui';

export default function HoverCardDemo() {
  return (
    <p className="max-w-md text-sm leading-6">
      Remote staff may claim up to $500 a year for equipment, per the{' '}
      <HoverCard>
        <HoverCardTrigger
          href="#expense-policy"
          className="font-medium text-brand underline underline-offset-4"
        >
          expense policy
        </HoverCardTrigger>
        <HoverCardContent className="grid gap-2">
          <p className="font-semibold">Expense policy: equipment and software</p>
          <p className="text-muted-foreground">
            Purchases over $200 need a receipt uploaded within 30 days. Updated Aug 2026.
          </p>
          <a href="#expense-policy" className="text-brand underline underline-offset-4">
            Open the policy
          </a>
        </HoverCardContent>
      </HoverCard>
      .
    </p>
  );
}
