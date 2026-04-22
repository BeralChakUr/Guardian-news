import { useState, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Filter, X, RefreshCw, ChevronDown, Sparkles, Clock, Globe, Calendar } from 'lucide-react';
import { getNews, getTension, getGroupedNews, type NewsItem } from '../services/newsService';
import NewsCard from '../components/NewsCard';
import NewsCardCompact from '../components/NewsCardCompact';
import TensionBanner from '../components/TensionBanner';
import FilterChips, { DEFAULT_FILTER_CHIPS } from '../components/FilterChips';

const severityOptions = [
  { value: 'critique', label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { value: 'eleve', label: 'Élevé', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { value: 'moyen', label: 'Moyen', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  { value: 'faible', label: 'Faible', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
];

const typeOptions = [
  { value: 'phishing', label: 'Phishing' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'malware', label: 'Malware' },
  { value: 'data_leak', label: 'Fuite de données' },
  { value: 'vuln', label: 'Vulnérabilité' },
  { value: 'scam', label: 'Arnaque' },
];

const countryOptions = [
  { value: '', label: 'Tous les pays', icon: '🌍' },
  { value: 'FR', label: 'France', icon: '🇫🇷' },
  { value: 'US', label: 'International', icon: '🌐' },
];

// Date preset options
const datePresets = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7days', label: '7 derniers jours' },
  { value: 'custom', label: 'Personnalisé' },
];

// Helper to get date strings
const getDateRange = (preset: string): { from: string; to: string } => {
  const today = new Date();
  const toDate = today.toISOString().split('T')[0];
  
  switch (preset) {
    case 'today':
      return { from: toDate, to: toDate };
    case '7days':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { from: weekAgo.toISOString().split('T')[0], to: toDate };
    default:
      return { from: '', to: '' };
  }
};

export default function ActusPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [country, setCountry] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [datePreset, setDatePreset] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [quickFilter, setQuickFilter] = useState<string>('all');

  // Apply quick filter preset (chips)
  const handleQuickFilter = (id: string) => {
    setQuickFilter(id);
    // Reset granular filters so the chip drives the query
    setSeverity(null);
    setType(null);
    setCountry('');
    if (id === 'all') {
      setViewMode('grouped');
      return;
    }
    setViewMode('list');
    if (id === 'urgence') setSeverity('critique'); // critique + eleve via OR would need backend change; pick critique
    if (id === 'attaque') setType('ransomware'); // representative attack type
    if (id === 'france') setCountry('FR');
  };

  const filters = useMemo(() => ({
    severity: severity || undefined,
    type: type || undefined,
    search: search || undefined,
    country: country || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  }), [severity, type, search, country, dateFrom, dateTo]);

  const { data: tension, isLoading: tensionLoading } = useQuery({
    queryKey: ['tension'],
    queryFn: getTension,
    staleTime: 6 * 60 * 60 * 1000,
  });

  // Grouped news query (for grouped view)
  const { data: groupedData, isLoading: groupedLoading, isError: groupedError, refetch: refetchGrouped } = useQuery({
    queryKey: ['news-grouped-page'],
    queryFn: () => getGroupedNews(20),
    staleTime: 60000,
    enabled: viewMode === 'grouped' && !severity && !type && !search,
  });

  // Paginated news query (for list view or when filters are active)
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
    enabled: viewMode === 'list' || !!severity || !!type || !!search,
  });

  const news = data?.pages.flatMap(page => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const hasActiveFilters = severity || type || search || country || dateFrom || dateTo;
  const showGroupedView = viewMode === 'grouped' && !severity && !type && !search && !dateFrom && !dateTo;

  const clearFilters = () => {
    setSeverity(null);
    setType(null);
    setSearch('');
    setCountry('');
    setDatePreset('');
    setDateFrom('');
    setDateTo('');
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      // Don't change dates, let user pick manually
      return;
    }
    const { from, to } = getDateRange(preset);
    setDateFrom(from);
    setDateTo(to);
    setViewMode('list'); // Switch to list view when filtering by date
  };

  const FilterSection = ({ className = '' }: { className?: string }) => (
    <div className={`space-y-6 ${className}`}>
      {/* Country Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyber-secondary">
          Région
        </h4>
        <div className="flex flex-wrap gap-2">
          {countryOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setCountry(country === opt.value ? '' : opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-1.5 ${
                country === opt.value
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'border-gray-700 text-cyber-secondary hover:border-gray-600 hover:text-white'
              }`}
              data-testid={`country-filter-${opt.value || 'all'}`}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* Date Filter */}
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cyber-secondary flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Période
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {datePresets.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleDatePresetChange(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                datePreset === opt.value
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'border-gray-700 text-cyber-secondary hover:border-gray-600 hover:text-white'
              }`}
              data-testid={`date-filter-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {datePreset === 'custom' && (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-cyber-secondary mb-1 block">Du</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setViewMode('list');
                }}
                className="w-full rounded-lg border border-gray-700 bg-cyber-surface px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                data-testid="date-from-input"
              />
            </div>
            <div>
              <label className="text-xs text-cyber-secondary mb-1 block">Au</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setViewMode('list');
                }}
                className="w-full rounded-lg border border-gray-700 bg-cyber-surface px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                data-testid="date-to-input"
              />
            </div>
          </div>
        )}
        {(dateFrom || dateTo) && datePreset !== 'custom' && (
          <p className="text-xs text-cyber-secondary mt-2">
            {dateFrom === dateTo 
              ? `📅 ${new Date(dateFrom).toLocaleDateString('fr-FR')}`
              : `📅 ${new Date(dateFrom).toLocaleDateString('fr-FR')} → ${new Date(dateTo).toLocaleDateString('fr-FR')}`
            }
          </p>
        )}
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

  // Grouped News Section Component
  const GroupedNewsSection = ({ title, icon, items, countryCode }: { title: string; icon: React.ReactNode; items: NewsItem[]; countryCode?: string }) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {icon}
          {title}
          <span className="text-sm font-normal text-slate-400">({items.length})</span>
        </h3>
        {countryCode && (
          <button
            onClick={() => {
              setCountry(countryCode);
              setViewMode('list');
            }}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Voir tout →
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-cyber-surface p-8 text-center">
          <p className="text-cyber-secondary">Aucune actualité disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {items.map(item => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
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

      {/* V4 Quick Filter Chips */}
      <div className="mb-4">
        <FilterChips value={quickFilter} onChange={handleQuickFilter} />
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => setViewMode('grouped')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'grouped'
              ? 'bg-cyber-primary text-white'
              : 'bg-cyber-surface border border-gray-800 text-cyber-secondary hover:text-white'
          }`}
          data-testid="view-mode-grouped"
        >
          Vue groupée
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-cyber-primary text-white'
              : 'bg-cyber-surface border border-gray-800 text-cyber-secondary hover:text-white'
          }`}
          data-testid="view-mode-list"
        >
          Vue liste
        </button>
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
                  {[severity, type, search, country].filter(Boolean).length}
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
                data-testid="news-search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  data-testid="clear-search-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {/* Mobile Filter Button - Always visible on small screens */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-colors lg:hidden ${
                  hasActiveFilters
                    ? 'bg-cyber-primary text-white'
                    : 'border border-gray-800 bg-cyber-surface text-cyber-secondary hover:text-white'
                }`}
                data-testid="mobile-filter-toggle"
              >
                <Filter className="h-5 w-5" />
                <span className="hidden xs:inline">Filtres</span>
                {hasActiveFilters && (
                  <span className="rounded-full bg-white/20 px-1.5 text-xs">
                    {[severity, type, country].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {/* Refresh Button */}
              <button
                onClick={() => showGroupedView ? refetchGrouped() : refetch()}
                className="flex items-center gap-2 rounded-xl border border-gray-800 bg-cyber-surface px-4 py-3 text-cyber-secondary hover:text-white transition-colors"
                title="Rafraîchir"
                data-testid="refresh-btn"
              >
                <RefreshCw className={`h-5 w-5 ${(isLoading || groupedLoading) ? 'animate-spin' : ''}`} />
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
              {showGroupedView ? (
                <span className="text-sm text-cyber-secondary">
                  <span className="font-semibold text-white">{(groupedData?.france_total || 0) + (groupedData?.international_total || 0)}</span> actualités
                </span>
              ) : (
                <span className="text-sm text-cyber-secondary">
                  <span className="font-semibold text-white">{total}</span> actualité{total > 1 ? 's' : ''}
                </span>
              )}
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

          {/* Grouped View */}
          {showGroupedView && (
            <>
              {groupedLoading ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse rounded-2xl bg-cyber-surface p-5">
                        <div className="h-4 w-24 rounded bg-cyber-elevated mb-3" />
                        <div className="flex gap-2 mb-3">
                          <div className="h-6 w-16 rounded bg-cyber-elevated" />
                          <div className="h-6 w-20 rounded bg-cyber-elevated" />
                        </div>
                        <div className="h-6 w-full rounded bg-cyber-elevated mb-2" />
                        <div className="h-6 w-3/4 rounded bg-cyber-elevated mb-4" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : groupedError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                  <p className="text-red-400 mb-4">Erreur lors du chargement des actualités</p>
                  <button
                    onClick={() => refetchGrouped()}
                    className="rounded-xl bg-cyber-primary px-6 py-3 font-medium text-white hover:bg-cyber-primary/80"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  {/* France Section */}
                  <GroupedNewsSection
                    title="Alertes France"
                    icon={<span className="text-xl">🇫🇷</span>}
                    items={groupedData?.france || []}
                    countryCode="FR"
                  />

                  {/* International Section */}
                  <GroupedNewsSection
                    title="Alertes Internationales"
                    icon={<Globe className="w-5 h-5 text-blue-400" />}
                    items={groupedData?.international || []}
                    countryCode="US"
                  />
                </>
              )}
            </>
          )}

          {/* List View */}
          {!showGroupedView && (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                    {news.map(item => (
                      <NewsCardCompact key={item.id} news={item} />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
