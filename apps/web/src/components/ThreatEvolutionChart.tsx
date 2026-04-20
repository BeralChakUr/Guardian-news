import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Clock, Calendar, CalendarDays } from 'lucide-react';
import { getTimelineByPeriod, type TimelineBucket } from '../services/newsService';

type Period = '24h' | '7d' | '30d';

const periodOptions: { id: Period; label: string; icon: any }[] = [
  { id: '24h', label: '24h', icon: Clock },
  { id: '7d', label: '7 jours', icon: Calendar },
  { id: '30d', label: '30 jours', icon: CalendarDays },
];

const formatXAxis = (value: string, period: Period) => {
  if (!value) return '';
  if (period === '24h') {
    // "2026-04-20 14:00" → "14h"
    const match = value.match(/ (\d{2}):00$/);
    return match ? `${match[1]}h` : value;
  }
  // "2026-04-20" → "20/04"
  const parts = value.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
};

export default function ThreatEvolutionChart() {
  const [period, setPeriod] = useState<Period>('7d');

  const { data, isLoading } = useQuery({
    queryKey: ['timeline-period', period],
    queryFn: () => getTimelineByPeriod(period),
    staleTime: 60_000,
  });

  const chartData = useMemo(() => {
    const buckets: TimelineBucket[] = data?.data ?? [];
    return buckets.map((b) => ({
      ...b,
      label: formatXAxis(b.date, period),
    }));
  }, [data, period]);

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 md:p-6"
      data-testid="threat-evolution-chart"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Évolution des menaces</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Répartition par gravité sur {period === '24h' ? '24 heures' : period === '7d' ? '7 jours' : '30 jours'}
            {data && ` · ${data.total} incidents`}
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Période"
          className="inline-flex rounded-xl border border-slate-700 bg-slate-800/50 p-1 self-start"
        >
          {periodOptions.map((opt) => {
            const Icon = opt.icon;
            const active = period === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(opt.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-cyan-500 text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                data-testid={`period-${opt.id}`}
              >
                <Icon className="h-3 w-3" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-64">
        {isLoading && (
          <div className="h-full rounded-xl bg-slate-800/40 animate-pulse" />
        )}
        {!isLoading && chartData.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Aucune donnée disponible pour cette période
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area
                type="monotone"
                dataKey="critical"
                name="Critique"
                stackId="1"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#gradCritical)"
              />
              <Area
                type="monotone"
                dataKey="high"
                name="Élevé"
                stackId="1"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#gradHigh)"
              />
              <Area
                type="monotone"
                dataKey="medium"
                name="Moyen"
                stackId="1"
                stroke="#eab308"
                strokeWidth={2}
                fill="url(#gradMedium)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
