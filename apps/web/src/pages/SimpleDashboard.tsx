import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  AlertTriangle,
  Radio,
  ChevronRight,
  ExternalLink,
  TrendingUp,
  Activity,
  Globe,
  Clock,
  Newspaper,
  Swords,
  Wrench,
  Settings,
  LayoutDashboard,
  Zap,
  Bot,
  Home,
  Building2,
} from 'lucide-react';
import { getNews, getTension, getDashboardSummary, getTopThreats } from '../services/newsService';
import AIThreatSummaryReal from '../components/AIThreatSummaryReal';
import KpiCard from '../components/KpiCard';
import ThreatEvolutionChart from '../components/ThreatEvolutionChart';
import AttackTypeBarChart from '../components/AttackTypeBarChart';
import CountryPieChart from '../components/CountryPieChart';
import SourcesDistribution from '../components/SourcesDistribution';

// Sidebar Navigation
const navItems = [
  { to: '/', icon: Home, label: 'Accueil' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', active: true },
  { to: '/dashboard/news', icon: Newspaper, label: 'Fil d\'actualités' },
  { to: '/dashboard/attaques', icon: Swords, label: 'Attaques' },
  { to: '/dashboard/outils', icon: Wrench, label: 'Outils' },
  { to: '/dashboard/urgence', icon: AlertTriangle, label: 'Urgence' },
  { to: '/dashboard/sources', icon: Globe, label: 'Sources' },
  { to: '/dashboard/parametres', icon: Settings, label: 'Paramètres' },
];

// KPI Card Component
function MetricCard({ 
  icon: Icon, 
  value, 
  label, 
  color = 'cyan',
  trend 
}: { 
  icon: any; 
  value: string | number; 
  label: string; 
  color?: 'cyan' | 'orange' | 'red' | 'green';
  trend?: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/30',
    red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/30',
    green: 'from-green-500/20 to-green-500/5 text-green-400 border-green-500/30',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-5 hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs mt-2 flex items-center gap-1 text-cyan-400">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].split(' ')[2]}`} />
        </div>
      </div>
    </div>
  );
}

// Chart Card Wrapper
function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0D1B2A] border border-gray-800 p-5 hover:border-cyan-500/30 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

export default function SimpleDashboard() {
  const { data: tension, isLoading: tensionLoading } = useQuery({
    queryKey: ['tension'],
    queryFn: getTension,
    staleTime: 5 * 60 * 1000,
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ['news-dashboard'],
    queryFn: () => getNews(1, 50, {}),
    staleTime: 5 * 60 * 1000,
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary-page'],
    queryFn: getDashboardSummary,
    staleTime: 60_000,
  });

  const { data: topThreats } = useQuery({
    queryKey: ['top-threats-dashboard'],
    queryFn: () => getTopThreats(3),
    staleTime: 60_000,
  });

  const news = newsData?.items ?? [];
  const total = newsData?.total ?? 0;

  // Calculate metrics
  const criticalCount = news.filter(n => n.severity === 'critique').length;
  const highCount = news.filter(n => n.severity === 'eleve').length;

  // Latest incidents
  const latestIncidents = news.slice(0, 6).map(n => ({
    time: new Date(n.published_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    source: n.source,
    severity: n.severity,
    description: n.title,
    url: n.url,
  }));

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critique':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">Critique</span>;
      case 'eleve':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">Élevé</span>;
      case 'moyen':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Moyen</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">Faible</span>;
    }
  };

  const getThreatLevelColor = (score: number) => {
    if (score >= 70) return 'red';
    if (score >= 40) return 'orange';
    return 'green';
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex">
      {/* ==================== SIDEBAR ==================== */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#0D1B2A] border-r border-gray-800">
        {/* Logo - Clickable */}
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white group-hover:text-cyan-400 transition-colors">Guardian News</h1>
              <p className="text-xs text-gray-500">Cyber Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(({ to, icon: Icon, label, active }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="h-3.5 w-3.5 text-green-400 animate-pulse" />
            <p className="text-xs text-gray-400">Surveillance live</p>
          </div>
          <p className="text-2xl font-bold text-white">{summary?.kpis.active_sources ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sources OSINT surveillées</p>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0A1628]/95 backdrop-blur border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Tableau de Bord Cyber</h1>
              <p className="text-sm text-gray-500">Vue d'ensemble cybersécurité en temps réel</p>
            </div>
            <Link
              to="/dashboard/news"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-400 transition-colors"
            >
              Voir les Actualités
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ==================== V4 KPI CARDS ==================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards">
            <KpiCard
              icon={Activity}
              label="Niveau de menace"
              value={tension ? `${tension.score}/100` : '—'}
              hint={tension?.level || 'Calcul en cours'}
              color={tension && tension.score >= 70 ? 'red' : tension && tension.score >= 40 ? 'orange' : 'emerald'}
              testId="kpi-threat-level"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Alertes critiques"
              value={summary?.kpis.critical_alerts ?? criticalCount}
              hint={`${summary?.kpis.articles_today ?? 0} nouvelles aujourd'hui`}
              color="red"
              testId="kpi-critical"
            />
            <KpiCard
              icon={TrendingUp}
              label="Articles 7j"
              value={summary?.kpis.articles_7days ?? total}
              hint={`${summary?.kpis.total_articles ?? total} au total`}
              color="cyan"
              testId="kpi-7days"
            />
            <KpiCard
              icon={Globe}
              label="Sources actives"
              value={summary?.kpis.active_sources ?? 11}
              hint={summary?.kpis.most_targeted_sector ? `Secteur le plus ciblé : ${summary.kpis.most_targeted_sector}` : 'OSINT surveillées'}
              color="emerald"
              testId="kpi-sources"
            />
          </div>

          {/* ==================== TOP 3 THREATS (V4 — enriched) ==================== */}
          {topThreats && topThreats.threats.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0D1B2A] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Top 3 menaces du jour
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Classées par score (gravité × récence × fiabilité source)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {topThreats.threats.map((t, idx) => {
                  const sevColor = t.severity === 'critique'
                    ? 'border-red-500/40 bg-red-500/5'
                    : t.severity === 'eleve'
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : 'border-yellow-500/40 bg-yellow-500/5';
                  const sevBadgeColor = t.severity === 'critique'
                    ? 'text-red-300 bg-red-500/15'
                    : t.severity === 'eleve'
                    ? 'text-orange-300 bg-orange-500/15'
                    : 'text-yellow-300 bg-yellow-500/15';
                  return (
                    <Link
                      key={t.id}
                      to={`/dashboard/news/${t.id}`}
                      className={`group rounded-xl border ${sevColor} p-4 transition-all hover:border-cyan-500/40 flex flex-col`}
                      data-testid={`dashboard-top-threat-${idx}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-white/10 text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${sevBadgeColor}`}>
                          {t.severity}
                        </span>
                        <span className="ml-auto rounded-full bg-slate-800/60 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                          {Math.round(t.score)}
                        </span>
                      </div>
                      <p className="text-sm text-white line-clamp-2 leading-snug mb-2">{t.title}</p>
                      <div className="mt-auto space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Swords className="h-3 w-3 shrink-0" />
                          <span className="truncate">Type : <span className="text-slate-200 capitalize">{t.attack_type}</span></span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">Cible : <span className="text-slate-200">{t.target}</span></span>
                        </div>
                        <div className="flex items-start gap-1 rounded-md bg-cyan-500/5 border border-cyan-500/15 px-1.5 py-1 text-cyan-200">
                          <Shield className="h-3 w-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{t.recommended_action}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== THREAT EVOLUTION CHART (24h/7d/30d) ==================== */}
          <ThreatEvolutionChart />

          {/* ==================== AI SUMMARY SECTION ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIThreatSummaryReal />
            
            {/* Quick Stats */}
            <div className="rounded-2xl bg-[#0D1B2A] border border-gray-800 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Bot className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Intelligence IA</h3>
                  <p className="text-xs text-gray-500">Analyse automatique des menaces</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-sm text-cyan-400">
                    <span className="font-medium">🤖 Résumé IA :</span> L'intelligence artificielle analyse en continu les flux RSS 
                    de cybersécurité pour extraire les menaces les plus critiques et générer des résumés en français.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-cyber-bg">
                    <p className="text-2xl font-bold text-white">{total}</p>
                    <p className="text-xs text-gray-500">Articles analysés</p>
                  </div>
                  <div className="p-3 rounded-lg bg-cyber-bg">
                    <p className="text-2xl font-bold text-white">3</p>
                    <p className="text-xs text-gray-500">Modes de résumé</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Les résumés sont mis en cache pendant 1 heure pour optimiser les performances.
                </p>
              </div>
            </div>
          </div>

          {/* ==================== CHARTS GRID (V4 - 100% data-driven) ==================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1️⃣ V4 - REAL ATTACK TYPE BAR CHART */}
            <AttackTypeBarChart />

            {/* 2️⃣ V4 - REAL COUNTRY PIE CHART */}
            <CountryPieChart />

            {/* 3️⃣ V4 - REAL SOURCES DISTRIBUTION */}
            <SourcesDistribution />

            {/* 4️⃣ LATEST INCIDENTS TABLE */}
            <ChartCard
              title="Derniers Incidents"
              description="Événements cybersécurité récents"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Heure</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Source</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Gravité</th>
                      <th className="text-left py-2 px-2 text-xs font-medium text-gray-500">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestIncidents.map((incident, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => window.open(incident.url, '_blank')}
                      >
                        <td className="py-3 px-2">
                          <span className="text-sm text-cyan-400 font-mono">{incident.time}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-gray-300">{incident.source}</span>
                        </td>
                        <td className="py-3 px-2">
                          {getSeverityBadge(incident.severity)}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-gray-400 line-clamp-1 max-w-[250px]">
                            {incident.description}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-center">
                <Link
                  to="/dashboard/news"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                >
                  Voir tous les incidents
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </ChartCard>
          </div>

          {/* Footer Status */}
          <div className="flex items-center justify-between py-4 border-t border-gray-800">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Radio className="h-4 w-4 text-green-400 animate-pulse" />
              <span>Données en direct • Mis à jour à l'instant</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{total} menaces surveillées</span>
              <span>•</span>
              <span>10+ sources actives</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
