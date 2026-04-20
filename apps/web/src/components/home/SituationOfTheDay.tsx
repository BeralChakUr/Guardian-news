import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, Activity, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import { getDashboardSummary, getTension, getTopThreats } from '../../services/newsService';

const severityColor: Record<string, { bg: string; text: string; dot: string }> = {
  critique: { bg: 'bg-red-500/15', text: 'text-red-300', dot: 'bg-red-500' },
  eleve: { bg: 'bg-orange-500/15', text: 'text-orange-300', dot: 'bg-orange-500' },
  moyen: { bg: 'bg-yellow-500/15', text: 'text-yellow-300', dot: 'bg-yellow-500' },
  faible: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', dot: 'bg-emerald-500' },
};

const severityLabel: Record<string, string> = {
  critique: 'Critique', eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible',
};

const tensionColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'critique': return { bg: 'from-red-500/20 to-red-900/10', border: 'border-red-500/40', text: 'text-red-300', dot: 'bg-red-500' };
    case 'élevé':
    case 'eleve': return { bg: 'from-orange-500/20 to-orange-900/10', border: 'border-orange-500/40', text: 'text-orange-300', dot: 'bg-orange-500' };
    case 'modéré':
    case 'modere': return { bg: 'from-yellow-500/20 to-yellow-900/10', border: 'border-yellow-500/40', text: 'text-yellow-300', dot: 'bg-yellow-500' };
    default: return { bg: 'from-emerald-500/20 to-emerald-900/10', border: 'border-emerald-500/40', text: 'text-emerald-300', dot: 'bg-emerald-500' };
  }
};

export default function SituationOfTheDay() {
  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
    staleTime: 60_000,
  });

  const { data: tension } = useQuery({
    queryKey: ['tension-homepage'],
    queryFn: getTension,
    staleTime: 60_000,
  });

  const { data: topThreats, isLoading: threatsLoading } = useQuery({
    queryKey: ['top-threats-3'],
    queryFn: () => getTopThreats(3),
    staleTime: 60_000,
  });

  const level = tension?.level ?? summary?.tension_level ?? 'Modéré';
  const score = tension?.score ?? summary?.tension_score ?? 0;
  const colors = tensionColor(level);

  const executiveSummary = summary
    ? `${summary.kpis.articles_today} nouvelles alertes aujourd'hui · ${summary.kpis.articles_7days} sur 7 jours · ${summary.kpis.critical_alerts} critiques total · ${summary.kpis.active_sources} sources surveillées.`
    : 'Chargement du résumé exécutif…';

  return (
    <section className="py-10" data-testid="situation-of-the-day">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} backdrop-blur-sm`}
        >
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 mb-3">
                  <Activity className="h-3 w-3" />
                  Situation du jour
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  Niveau de menace : <span className={colors.text}>{level}</span>
                </h2>
                <p className="text-slate-300 mt-2 max-w-2xl text-sm md:text-base">{executiveSummary}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-5xl font-bold ${colors.text}`}>{score}</div>
                  <div className="text-xs text-slate-400">/ 100</div>
                </div>
                <div className={`relative h-4 w-4 rounded-full ${colors.dot}`}>
                  <div className={`absolute inset-0 rounded-full ${colors.dot} animate-ping opacity-75`} />
                </div>
              </div>
            </div>

            {/* Top 3 Threats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {threatsLoading && (
                <>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </>
              )}
              {!threatsLoading && (topThreats?.threats ?? []).map((t, idx) => {
                const sev = severityColor[t.severity] ?? severityColor.faible;
                return (
                  <Link
                    key={t.id || idx}
                    to={`/dashboard/news/${t.id}`}
                    className="group relative rounded-xl border border-white/10 bg-slate-900/60 p-4 transition-all hover:border-cyan-500/40 hover:bg-slate-900/80"
                    data-testid={`top-threat-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sev.bg} ${sev.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
                          {severityLabel[t.severity] ?? t.severity}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-colors group-hover:text-cyan-400" />
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-white leading-snug">{t.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span>{t.source}</span>
                      {t.attack_type && (
                        <>
                          <span>·</span>
                          <span className="capitalize">{t.attack_type}</span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
              {!threatsLoading && (topThreats?.threats ?? []).length === 0 && (
                <div className="col-span-3 text-center text-slate-400 text-sm py-6">
                  Aucune menace majeure identifiée aujourd'hui.
                </div>
              )}
            </div>

            {/* CTA row */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {summary?.kpis.active_sources ?? '—'} sources
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {summary?.kpis.critical_alerts ?? '—'} critiques
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {summary?.kpis.articles_7days ?? '—'} / 7j
                </span>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/dashboard/news"
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition-colors"
                  data-testid="situation-voir-toutes"
                >
                  Voir toutes les alertes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 hover:border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Tableau de bord
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
