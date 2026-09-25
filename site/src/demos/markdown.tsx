import { Markdown } from '@burtson-labs/ui';

const reply = `### Release checklist

1. Bump **version** in \`package.json\`
2. Run the full check
3. Tag and push

\`\`\`bash
npm run check && git tag v0.6.0 && git push --tags
\`\`\`

> Links only keep safe targets: [release notes](https://github.com/Burtson-Labs/ui/releases).`;

export default function MarkdownDemo() {
  return <Markdown className="w-full max-w-xl">{reply}</Markdown>;
}
