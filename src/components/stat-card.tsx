import * as React from 'react';

import { cn } from '../lib/utils';

import { Card } from './card';

export interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  detail?: React.ReactNode;
  trend?: React.ReactNode;
}

function StatCard({ label, value, icon, detail, trend, className, ...props }: StatCardProps) {
  return (
    <Card density="compact" className={cn('min-w-0', className)} {...props}>
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {label}
          </div>
          <div className="mt-1 truncate text-2xl font-semibold tracking-[-0.035em] text-foreground">
            {value}
          </div>
          {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
        </div>
        {icon ? (
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand/15 bg-brand-soft text-brand [&_svg]:size-4.5">
            {icon}
          </div>
        ) : null}
      </div>
      {trend ? <div className="border-t border-border px-4 py-2.5 text-xs">{trend}</div> : null}
    </Card>
  );
}

export { StatCard };
