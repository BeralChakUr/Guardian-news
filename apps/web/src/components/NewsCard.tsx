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

// Country flag mapping
const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  US: '🇺🇸',
  GB: '🇬🇧',
  DE: '🇩🇪',
  EU: '🇪🇺',
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

  // Get severity style safely
  const severityStyle = severityStyles[news.severity] || severityStyles.faible;
  const severityLabel = severityLabels[news.severity] || news.severity;
  const countryFlag = countryFlags[news.country || 'US'] || '🌍';

  return (
    <article className="group rounded-2xl border border-gray-800 bg-cyber-surface p-5 transition-all hover:border-cyber-primary/50 hover:bg-cyber-elevated">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" title={news.country === 'FR' ? 'France' : 'International'}>{countryFlag}</span>
          <span className="text-sm font-medium text-cyber-secondary">{news.source}</span>
          <span className="text-cyber-secondary">•</span>
          <span className="text-sm text-gray-500">
            {new Date(news.published_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReadLater}
            className={`rounded-lg p-2 transition-colors ${
              isReadLater ? 'bg-cyber-primary text-white' : 'text-gray-500 hover:bg-cyber-elevated hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={isReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleFavorite}
            className={`rounded-lg p-2 transition-colors ${
              isFavorite ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:bg-cyber-elevated hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Tags - Only severity and threat_type, no level */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${severityStyle}`}>
          {severityLabel}
        </span>
        {news.threat_type && (
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-cyber-elevated text-cyber-secondary">
            {news.threat_type}
          </span>
        )}
      </div>

      {/* Title */}
      <Link to={`/dashboard/news/${news.id}`}>
        <h3 className="mb-3 text-lg font-bold text-white transition-colors group-hover:text-cyber-primary">
          {news.title}
        </h3>
      </Link>

      {/* TL;DR */}
      <div className="mb-4 space-y-1">
        {(Array.isArray(news.tldr) ? news.tldr : [news.tldr]).slice(0, 2).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cyber-primary" />
            <p className="text-sm text-cyber-secondary line-clamp-1">{item}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-800 pt-4">
        <span className="text-xs text-gray-500">{news.impact}</span>
        <Link
          to={`/dashboard/news/${news.id}`}
          className="flex items-center gap-1 text-sm font-medium text-cyber-primary hover:underline"
        >
          Voir plus
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
