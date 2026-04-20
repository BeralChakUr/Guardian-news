import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink, Clock } from 'lucide-react';
import { getNews } from '../services/newsService';

interface RelatedArticlesProps {
  filters: {
    severity?: string;
    type?: string;
    country?: string;
  };
  title: string;
  description?: string;
  limit?: number;
  testId?: string;
}

const severityStyles: Record<string, string> = {
  critique: 'bg-red-500/15 text-red-300 border-red-500/30',
  eleve: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  moyen: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  faible: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};
const severityLabels: Record<string, string> = {
  critique: 'Critique', eleve: 'Élevé', moyen: 'Moyen', faible: 'Faible',
};

export default function RelatedArticlesBlock({
  filters,
  title,
  description,
  limit = 6,
  testId,
}: RelatedArticlesProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-articles', filters, limit],
    queryFn: () => getNews(1, limit, filters),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5"
      data-testid={testId ?? 'related-articles'}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        </div>
        <Link
          to="/dashboard/news"
          className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 shrink-0"
        >
          Tout voir <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center text-sm text-slate-500 py-6">
          Aucun article correspondant pour le moment.
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => {
            const sev = severityStyles[item.severity] ?? severityStyles.faible;
            return (
              <li key={item.id}>
                <Link
                  to={`/dashboard/news/${item.id}`}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-800/40 border border-transparent hover:border-cyan-500/20"
                >
                  <span className={`mt-0.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0 ${sev}`}>
                    {severityLabels[item.severity] ?? item.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white line-clamp-2 leading-snug">{item.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{item.source}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(item.published_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
