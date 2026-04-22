import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock, ExternalLink, Globe } from 'lucide-react';
import { getGroupedNews, type NewsItem } from '../../services/newsService';

const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  critique: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critique' },
  eleve: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Élevé' },
  moyen: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyen' },
  faible: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Faible' },
};

const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  EU: '🇪🇺',
};

function AlertCard({ item, index }: { item: NewsItem; index: number }) {
  const severity = severityConfig[item.severity] || severityConfig.moyen;
  const summary = item.tldr?.[0] || item.content?.substring(0, 150) || '';
  const flag = countryFlags[item.country || 'US'] || '🌍';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
      data-testid={`alert-card-${index}`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base" title={item.country === 'FR' ? 'France' : 'International'}>{flag}</span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severity.bg} ${severity.text}`}>
            {severity.label}
          </span>
        </div>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(item.published_at).toLocaleDateString('fr-FR')}
        </span>
      </div>
      
      <h3 className="text-white font-semibold mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
        {summary}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-cyan-400">{item.source}</span>
        <Link
          to={`/dashboard/news/${item.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
        >
          Lire l'alerte
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

interface AlertsSectionProps {
  title: string;
  icon: React.ReactNode;
  items: NewsItem[];
  emptyMessage: string;
  countryFilter?: string;
}

function AlertsSection({ title, icon, items, emptyMessage, countryFilter }: AlertsSectionProps) {
  return (
    <div className="mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-6"
      >
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          {icon}
          {title}
          <span className="text-sm font-normal text-slate-400">({items.length})</span>
        </h3>
        <Link
          to={countryFilter ? `/dashboard/news?country=${countryFilter}` : '/dashboard/news'}
          className="hidden sm:inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
        >
          Voir toutes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {items.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
          <p className="text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {items.slice(0, 3).map((item, index) => (
            <AlertCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DailyAlerts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news-grouped'],
    queryFn: () => getGroupedNews(6),
    staleTime: 60000,
  });

  return (
    <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900" data-testid="daily-alerts-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-orange-400" />
              Alertes du Jour
            </h2>
            <p className="text-slate-400 mt-1">Les dernières menaces détectées par nos analyseurs</p>
          </div>
          <Link
            to="/dashboard/news"
            className="hidden sm:inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Voir toutes les alertes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 rounded-xl bg-slate-800/50 border border-red-500/30 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-400">Actualités indisponibles</p>
          </div>
        ) : (
          <>
            {/* French Alerts - Priority */}
            <AlertsSection
              title="Alertes France"
              icon={<span className="text-2xl">🇫🇷</span>}
              items={data?.france || []}
              emptyMessage="Aucune alerte française récente"
              countryFilter="FR"
            />

            {/* International Alerts */}
            <AlertsSection
              title="Alertes Internationales"
              icon={<Globe className="w-6 h-6 text-blue-400" />}
              items={data?.international || []}
              emptyMessage="Aucune alerte internationale récente"
            />
          </>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/dashboard/news"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Voir toutes les alertes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
