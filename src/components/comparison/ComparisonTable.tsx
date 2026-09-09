import type { Fighter, FighterStats as FighterStatsType } from '../../types';

interface ComparisonTableProps {
  fighter1: Fighter;
  fighter2: Fighter;
  stats1: FighterStatsType;
  stats2: FighterStatsType;
}

export function ComparisonTable({
  fighter1,
  fighter2,
  stats1,
  stats2,
}: ComparisonTableProps) {
  const formatPercent = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return `${(num * 100).toFixed(0)}%`;
  };

  const comparisons = [
    {
      label: 'Record',
      val1: `${fighter1.record?.wins ?? fighter1.recordWins}-${fighter1.record?.losses ?? fighter1.recordLosses}-${fighter1.record?.draws ?? fighter1.recordDraws}`,
      val2: `${fighter2.record?.wins ?? fighter2.recordWins}-${fighter2.record?.losses ?? fighter2.recordLosses}-${fighter2.record?.draws ?? fighter2.recordDraws}`,
    },
    {
      label: 'Height',
      val1: fighter1.heightInches ? `${Math.floor(Number(fighter1.heightInches) / 12)}'${Number(fighter1.heightInches) % 12}"` : 'N/A',
      val2: fighter2.heightInches ? `${Math.floor(Number(fighter2.heightInches) / 12)}'${Number(fighter2.heightInches) % 12}"` : 'N/A',
    },
    {
      label: 'Weight',
      val1: fighter1.weightLbs ? `${fighter1.weightLbs} lbs` : 'N/A',
      val2: fighter2.weightLbs ? `${fighter2.weightLbs} lbs` : 'N/A',
    },
    {
      label: 'Reach',
      val1: fighter1.reachInches ? `${fighter1.reachInches}"` : 'N/A',
      val2: fighter2.reachInches ? `${fighter2.reachInches}"` : 'N/A',
    },
    {
      label: 'Sig. Strikes Landed',
      val1: stats1.significantStrikesLanded,
      val2: stats2.significantStrikesLanded,
      higher: 'better',
    },
    {
      label: 'Striking Accuracy',
      val1: formatPercent(stats1.strikingAccuracy),
      val2: formatPercent(stats2.strikingAccuracy),
      higher: 'better',
    },
    {
      label: 'Strikes/Min',
      val1: Number(stats1.sigStrikesLandedPerMin).toFixed(1),
      val2: Number(stats2.sigStrikesLandedPerMin).toFixed(1),
      higher: 'better',
    },
    {
      label: 'Takedowns Landed',
      val1: stats1.takedownsLanded,
      val2: stats2.takedownsLanded,
      higher: 'better',
    },
    {
      label: 'Takedown Accuracy',
      val1: formatPercent(stats1.takedownAccuracy),
      val2: formatPercent(stats2.takedownAccuracy),
      higher: 'better',
    },
    {
      label: 'Takedown Defense',
      val1: formatPercent(stats1.takedownDefense),
      val2: formatPercent(stats2.takedownDefense),
      higher: 'better',
    },
    {
      label: 'Sig. Strike Defense',
      val1: formatPercent(stats1.sigStrikeDefense),
      val2: formatPercent(stats2.sigStrikeDefense),
      higher: 'better',
    },
    {
      label: 'Knockdown Avg',
      val1: Number(stats1.knockdownAvg).toFixed(2),
      val2: Number(stats2.knockdownAvg).toFixed(2),
      higher: 'better',
    },
  ];

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 gap-4 p-4 border-b border-border">
        <div className="text-right">
          <div className="font-semibold text-text-primary">{fighter1.name}</div>
        </div>
        <div className="text-center text-text-muted text-sm">VS</div>
        <div className="text-left">
          <div className="font-semibold text-text-primary">{fighter2.name}</div>
        </div>
      </div>
      <div className="divide-y divide-border">
        {comparisons.map((comp) => (
          <div key={comp.label} className="grid grid-cols-3 gap-4 px-4 py-3">
            <div className="text-right font-medium text-text-primary">
              {comp.val1}
            </div>
            <div className="text-center text-text-muted text-sm">
              {comp.label}
            </div>
            <div className="text-left font-medium text-text-primary">
              {comp.val2}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
