import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Swords } from 'lucide-react';
import { apiRequest } from '../services/apiClient';

interface DistributionResponse {
  data: { name: string; value: number; percentage: number }[];
  total: number;
}

const colorPalette = [
  '#ef4444', // red - ransomware
  '#f97316', // orange - phishing
  '#eab308', // yellow - vuln
  '#06b6d4', // cyan - malware
  '#a855f7', // purple - data_leak
  '#22c55e', // green - scam
  '#3b82f6', // blue - apt
  '#ec4899', // pink - ddos
  '#64748b', // slate - other
];

const labelMap: Record<string, string> = {
  phishing: 'Phishing',
  ransomware: 'Ransomware',
  malware: 'Malware',
  vuln: 'Vulnérabilité',
  data_leak: 'Fuite',
  scam: 'Arnaque',
  apt: 'APT',
  ddos: 'DDoS',
  other: 'Autre',
};

export default function AttackTypeBarChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['by-attack-type'],
    queryFn: () => apiRequest<DistributionResponse>('/api/dashboard/by-attack-type'),
    staleTime: 60_000,
  });

  const chartData = (data?.data ?? []).map((d, i) => ({
    name: labelMap[d.name] ?? d.name,
    count: d.value,
    percentage: d.percentage,
    color: colorPalette[i % colorPalette.length],
  }));

  return (
    <div
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 md:p-6"
      data-testid="chart-by-attack-type"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Swords className="h-5 w-5 text-orange-400" />
          Types d'attaques
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Répartition des articles par type d'attaque
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
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                formatter={(value: any, _name: any, item: any) => [
                  `${value} (${item?.payload?.percentage ?? 0}%)`,
                  'Articles',
                ]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
