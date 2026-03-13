import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Shield, Activity, Database, Wifi } from 'lucide-react';
import { getDashboardMetrics } from '../../services/newsService';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const mockTrendData = [
  { day: 'L', value: 65 },
  { day: 'M', value: 72 },
  { day: 'M', value: 68 },
  { day: 'J', value: 85 },
  { day: 'V', value: 78 },
  { day: 'S', value: 82 },
  { day: 'D', value: 90 },
];

function MetricCard({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default function ThreatLevelCard() {
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
    staleTime: 60000,
  });

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
    if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/50' };
    return { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' };
  };

  if (isLoading) {
    return (
      <section id="threat-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />
        </div>
      </section>
    );
  }

  if (isError || !metrics) {
    return (
      <section id="threat-section" className="py-16">
        <div className="container mx-auto px-4">
          <div className="p-8 rounded-2xl bg-slate-800/50 border border-red-500/30 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-400">Impossible de charger les données</p>
          </div>
        </div>
      </section>
    );
  }

  const scoreColor = getScoreColor(metrics.score);

  return (
    <section id="threat-section" className="py-16 relative" data-testid="threat-level-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 p-8"
        >
          {/* Glow effect */}
          <div className={`absolute top-0 right-0 w-64 h-64 ${scoreColor.bg}/10 rounded-full blur-3xl`} />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-cyan-400" />
                  Niveau de Menace Global
                </h2>
                <p className="text-slate-400">Basé sur l'analyse de {metrics.active_alerts} alertes actives</p>
              </div>
              
              {/* Score indicator */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${scoreColor.text}`}>{metrics.score}</div>
                  <div className="text-sm text-slate-400">/ 100</div>
                </div>
                <div className={`relative w-4 h-4 rounded-full ${scoreColor.bg} animate-pulse shadow-lg ${scoreColor.glow}`}>
                  <div className={`absolute inset-0 rounded-full ${scoreColor.bg} animate-ping opacity-75`} />
                </div>
                <div className={`px-4 py-2 rounded-full ${scoreColor.bg}/20 ${scoreColor.text} font-semibold`}>
                  {metrics.threat_level}
                </div>
              </div>
            </div>
            
            {/* Metrics grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                icon={AlertTriangle}
                value={metrics.active_alerts}
                label="Alertes actives"
                color="bg-red-500/20 text-red-400"
              />
              <MetricCard
                icon={Shield}
                value={metrics.critical_vulnerabilities}
                label="Vulnérabilités critiques"
                color="bg-orange-500/20 text-orange-400"
              />
              <MetricCard
                icon={Database}
                value={metrics.monitored_sources}
                label="Sources surveillées"
                color="bg-cyan-500/20 text-cyan-400"
              />
              <MetricCard
                icon={Wifi}
                value="24/7"
                label="Surveillance active"
                color="bg-green-500/20 text-green-400"
              />
            </div>
            
            {/* Trend chart */}
            <div className="h-24">
              <p className="text-sm text-slate-400 mb-2">Évolution sur 7 jours</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
