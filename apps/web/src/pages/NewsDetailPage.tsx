import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, CheckCircle, AlertTriangle, Users, Shield } from 'lucide-react';
import { getNewsById } from '../services/newsService';

const severityStyles = {
  critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  eleve: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  moyen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  faible: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: news, isLoading, isError } = useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse pb-20">
        <div className="h-8 w-32 rounded bg-cyber-surface mb-6" />
        <div className="h-10 w-3/4 rounded bg-cyber-surface mb-4" />
        <div className="h-6 w-1/2 rounded bg-cyber-surface mb-8" />
        <div className="h-64 rounded-2xl bg-cyber-surface" />
      </div>
    );
  }

  if (isError || !news) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Article non trouvé</p>
        <Link to="/" className="text-cyber-primary hover:underline">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Back Button */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-cyber-secondary hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-4 py-1 text-sm font-medium ${severityStyles[news.severity]}`}>
            {news.severity === 'critique' ? 'Critique' : 
             news.severity === 'eleve' ? 'Élevé' :
             news.severity === 'moyen' ? 'Moyen' : 'Faible'}
          </span>
          <span className="text-cyber-secondary">
            {news.source} • {new Date(news.published_at).toLocaleDateString('fr-FR')}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{news.title}</h1>
      </div>

      {/* TL;DR Section */}
      <section className="mb-8 rounded-2xl bg-cyber-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-cyber-primary" />
          <h2 className="text-lg font-semibold text-white">TL;DR</h2>
        </div>
        <ul className="space-y-3">
          {news.tldr.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-cyber-primary shrink-0" />
              <span className="text-cyber-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Impact Section */}
      <section className="mb-8 rounded-2xl bg-cyber-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Impact</h2>
        </div>
        <p className="text-cyber-secondary">{news.impact}</p>
      </section>

      {/* Actions Section */}
      <section className="mb-8 rounded-2xl bg-cyber-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">Que faire maintenant</h2>
        </div>
        <ul className="space-y-4">
          {news.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
                {i + 1}
              </span>
              <span className="text-cyber-secondary">{action}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Source Link */}
      {news.url && (
        <div className="text-center">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-cyber-primary px-6 py-3 font-medium text-white hover:bg-cyber-primary/80"
          >
            Voir la source
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}
