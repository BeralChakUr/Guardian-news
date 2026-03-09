import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, RefreshCw, AlertTriangle, Shield, Users, Zap, Clock, ExternalLink, Bot } from 'lucide-react';
import { getAISummary, type AISummaryResponse } from '../services/newsService';

type SummaryMode = 'simple' | 'executive' | 'analyst';

const modeLabels = {
  simple: 'Simple',
  executive: 'Exécutif',
  analyst: 'Analyste',
};

const severityColors: Record<string, string> = {
  critique: 'bg-red-500/20 text-red-400',
  élevée: 'bg-orange-500/20 text-orange-400',
  moyenne: 'bg-yellow-500/20 text-yellow-400',
  faible: 'bg-green-500/20 text-green-400',
  eleve: 'bg-orange-500/20 text-orange-400',
  moyen: 'bg-yellow-500/20 text-yellow-400',
};

export default function AIThreatSummaryReal() {
  const [mode, setMode] = useState<SummaryMode>('simple');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-summary', mode],
    queryFn: () => getAISummary(mode, 5),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ai-summary', mode] });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-primary/20 to-cyan-500/20">
            <Bot className="h-5 w-5 text-cyber-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Résumé IA des Menaces</h3>
            <p className="text-xs text-cyber-secondary">Analyse en cours...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 bg-cyber-elevated rounded" />
          <div className="h-20 w-full bg-cyber-elevated rounded" />
          <div className="h-16 w-full bg-cyber-elevated rounded" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-red-500/30 p-6">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-4">Impossible de charger le résumé IA</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-cyber-primary text-white text-sm hover:bg-cyber-primary/80"
          >
            Réessayer
          </button>
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
              <Bot className="h-5 w-5 text-cyber-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Résumé IA des Menaces</h3>
              <div className="flex items-center gap-2 text-xs text-cyber-secondary">
                <Clock className="h-3 w-3" />
                <span>
                  {data.generated_at ? new Date(data.generated_at).toLocaleString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'À l\'instant'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg hover:bg-cyber-elevated transition-colors disabled:opacity-50"
            title="Régénérer le résumé"
          >
            <RefreshCw className={`h-4 w-4 text-cyber-secondary ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mt-4">
          {(['simple', 'executive', 'analyst'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-cyber-primary text-white'
                  : 'text-cyber-secondary hover:text-white hover:bg-cyber-elevated'
              }`}
            >
              {m === 'simple' && <Shield className="h-3.5 w-3.5" />}
              {m === 'executive' && <Users className="h-3.5 w-3.5" />}
              {m === 'analyst' && <Zap className="h-3.5 w-3.5" />}
              {modeLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Global Summary */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">Synthèse Globale</h4>
            <p className="text-sm text-cyber-secondary leading-relaxed">
              {data.global_summary}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Items */}
      <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {data.items.map((item, index) => (
          <div
            key={item.article_id || index}
            className="p-4 rounded-xl bg-cyber-bg/50 border border-gray-800 hover:border-cyber-primary/30 transition-colors"
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[item.severity] || 'bg-gray-500/20 text-gray-400'}`}>
                {item.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-cyber-elevated text-cyber-secondary">
                {item.threat_type}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-medium text-white mb-2">
              {item.title_fr}
            </h4>

            {/* Summary */}
            <p className="text-sm text-cyber-secondary mb-3 leading-relaxed">
              {item.summary}
            </p>

            {/* Key Info */}
            {item.key_info && (
              <div className="p-2 rounded-lg bg-cyan-500/10 text-xs text-cyan-400 mb-3">
                <span className="font-medium">Info clé :</span> {item.key_info}
              </div>
            )}

            {/* Action */}
            {item.action && (
              <div className="p-2 rounded-lg bg-green-500/10 text-xs text-green-400 mb-3">
                <span className="font-medium">Action :</span> {item.action}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <span className="text-xs text-cyber-secondary">
                {item.source}
              </span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-cyber-primary hover:underline"
              >
                Source
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
