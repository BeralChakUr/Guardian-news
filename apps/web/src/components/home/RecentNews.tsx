import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ArrowRight, Filter, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { getNews, type NewsItem } from '../../services/newsService';

const filters = [
  { key: 'all', label: 'Tout' },
  { key: 'phishing', label: 'Phishing' },
  { key: 'malware', label: 'Malware' },
  { key: 'vuln', label: 'Vulnérabilités' },
  { key: 'ransomware', label: 'Ransomware' },
];

const severityConfig: Record<string, { bg: string; text: string; label: string }> = {
  critique: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critique' },
  eleve: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Élevé' },
  moyen: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Moyen' },
  faible: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Faible' },
};

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const severity = severityConfig[item.severity] || severityConfig.moyen;
  const summary = item.tldr?.[0] || item.content?.substring(0, 120) || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex h-[320px] flex-col overflow-hidden rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
    >
      <div className="flex-1 min-h-0 flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${severity.bg} ${severity.text}`}>
            {severity.label}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {new Date(item.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>

        {/* Title — clamp 3 lines */}
        <h3 className="text-white font-semibold mb-3 line-clamp-3 break-words group-hover:text-cyan-400 transition-colors leading-snug">
          {item.title}
        </h3>

        {/* Description — clamp 2 lines */}
        <p className="text-sm text-slate-400 line-clamp-2 break-words leading-relaxed">{summary}</p>
      </div>

      {/* Footer — pinned */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-700/50 shrink-0 gap-2">
        <span className="text-xs text-cyan-400 font-medium truncate min-w-0 flex-1">{item.source}</span>
        <Link
          to={`/dashboard/news/${item.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
        >
          Lire
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function RecentNews() {
  const [activeFilter, setActiveFilter] = useState('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['news-recent', activeFilter],
    queryFn: () => getNews(1, 6, activeFilter === 'all' ? {} : { type: activeFilter }),
    staleTime: 60000,
  });

  return (
    <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900" data-testid="recent-news-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Newspaper className="w-7 h-7 text-cyan-400" />
              Actualités Cyber Récentes
            </h2>
            <p className="text-slate-400 mt-1">Les dernières nouvelles de la cybersécurité</p>
          </div>
          <Link
            to="/dashboard/news"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Toutes les actualités
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-slate-700/50'
              }`}
              data-testid={`filter-${filter.key}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[320px] rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 rounded-xl bg-slate-800/50 border border-red-500/30 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-slate-400">Actualités indisponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {data?.items.slice(0, 6).map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
