import { Badge } from '@burtson-labs/ui';

export default function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="brand">Brand</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Passing</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="destructive">Failed</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}
