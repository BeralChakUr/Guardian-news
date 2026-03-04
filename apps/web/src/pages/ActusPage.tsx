import { useState, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Filter, X, RefreshCw, ChevronDown, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { getNews, getTension } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import TensionBanner from '../components/TensionBanner';

const severityOptions = [
  { value: 'critique', label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { value: 'eleve', label: 'Élevé', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { value: 'moyen', label: 'Moyen', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  { value: 'faible', label: 'Faible', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
];

const levelOptions = [
  { value: 'debutant', label: 'Débutant', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  { value: 'intermediaire', label: 'Intermédiaire', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { value: 'avance', label: 'Avancé', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
];

const typeOptions = [
  { value: 'phishing', label: 'Phishing' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'malware', label: 'Malware' },
  { value: 'data_leak', label: 'Fuite de données' },
  { value: 'vuln', label: 'Vulnérabilité' },
  { value: 'scam', label: 'Arnaque' },
];

export default function ActusPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filters = useMemo(() => ({
    severity: severity || undefined,
    level: level || undefined,
    type: type || undefined,
    search: search || undefined,
  }), [severity, level, type, search]);

  const { data: tension, isLoading: tensionLoading } = useQuery({
    queryKey: ['tension'],
    queryFn: getTension,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['news', filters],
    queryFn: ({ pageParam = 1 }) => getNews(pageParam, 15, filters),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const news = data?.pages.flatMap(page => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const hasActiveFilters = severity || level || type || search;

  const clearFilters = () => {
    setSeverity(null);
    setLevel(null);
    setType(null);
    setSearch('');
  };

  const FilterSection = ({ className = '' }: { className?: string }) => (
    <div className={`space-y-6 ${className}`}>
      {/* Severity */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyber-secondary">
          Gravité
        </h4>
        <div className="flex flex-wrap gap-2">
          {severityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSeverity(severity === opt.value ? null : opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                severity === opt.value
                  ? opt.color + ' border-current'
                  : 'border-gray-700 text-cyber-secondary hover:border-gray-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyber-secondary">
          Niveau technique
        </h4>
        <div className="flex flex-wrap gap-2">
          {levelOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLevel(level === opt.value ? null : opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                level === opt.value
                  ? opt.color + ' border-current'
                  : 'border-gray-700 text-cyber-secondary hover:border-gray-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyber-secondary">
          Type de menace
        </h4>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(type === opt.value ? null : opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                type === opt.value
                  ? 'bg-cyber-primary text-white border-cyber-primary'
                  : 'border-gray-700 text-cyber-secondary hover:border-gray-600 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20"
        >
          Effacer tous les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="pb-20 md:pb-0">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-6 w-6 text-cyber-primary" />
          <h1 className="text-2xl font-bold text-white">Actualités Cyber</h1>
        </div>
        <p className="text-cyber-secondary">
          Les dernières menaces et alertes de sécurité en temps réel
        </p>
      </div>

      {/* Tension Banner - Mobile only (desktop has it in sidebar) */}
      <div className="md:hidden">
        <TensionBanner tension={tension ?? null} loading={tensionLoading} />
      </div>

      {/* Desktop Layout: Sidebar Filters + Main Content */}
      <div className="flex gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-gray-800 bg-cyber-surface p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </h3>
              {hasActiveFilters && (
                <span className="rounded-full bg-cyber-primary px-2 py-0.5 text-xs font-medium text-white">
                  {[severity, level, type, search].filter(Boolean).length}
                </span>
              )}
            </div>
            <FilterSection />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search Bar + Mobile Filter Toggle */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-cyber-surface py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-cyber-primary focus:outline-none focus:ring-1 focus:ring-cyber-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-colors lg:hidden ${
                  hasActiveFilters
                    ? 'bg-cyber-primary text-white'
                    : 'border border-gray-800 bg-cyber-surface text-cyber-secondary hover:text-white'
                }`}
              >
                <Filter className="h-5 w-5" />
                Filtres
                {hasActiveFilters && (
                  <span className="rounded-full bg-white/20 px-1.5 text-xs">
                    {[severity, level, type].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-cyber-surface px-4 py-3 text-cyber-secondary hover:text-white transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="mb-6 rounded-2xl border border-gray-800 bg-cyber-surface p-5 lg:hidden">
              <FilterSection />
            </div>
          )}

          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-cyber-secondary">
                <span className="font-semibold text-white">{total}</span> actualité{total > 1 ? 's' : ''}
              </span>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-xs text-cyber-secondary">
                  <span>•</span>
                  <button onClick={clearFilters} className="text-cyber-primary hover:underline">
                    Effacer filtres
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-cyber-secondary">
              <Clock className="h-4 w-4" />
              <span>Plus récent</span>
            </div>
          </div>

          {/* News Grid */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse rounded-2xl bg-cyber-surface p-5">
                  <div className="h-4 w-24 rounded bg-cyber-elevated mb-3" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 w-16 rounded bg-cyber-elevated" />
                    <div className="h-6 w-20 rounded bg-cyber-elevated" />
                  </div>
                  <div className="h-6 w-full rounded bg-cyber-elevated mb-2" />
                  <div className="h-6 w-3/4 rounded bg-cyber-elevated mb-4" />
                  <div className="h-4 w-full rounded bg-cyber-elevated mb-2" />
                  <div className="h-4 w-2/3 rounded bg-cyber-elevated" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
              <p className="text-red-400 mb-4">Erreur lors du chargement des actualités</p>
              <button
                onClick={() => refetch()}
                className="rounded-xl bg-cyber-primary px-6 py-3 font-medium text-white hover:bg-cyber-primary/80"
              >
                Réessayer
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-cyber-surface p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-white font-medium mb-2">Aucun résultat</p>
              <p className="text-cyber-secondary text-sm">
                Essayez de modifier vos critères de recherche ou filtres
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {news.map(item => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
              
              {hasNextPage && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="group relative overflow-hidden rounded-xl bg-cyber-surface border border-gray-800 px-8 py-3 font-medium text-white hover:border-cyber-primary transition-colors disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isFetchingNextPage ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Charger plus d'actualités
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
