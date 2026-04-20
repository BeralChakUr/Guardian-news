import { useQuery } from '@tanstack/react-query';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Globe } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface DistributionResponse {
  data: { name: string; value: number; percentage: number }[];
  total: number;
}

const colorPalette = [
  '#06b6d4', '#f97316', '#a855f7', '#22c55e',
  '#eab308', '#ef4444', '#3b82f6', '#ec4899', '#64748b',
];

interface CountryPieChartProps {
  endpoint?: string;
  title?: string;
  subtitle?: string;
  testId?: string;
}

export default function CountryPieChart({
  endpoint = '/api/dashboard/by-country',
  title = "Répartition par pays",
  subtitle = "Articles par pays d'origine",
  testId = 'chart-by-country',
}: CountryPieChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['pie-chart', endpoint],
    queryFn: () => apiRequest<DistributionResponse>(endpoint),
    staleTime: 60_000,
  });

  const chartData = (data?.data ?? []).slice(0, 8).map((d, i) => ({
    name: d.name || 'Inconnu',
    value: d.value,
    percentage: d.percentage,
    fill: colorPalette[i % colorPalette.length],
  }));

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 md:p-6"
      data-testid={testId}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan-400" />
          {title}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {subtitle}
          {data && ` · ${data.total} au total`}
        </p>
      </div>
      <div className="h-64">
        {isLoading && <div className="h-full rounded-xl bg-slate-800/40 animate-pulse" />}
        {!isLoading && chartData.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Aucune donnée
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={2}
                stroke="#0f172a"
                strokeWidth={2}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any, _name: any, item: any) => [
                  `${value} articles (${item?.payload?.percentage ?? 0}%)`,
                  item?.payload?.name ?? '',
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
