import { useState } from 'react';
import { Clock, ExternalLink, AlertTriangle, Shield, Bug, Lock, Database, Mail, Server, Filter } from 'lucide-react';
import type { NewsItem } from '../services/newsService';

interface AttackTimelineProps {
  news: NewsItem[];
  isLoading?: boolean;
}

const getThreatIcon = (type: string) => {
  switch (type) {
    case 'ransomware': return Lock;
    case 'phishing': return Mail;
    case 'malware': return Bug;
    case 'vuln': return Shield;
    case 'data_leak': return Database;
    case 'ddos': return Server;
    default: return AlertTriangle;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critique': return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' };
    case 'eleve': return { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'moyen': return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    default: return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' };
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTimeSlot = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function AttackTimeline({ news, isLoading }: AttackTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  const filteredNews = news.filter(item => {
    if (filter === 'critical' && item.severity !== 'critique') return false;
    if (filter === 'high' && !['critique', 'eleve'].includes(item.severity)) return false;
    return true;
  }).slice(0, 10);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cyber-surface border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-cyber-elevated rounded" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
              <div className="h-12 w-12 bg-cyber-elevated rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-cyber-elevated rounded" />
                <div className="h-3 w-1/2 bg-cyber-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-cyber-surface/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Attack Timeline</h3>
              <p className="text-xs text-cyber-secondary">Recent security events</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg bg-cyber-bg p-1">
            {[
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTimeRange(id as typeof timeRange)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === id
                    ? 'bg-cyber-elevated text-white'
                    : 'text-cyber-secondary hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex rounded-lg bg-cyber-bg p-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'critical', label: 'Critical' },
              { id: 'high', label: 'High+' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id as typeof filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === id
                    ? 'bg-cyber-elevated text-white'
                    : 'text-cyber-secondary hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-800" />

          {/* Timeline items */}
          <div className="space-y-4">
            {filteredNews.map((item, index) => {
              const Icon = getThreatIcon(item.threat_type);
              const colors = getSeverityColor(item.severity);

              return (
                <div key={item.id} className="relative pl-12 group">
                  {/* Timeline dot */}
                  <div className={`absolute left-3 top-2 w-4 h-4 rounded-full ${colors.bg} ring-4 ring-cyber-surface z-10`} />
                  
                  {/* Time */}
                  <div className="absolute left-0 top-0 w-10 text-center">
                    <span className="text-[10px] text-cyber-secondary font-mono">
                      {formatTimeSlot(item.published_at)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className={`rounded-xl bg-cyber-bg/50 border ${colors.border} p-4 hover:bg-cyber-bg transition-colors`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.text} bg-current/10`}>
                            {item.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-cyber-elevated text-cyber-secondary">
                            {item.threat_type}
                          </span>
                          <span className="text-xs text-cyber-secondary">
                            {formatTime(item.published_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-medium text-white mb-1 line-clamp-2 group-hover:text-cyber-primary transition-colors">
                          {item.title}
                        </h4>

                        {/* Source */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyber-secondary">via {item.source}</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyber-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Icon */}
                      <div className={`shrink-0 p-2 rounded-lg ${colors.text.replace('text-', 'bg-')}/10`}>
                        <Icon className={`h-4 w-4 ${colors.text}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-700 mx-auto mb-3" />
            <p className="text-cyber-secondary">No events match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
