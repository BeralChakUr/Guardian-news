import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  trend?: number; // percentage change (positive/negative)
  color?: 'cyan' | 'red' | 'orange' | 'yellow' | 'emerald' | 'purple';
  testId?: string;
}

const palette = {
  cyan: { bg: 'bg-cyan-500/10', ring: 'border-cyan-500/30', icon: 'text-cyan-400' },
  red: { bg: 'bg-red-500/10', ring: 'border-red-500/30', icon: 'text-red-400' },
  orange: { bg: 'bg-orange-500/10', ring: 'border-orange-500/30', icon: 'text-orange-400' },
  yellow: { bg: 'bg-yellow-500/10', ring: 'border-yellow-500/30', icon: 'text-yellow-400' },
  emerald: { bg: 'bg-emerald-500/10', ring: 'border-emerald-500/30', icon: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', ring: 'border-purple-500/30', icon: 'text-purple-400' },
};

export default function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  color = 'cyan',
  testId,
}: KpiCardProps) {
  const c = palette[color];
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? '' : trend > 0 ? 'text-orange-400' : trend < 0 ? 'text-emerald-400' : 'text-slate-400';

  return (
    <div
      className={`rounded-2xl border ${c.ring} ${c.bg} backdrop-blur-sm p-4 md:p-5 transition-all hover:border-opacity-60`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
            {label}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white leading-tight">{value}</div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className={`rounded-xl p-2 ${c.bg} ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== undefined && TrendIcon && (
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {trend > 0 ? '+' : ''}
          {trend}%
          <span className="text-slate-500 font-normal ml-1">vs période préc.</span>
        </div>
      )}
    </div>
  );
}
