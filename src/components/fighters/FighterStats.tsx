import type { FighterStats as FighterStatsType } from '../../types';

interface FighterStatsProps {
  stats: FighterStatsType;
}

function formatPercent(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return `${(num * 100).toFixed(0)}%`;
}

function formatAvg(val: number | string): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return num.toFixed(2);
}

export function FighterStats({ stats }: FighterStatsProps) {
  const winsByMethod = stats.winsByMethod || {};
  const koCount = winsByMethod['ko-tko']?.count ?? 0;
  const subCount = winsByMethod['sub']?.count ?? 0;
  const decCount = winsByMethod['dec']?.count ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Striking"
        stats={[
          {
            label: 'Sig. Strikes Landed',
            value: stats.significantStrikesLanded.toString(),
          },
          {
            label: 'Accuracy',
            value: formatPercent(stats.strikingAccuracy),
          },
          {
            label: 'Strikes/Min',
            value: formatAvg(stats.sigStrikesLandedPerMin),
          },
          {
            label: 'Knockdown Avg',
            value: formatAvg(stats.knockdownAvg),
          },
        ]}
      />
      <StatCard
        title="Grappling"
        stats={[
          {
            label: 'Takedowns Landed',
            value: stats.takedownsLanded.toString(),
          },
          {
            label: 'Takedown Accuracy',
            value: formatPercent(stats.takedownAccuracy),
          },
          {
            label: 'Takedown Defense',
            value: formatPercent(stats.takedownDefense),
          },
          {
            label: 'Submission Avg',
            value: formatAvg(stats.submissionAvgPer15Min),
          },
        ]}
      />
      <StatCard
        title="Win Methods"
        stats={[
          { label: 'KO/TKO', value: koCount.toString() },
          { label: 'Submissions', value: subCount.toString() },
          { label: 'Decision', value: decCount.toString() },
          {
            label: 'Sig. Strike Defense',
            value: formatPercent(stats.sigStrikeDefense),
          },
        ]}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  stats: { label: string; value: string }[];
}

function StatCard({ title, stats }: StatCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-lg p-4">
      <h3 className="text-text-primary font-semibold mb-3">{title}</h3>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="text-text-muted">{stat.label}</span>
            <span className="text-text-primary font-medium">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
