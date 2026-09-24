import { ScrollArea, Separator } from '@burtson-labs/ui';

const tags = Array.from({ length: 40 }, (_, i) => `v1.7.${470 - i}`);

export default function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-56 w-48 rounded-md border">
      <div className="p-4">
        <p className="mb-3 text-sm font-medium">Releases</p>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="font-mono text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
