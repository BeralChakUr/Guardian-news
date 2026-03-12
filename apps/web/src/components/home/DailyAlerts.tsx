import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock, ExternalLink } from 'lucide-react';
import { getNews, type NewsItem } from '../../services/newsService';

const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  critique: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critique' },
  eleve: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Élevé' },
  moyen: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyen' },
  faible: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Faible' },
};

function AlertCard({ item, index }: { item: NewsItem; index: number }) {
  const severity = severityConfig[item.severity] || severityConfig.moyen;
  const summary = item.tldr?.[0] || item.content?.substring(0, 150) || '';
  
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
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severity.bg} ${severity.text}`}>
          {severity.label}
        </span>
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

export default function DailyAlerts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news-alerts', 5],
    queryFn: () => getNews(1, 5),
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 rounded-xl bg-slate-800/50 border border-red-500/30 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-400">Actualités indisponibles</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items.slice(0, 5).map((item, index) => (
              <AlertCard key={item.id} item={item} index={index} />
            ))}
          </div>
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
