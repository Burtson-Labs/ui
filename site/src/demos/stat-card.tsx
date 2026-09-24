import Activity from '@burtson-labs/icons/react/activity';
import Cpu from '@burtson-labs/icons/react/cpu';
import ShieldProof from '@burtson-labs/icons/react/shield-proof';

import { StatCard, Status } from '@burtson-labs/ui';

export default function StatCardDemo() {
  return (
    <div className="@container w-full max-w-2xl">
      <div className="grid gap-3 @md:grid-cols-3">
        <StatCard
          label="Agent runs"
          value="1,284"
          detail="last 7 days"
          icon={<Activity />}
          trend={<span className="text-success">+12% vs last week</span>}
        />
        <StatCard label="Tokens" value="38.2M" detail="gemma4:e4b, local" icon={<Cpu />} />
        <StatCard
          label="Audit score"
          value="9.3"
          detail="security 10/10"
          icon={<ShieldProof />}
          trend={<Status status="success">Gate passing</Status>}
        />
      </div>
    </div>
  );
}
