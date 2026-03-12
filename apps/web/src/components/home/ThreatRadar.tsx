import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Radar, AlertCircle } from 'lucide-react';
import { getDashboardRadar } from '../../services/newsService';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function ThreatRadar() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-radar'],
    queryFn: getDashboardRadar,
    staleTime: 60000,
  });

  // Transform data for Recharts
  const chartData = data?.categories.map(cat => ({
    subject: cat.name,
    value: Math.min(cat.value * 2, 100), // Scale for visibility
    fullMark: 100,
  })) || [];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950" data-testid="threat-radar-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <Radar className="w-7 h-7 text-cyan-400" />
              Radar des Menaces
            </h2>
            <p className="text-slate-400 mt-2">Distribution des types de menaces détectées</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl bg-slate-900/50 border border-slate-700/50 p-6 overflow-hidden">
              {/* Background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
              
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-slate-700 animate-pulse" />
                </div>
              ) : isError ? (
                <div className="h-80 flex flex-col items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-slate-400">Impossible de charger le radar</p>
                </div>
              ) : (
                <div className="relative z-10">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                      <RechartsRadar
                        name="Menaces"
                        dataKey="value"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Legend */}
            {!isLoading && !isError && data && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.categories.slice(0, 8).map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-xs text-slate-400">{cat.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{cat.value}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
