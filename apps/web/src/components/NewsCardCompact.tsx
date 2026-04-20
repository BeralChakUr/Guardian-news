import { Link } from 'react-router-dom';
import { ExternalLink, Heart, Bookmark, ShieldCheck, AlertCircle } from 'lucide-react';
import type { NewsItem } from '../services/newsService';
import { useAppStore } from '../store/appStore';

interface NewsCardCompactProps {
  news: NewsItem;
}

const severityStyles: Record<string, string> = {
  critique: 'bg-red-500/20 text-red-300 border-red-500/40',
  eleve: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  moyen: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  faible: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

const severityLabels: Record<string, string> = {
  critique: 'Critique', eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible',
};

const countryFlags: Record<string, string> = {
  FR: '🇫🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', EU: '🇪🇺',
};

export default function NewsCardCompact({ news }: NewsCardCompactProps) {
  const { favorites, readLater, addFavorite, removeFavorite, addReadLater, removeReadLater } = useAppStore();
  const isFavorite = favorites.includes(news.id);
  const isReadLater = readLater.includes(news.id);

  const severityStyle = severityStyles[news.severity] || severityStyles.faible;
  const severityLabel = severityLabels[news.severity] || news.severity;
  const countryFlag = countryFlags[news.country || 'US'] || '🌍';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    isFavorite ? removeFavorite(news.id) : addFavorite(news.id);
  };

  const handleReadLater = (e: React.MouseEvent) => {
    e.preventDefault();
    isReadLater ? removeReadLater(news.id) : addReadLater(news.id);
  };

  // First recommended action (fallback to generic)
  const recommendedAction =
    Array.isArray(news.actions) && news.actions.length > 0
      ? news.actions[0]
      : 'Consultez la source pour plus d\u2019informations.';

  return (
    <article
      className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 transition-all hover:border-cyan-500/40 hover:bg-slate-900"
      data-testid="news-card-compact"
    >
      {/* Header row: severity + source */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityStyle}`}>
            {severityLabel}
          </span>
          <span className="text-base shrink-0" title={news.country === 'FR' ? 'France' : 'International'}>{countryFlag}</span>
          <span className="text-xs text-slate-400 truncate">{news.source}</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-xs text-slate-500 shrink-0">
            {new Date(news.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReadLater}
            aria-label="À lire plus tard"
            className={`rounded-lg p-1.5 transition-colors ${
              isReadLater ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" fill={isReadLater ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleFavorite}
            aria-label="Favori"
            className={`rounded-lg p-1.5 transition-colors ${
              isFavorite ? 'bg-red-500/20 text-red-400' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Heart className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Title */}
      <Link to={`/dashboard/news/${news.id}`}>
        <h3 className="mb-3 text-base md:text-lg font-semibold text-white leading-snug transition-colors group-hover:text-cyan-400 line-clamp-2">
          {news.title}
        </h3>
      </Link>

      {/* Action recommandée block */}
      <div className="flex items-start gap-2 rounded-xl bg-cyan-500/5 border border-cyan-500/20 px-3 py-2 mb-3">
        <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Action recommandée
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-snug mt-0.5">
            {recommendedAction}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="truncate">{news.impact || 'Utilisateurs concernés'}</span>
        </div>
        <Link
          to={`/dashboard/news/${news.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:underline shrink-0"
        >
          Détails
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
