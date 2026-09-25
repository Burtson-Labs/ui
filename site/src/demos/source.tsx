import { SourceCitation, SourceList, type Source } from '@burtson-labs/ui';

const sources: Source[] = [
  {
    id: 'handbook',
    title: 'Employee handbook 2026',
    snippet: 'Remote staff may claim up to $500 a year for home office equipment.',
    meta: 'page 14',
  },
  {
    id: 'policy',
    title: 'Expense policy: equipment and software',
    url: 'https://example.com/policies/expenses',
    snippet: 'Purchases over $200 need a receipt uploaded within 30 days.',
    meta: 'Updated Aug 2026',
  },
];

export default function SourceDemo() {
  return (
    <div className="grid w-full max-w-xl gap-4 text-sm leading-6">
      <p>
        You can claim up to $500 a year for home office equipment
        <SourceCitation index={1} source={sources[0]!} />, and anything over $200 needs a receipt
        within 30 days
        <SourceCitation index={2} source={sources[1]!} />.
      </p>
      <SourceList sources={sources} />
    </div>
  );
}
