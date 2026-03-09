import { useState } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, Shield, TrendingUp, Users, ChevronRight, Zap, Clock } from 'lucide-react';
import type { NewsItem } from '../services/newsService';

interface AIThreatSummaryProps {
  news: NewsItem[];
  isLoading?: boolean;
}

type SummaryMode = 'executive' | 'analyst' | 'beginner';

export default function AIThreatSummary({ news, isLoading }: AIThreatSummaryProps) {
  const [mode, setMode] = useState<SummaryMode>('executive');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate AI-like summary based on actual news data
  const generateSummary = () => {
    const criticalNews = news.filter(n => n.severity === 'critique' || n.severity === 'eleve');
    const threatTypes = [...new Set(news.map(n => n.threat_type))];
    const sources = [...new Set(news.map(n => n.source))];

    const topThreats = criticalNews.slice(0, 3).map(n => n.title);
    
    return {
      topThreats,
      threatTypes: threatTypes.slice(0, 4),
      sources: sources.slice(0, 5),
      criticalCount: news.filter(n => n.severity === 'critique').length,
      highCount: news.filter(n => n.severity === 'eleve').length,
    };
  };

  const summary = generateSummary();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const renderSummary = () => {
    switch (mode) {
      case 'executive':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Key Risks Today</h4>
                <p className="text-sm text-cyber-secondary">
                  {summary.criticalCount} critical and {summary.highCount} high-severity threats detected. 
                  Primary vectors: {summary.threatTypes.slice(0, 2).join(', ')}.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Trending Threats</h4>
                <ul className="text-sm text-cyber-secondary space-y-1">
                  {summary.topThreats.slice(0, 2).map((threat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-cyber-primary" />
                      <span className="line-clamp-1">{threat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Recommended Actions</h4>
                <p className="text-sm text-cyber-secondary">
                  Review critical patches, verify backup systems, and monitor network for IOCs.
                </p>
              </div>
            </div>
          </div>
        );

      case 'analyst':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-cyber-elevated">
                <div className="text-xs text-cyber-secondary mb-1">Critical Alerts</div>
                <div className="text-2xl font-bold text-red-400">{summary.criticalCount}</div>
              </div>
              <div className="p-3 rounded-lg bg-cyber-elevated">
                <div className="text-xs text-cyber-secondary mb-1">High Severity</div>
                <div className="text-2xl font-bold text-orange-400">{summary.highCount}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Active Threat Vectors</h4>
              <div className="flex flex-wrap gap-2">
                {summary.threatTypes.map((type, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-cyber-primary/20 text-cyber-primary text-xs">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-2">Top Incidents</h4>
              <ul className="space-y-2">
                {summary.topThreats.map((threat, i) => (
                  <li key={i} className="text-sm text-cyber-secondary flex items-start gap-2">
                    <span className="text-cyber-primary font-mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="line-clamp-1">{threat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-2">Intelligence Sources</h4>
              <div className="flex flex-wrap gap-1">
                {summary.sources.map((source, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-cyber-bg text-xs text-gray-400">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'beginner':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyber-primary/10 to-cyan-500/10 border border-cyber-primary/20">
              <h4 className="font-medium text-white mb-2">🎯 What's Happening Today?</h4>
              <p className="text-sm text-cyber-secondary leading-relaxed">
                We've detected {summary.criticalCount + summary.highCount} important security alerts. 
                The main threats are related to {summary.threatTypes.slice(0, 2).join(' and ')}.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-white mb-3">📋 What Should You Do?</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-3 text-sm text-cyber-secondary">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">1</span>
                  Update your software and apps to the latest versions
                </li>
                <li className="flex items-start gap-3 text-sm text-cyber-secondary">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">2</span>
                  Be careful with suspicious emails and links
                </li>
                <li className="flex items-start gap-3 text-sm text-cyber-secondary">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs text-green-400">3</span>
                  Make sure your passwords are strong and unique
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                💡 Tip: Enable two-factor authentication on your important accounts!
              </p>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cyber-surface border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 bg-cyber-elevated rounded" />
          <div className="h-4 w-full bg-cyber-elevated rounded" />
          <div className="h-4 w-3/4 bg-cyber-elevated rounded" />
          <div className="h-20 w-full bg-cyber-elevated rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-cyber-surface/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-primary/20 to-cyan-500/20">
              <Sparkles className="h-5 w-5 text-cyber-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Threat Summary</h3>
              <div className="flex items-center gap-2 text-xs text-cyber-secondary">
                <Clock className="h-3 w-3" />
                <span>Updated just now</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-cyber-elevated transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-cyber-secondary ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'executive', label: 'Executive', icon: Users },
            { id: 'analyst', label: 'Analyst', icon: Zap },
            { id: 'beginner', label: 'Simple', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id as SummaryMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === id
                  ? 'bg-cyber-primary text-white'
                  : 'text-cyber-secondary hover:text-white hover:bg-cyber-elevated'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {renderSummary()}
      </div>

      {/* Badges */}
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-2">
          {summary.criticalCount > 0 && (
            <span className="px-2 py-1 rounded-md bg-red-500/20 text-red-400 text-xs font-medium">
              {summary.criticalCount} Critical
            </span>
          )}
          {news.some(n => n.threat_type === 'ransomware') && (
            <span className="px-2 py-1 rounded-md bg-orange-500/20 text-orange-400 text-xs font-medium">
              Ransomware
            </span>
          )}
          {news.some(n => n.threat_type === 'vuln') && (
            <span className="px-2 py-1 rounded-md bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              Vulnerabilities
            </span>
          )}
          {news.some(n => n.threat_type === 'phishing') && (
            <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-medium">
              Phishing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
