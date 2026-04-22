import { Link } from 'react-router-dom';
import { ExternalLink, Heart, Bookmark, ChevronRight } from 'lucide-react';
import type { NewsItem } from '../services/newsService';
import { useAppStore } from '../store/appStore';

interface NewsCardProps {
  news: NewsItem;
}

const severityStyles: Record<string, string> = {
  critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  eleve: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  moyen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  faible: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const severityLabels: Record<string, string> = {
  critique: 'Critique',
  eleve: 'Élevé',
  moyen: 'Moyen',
  faible: 'Faible',
};

const countryFlags: Record<string, string> = {
  FR: '🇫🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', EU: '🇪🇺',
};

export default function NewsCard({ news }: NewsCardProps) {
  const { favorites, readLater, addFavorite, removeFavorite, addReadLater, removeReadLater } = useAppStore();

  const isFavorite = favorites.includes(news.id);
  const isReadLater = readLater.includes(news.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    isFavorite ? removeFavorite(news.id) : addFavorite(news.id);
  };

  const handleReadLater = (e: React.MouseEvent) => {
    e.preventDefault();
    isReadLater ? removeReadLater(news.id) : addReadLater(news.id);
  };

  const severityStyle = severityStyles[news.severity] || severityStyles.faible;
  const severityLabel = severityLabels[news.severity] || news.severity;
  const countryFlag = countryFlags[news.country || 'US'] || '🌍';

  const tldrItems = Array.isArray(news.tldr) ? news.tldr : news.tldr ? [news.tldr] : [];
  const firstTldr = tldrItems[0] || news.content?.substring(0, 160) || '';

  return (
    <article
      className="group flex h-[320px] flex-col rounded-2xl border border-gray-800 bg-cyber-surface p-5 transition-all hover:border-cyber-primary/50 hover:bg-cyber-elevated overflow-hidden"
      data-testid="news-card"
    >
      {/* ===== HEADER (fixed) ===== */}
      <header className="flex items-start justify-between gap-2 mb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base shrink-0" title={news.country === 'FR' ? 'France' : 'International'}>
            {countryFlag}
          </span>
          <span className="text-sm font-medium text-cyber-secondary truncate">{news.source}</span>
          <span className="text-cyber-secondary shrink-0">•</span>
          <span className="text-sm text-gray-500 shrink-0">
            {new Date(news.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleReadLater}
            aria-label="À lire plus tard"
            className={`rounded-lg p-1.5 transition-colors ${
              isReadLater ? 'bg-cyber-primary text-white' : 'text-gray-500 hover:bg-cyber-elevated hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={isReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleFavorite}
            aria-label="Favori"
            className={`rounded-lg p-1.5 transition-colors ${
              isFavorite ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:bg-cyber-elevated hover:text-white'
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      {/* ===== CONTENT (flexible - grows) ===== */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2 shrink-0">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${severityStyle}`}>
            {severityLabel}
          </span>
          {news.threat_type && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-cyber-elevated text-cyber-secondary capitalize">
              {news.threat_type}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/dashboard/news/${news.id}`} className="mb-3 shrink-0">
          <h3 className="text-base font-bold text-white transition-colors group-hover:text-cyber-primary line-clamp-3 break-words leading-snug">
            {news.title}
          </h3>
        </Link>

        {/* TL;DR */}
        {firstTldr && (
          <div className="flex items-start gap-2 min-h-0">
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyber-primary" />
            <p className="text-xs text-cyber-secondary line-clamp-2 break-words leading-relaxed">
              {firstTldr}
            </p>
          </div>
        )}
      </div>

      {/* ===== FOOTER (fixed at bottom) ===== */}
      <footer className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3 shrink-0 gap-2">
        <span className="text-[11px] text-gray-500 truncate min-w-0 flex-1">
          {news.impact || 'Utilisateurs concernés'}
        </span>
        <Link
          to={`/dashboard/news/${news.id}`}
          className="flex items-center gap-1 text-xs font-medium text-cyber-primary hover:underline shrink-0"
        >
          Voir plus
          <ExternalLink className="h-3 w-3" />
        </Link>
      </footer>
    </article>
  );
}
