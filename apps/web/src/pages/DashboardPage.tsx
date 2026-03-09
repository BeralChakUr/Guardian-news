import { useState, useMemo } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Search, Filter, X, RefreshCw, ChevronDown, Clock, Bookmark, ExternalLink, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNews, getTension } from '../services/newsService';
import CommandCenter from '../components/CommandCenter';
import AIThreatSummary from '../components/AIThreatSummary';
import ThreatRadar from '../components/ThreatRadar';
import AttackTimeline from '../components/AttackTimeline';
import SourceTrustPanel from '../components/SourceTrustPanel';

const severityOptions = [
  { value: 'critique', label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
  { value: 'eleve', label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  { value: 'moyen', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  { value: 'faible', label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
];

const typeOptions = [
  { value: 'phishing', label: 'Phishing' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'malware', label: 'Malware' },
  { value: 'data_leak', label: 'Data Breach' },
  { value: 'vuln', label: 'Vulnerability' },
  { value: 'scam', label: 'Scam' },
];

// Improved News Card Component
function ThreatCard({ news }: { news: any }) {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critique': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', badge: 'bg-red-500/20' };
      case 'eleve': return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', badge: 'bg-orange-500/20' };
      case 'moyen': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', badge: 'bg-yellow-500/20' };
      default: return { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', badge: 'bg-green-500/20' };
    }
  };

  const style = getSeverityStyle(news.severity);
  const formattedDate = new Date(news.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`group rounded-2xl bg-cyber-surface border ${style.border} hover:border-cyber-primary/50 transition-all duration-300 overflow-hidden`}>
      {/* Top severity bar */}
      <div className={`h-1 ${style.badge}`} />
      
      <div className="p-5">
        {/* Header with badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase ${style.badge} ${style.text}`}>
            {news.severity}
          </span>
          <span className="px-2 py-0.5 rounded-md text-xs bg-cyber-elevated text-cyber-secondary">
            {news.threat_type}
          </span>
          {news.level && (
            <span className={`px-2 py-0.5 rounded-md text-xs ${
              news.level === 'avance' ? 'bg-purple-500/20 text-purple-400' :
              news.level === 'intermediaire' ? 'bg-cyan-500/20 text-cyan-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {news.level}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/dashboard/news/${news.id}`}>
          <h3 className="text-base font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyber-primary transition-colors">
            {news.title}
          </h3>
        </Link>

        {/* TLDR/Summary */}
        {news.tldr && (
          <p className="text-sm text-cyber-secondary mb-3 line-clamp-2">
            {news.tldr}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3 text-xs text-cyber-secondary">
            <span className="font-medium text-white">{news.source}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-cyber-elevated transition-colors text-cyber-secondary hover:text-cyber-primary">
              <Bookmark className="h-4 w-4" />
            </button>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-cyber-elevated transition-colors text-cyber-secondary hover:text-cyber-primary"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filters = useMemo(() => ({
    severity: severity || undefined,
    type: type || undefined,
    search: search || undefined,
  }), [severity, type, search]);

  const { data: tension, isLoading: tensionLoading } = useQuery({
    queryKey: ['tension'],
    queryFn: getTension,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['news', filters],
    queryFn: ({ pageParam = 1 }) => getNews(pageParam, 12, filters),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });

  const news = data?.pages.flatMap(page => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const criticalCount = news.filter(n => n.severity === 'critique').length;

  const hasActiveFilters = severity || type || search;

  const clearFilters = () => {
    setSeverity(null);
    setType(null);
    setSearch('');
  };

  return (
    <div className="pb-20 md:pb-0 space-y-6">
      {/* Command Center - Top Overview */}
      <CommandCenter
        tension={tension ?? null}
        totalNews={total}
        criticalCount={criticalCount}
        newToday={Math.min(total, 50)}
        isLoading={tensionLoading}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - AI Summary & Radar */}
        <div className="space-y-6">
          <AIThreatSummary news={news} isLoading={isLoading} />
          <ThreatRadar news={news} isLoading={isLoading} />
        </div>

        {/* Center Column - News Feed */}
        <div className="xl:col-span-1 space-y-4">
          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search threats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-cyber-surface py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:border-cyber-primary focus:outline-none"
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

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  hasActiveFilters || showFilters
                    ? 'bg-cyber-primary text-white'
                    : 'border border-gray-800 bg-cyber-surface text-cyber-secondary hover:text-white'
                }`}
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="px-1.5 py-0.5 rounded bg-white/20 text-xs">
                    {[severity, type].filter(Boolean).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded-lg border border-gray-800 bg-cyber-surface px-3 py-2 text-sm text-cyber-secondary hover:text-white transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="p-4 rounded-xl border border-gray-800 bg-cyber-surface space-y-4">
                <div>
                  <label className="text-xs font-medium text-cyber-secondary mb-2 block">Severity</label>
                  <div className="flex flex-wrap gap-2">
                    {severityOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSeverity(severity === opt.value ? null : opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          severity === opt.value
                            ? opt.color + ' border-current'
                            : 'border-gray-700 text-cyber-secondary hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-cyber-secondary mb-2 block">Threat Type</label>
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setType(type === opt.value ? null : opt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                          type === opt.value
                            ? 'bg-cyber-primary text-white border-cyber-primary'
                            : 'border-gray-700 text-cyber-secondary hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-cyber-secondary">
              <span className="font-semibold text-white">{total}</span> threats
            </span>
            <span className="text-xs text-cyber-secondary flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Most recent
            </span>
          </div>

          {/* News Cards */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl bg-cyber-surface p-5">
                  <div className="h-1 w-full bg-cyber-elevated rounded mb-4" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-cyber-elevated rounded" />
                    <div className="h-5 w-20 bg-cyber-elevated rounded" />
                  </div>
                  <div className="h-5 w-full bg-cyber-elevated rounded mb-2" />
                  <div className="h-5 w-3/4 bg-cyber-elevated rounded mb-4" />
                  <div className="h-4 w-1/2 bg-cyber-elevated rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {news.slice(0, 6).map(item => (
                <ThreatCard key={item.id} news={item} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 rounded-xl border border-gray-800 bg-cyber-surface text-sm font-medium text-white hover:border-cyber-primary transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ChevronDown className="h-4 w-4" />
                  Load more threats
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right Column - Timeline & Sources */}
        <div className="space-y-6">
          <AttackTimeline news={news} isLoading={isLoading} />
          <SourceTrustPanel isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
