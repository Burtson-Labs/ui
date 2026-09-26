import Activity from '@burtson-labs/icons/react/activity';
import Clock from '@burtson-labs/icons/react/clock';
import Zap from '@burtson-labs/icons/react/zap';

import { StatCard, StatStrip } from '@burtson-labs/ui';

export default function StatCardDemo() {
  return (
    <div className="grid w-full gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Runs today" value="1,284" detail="+12% vs yesterday" icon={<Zap />} />
        <StatCard
          label="Failures"
          value="3"
          icon={<Activity />}
          trend={<span className="text-destructive">2 more than yesterday</span>}
        />
        <StatCard label="Median time" value="2m 14s" icon={<Clock />} />
      </div>
      {/* The same figures as one strip: the phone form of a row of cards. */}
      <StatStrip
        className="sm:max-w-md"
        stats={[
          { label: 'Runs today', value: '1,284', detail: '+12%', href: '#runs' },
          { label: 'Failures', value: '3', detail: '2 more' },
          { label: 'Median', value: '2m 14s' },
        ]}
      />
    </div>
  );
}
