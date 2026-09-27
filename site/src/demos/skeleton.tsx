import { Skeleton } from '@burtson-labs/ui';

export default function SkeletonDemo() {
  return (
    <div className="grid w-full max-w-lg gap-6">
      {(['pulse', 'shimmer', 'none'] as const).map((animation) => (
        <div key={animation} className="grid gap-3">
          <p className="text-xs font-medium capitalize text-muted-foreground">
            {animation === 'none' ? 'Static' : animation}
          </p>
          <div className="flex gap-4">
            <Skeleton animation={animation} className="size-10 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton animation={animation} className="h-3 w-2/3" />
              <Skeleton animation={animation} className="h-3 w-full" />
              <Skeleton animation={animation} className="h-3 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
