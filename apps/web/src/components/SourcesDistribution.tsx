import { useQuery } from '@tanstack/react-query';
import { Globe, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface SourceItem {
  name: string;
  value: number;
  percentage: number;
}

interface SourceDistributionResponse {
  data: SourceItem[];
  total: number;
  bias_warning: boolean;
  dominant_source?: string | null;
}

const palette = [
  '#06b6d4', '#f97316', '#a855f7', '#22c55e',
  '#eab308', '#ef4444', '#3b82f6', '#ec4899',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#64748b',
];

export default function SourcesDistribution({ limit = 10 }: { limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['by-source'],
    queryFn: () => apiRequest<SourceDistributionResponse>('/api/dashboard/by-source'),
    staleTime: 60_000,
  });

  const items = (data?.data ?? []).slice(0, limit);

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 md:p-6"
      data-testid="sources-distribution"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            Sources surveillées
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Répartition des articles par source OSINT
            {data && ` · ${data.total} articles · ${data.data.length} sources`}
          </p>
        </div>
        {data?.bias_warning && (
          <div className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/30 px-2 py-1 text-[10px] font-semibold text-orange-300">
            <AlertCircle className="h-3 w-3" />
            Biais détecté : {data.dominant_source}
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {isLoading && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded-lg bg-slate-800/40 animate-pulse" />
            ))}
          </>
        )}
        {!isLoading && items.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-6">Aucune source détectée</div>
        )}
        {!isLoading &&
          items.map((s, idx) => {
            const color = palette[idx % palette.length];
            const isDominant = data?.bias_warning && s.name === data?.dominant_source;
            return (
              <div key={s.name} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-slate-200 truncate">{s.name}</span>
                    {isDominant && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400">
                        dominant
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {s.value}{' '}
                    <span className="text-slate-600">({s.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                    style={{
                      width: `${Math.max(s.percentage, 2)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
