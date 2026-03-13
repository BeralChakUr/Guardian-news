import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Users, 
  Zap, 
  Clock, 
  ExternalLink, 
  Bot,
  Briefcase,
  Code,
  Target,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { getAISummary, type AISummaryResponse } from '../services/newsService';

type SummaryMode = 'simple' | 'executive' | 'analyst';

const modeConfig = {
  simple: {
    label: 'Simple',
    icon: Users,
    description: 'Grand public',
    color: 'from-cyan-500 to-blue-500',
  },
  executive: {
    label: 'Exécutif',
    icon: Briefcase,
    description: 'Décideurs',
    color: 'from-purple-500 to-pink-500',
  },
  analyst: {
    label: 'Analyste',
    icon: Code,
    description: 'Professionnels',
    color: 'from-orange-500 to-red-500',
  },
};

const severityColors: Record<string, string> = {
  critique: 'bg-red-500/20 text-red-400',
  élevée: 'bg-orange-500/20 text-orange-400',
  eleve: 'bg-orange-500/20 text-orange-400',
  moyenne: 'bg-yellow-500/20 text-yellow-400',
  moyen: 'bg-yellow-500/20 text-yellow-400',
  faible: 'bg-green-500/20 text-green-400',
};

// Component to render Simple mode content
function SimpleContent({ data }: { data: AISummaryResponse }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
          <p className="text-slate-300 leading-relaxed">
            {data.global_summary}
          </p>
        </div>
      </div>
      
      {data.items && data.items.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400 font-medium">Points clés :</p>
          {data.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
              <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-sm">{item.title_fr || item.article_title}</p>
                {item.action && (
                  <p className="text-xs text-slate-500 mt-1">💡 {item.action}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component to render Executive mode content
function ExecutiveContent({ data }: { data: AISummaryResponse }) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
        <h4 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Résumé Exécutif
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
          {data.global_summary}
        </p>
      </div>

      {/* Business Impact */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Impact Business
        </h4>
        <div className="space-y-2">
          {data.items?.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[item.severity] || severityColors.moyen}`}>
                {item.severity}
              </span>
              <p className="text-slate-400 text-sm flex-1">{item.summary || item.title_fr}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Recommandations
        </h4>
        <ul className="space-y-2">
          {data.items?.slice(0, 3).map((item, index) => (
            item.action && (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-400">→</span>
                {item.action}
              </li>
            )
          ))}
          <li className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-green-400">→</span>
            Maintenir une veille active sur les sources officielles
          </li>
        </ul>
      </div>
    </div>
  );
}

// Component to render Analyst mode content
function AnalystContent({ data }: { data: AISummaryResponse }) {
  return (
    <div className="space-y-6">
      {/* Threat Overview */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30">
        <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Vue d'ensemble des Menaces
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">
          {data.global_summary}
        </p>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-4">
        {data.items?.slice(0, 4).map((item, index) => (
          <div key={index} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h5 className="text-white font-medium text-sm">{item.title_fr || item.article_title}</h5>
              <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${severityColors[item.severity] || severityColors.moyen}`}>
                {item.severity}
              </span>
            </div>
            
            {item.summary && (
              <p className="text-slate-400 text-sm mb-3">{item.summary}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded bg-slate-700/30">
                <span className="text-slate-500">Type de menace</span>
                <p className="text-cyan-400 font-medium mt-0.5">{item.threat_type || 'Non classifié'}</p>
              </div>
              {item.key_info && (
                <div className="p-2 rounded bg-slate-700/30">
                  <span className="text-slate-500">Info technique</span>
                  <p className="text-orange-400 font-medium mt-0.5">{item.key_info}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mitigation Actions */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Actions de Mitigation
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {data.items?.slice(0, 4).map((item, index) => (
            item.action && (
              <div key={index} className="flex items-start gap-2 p-2 rounded bg-slate-700/30">
                <Zap className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-300">{item.action}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Tools Recommendation */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Outils Recommandés
        </h4>
        <div className="flex flex-wrap gap-2">
          {['SIEM Monitoring', 'EDR/XDR', 'Threat Intel', 'Vulnerability Scanner', 'Network Anomaly'].map((tool) => (
            <span key={tool} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    refetch();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 overflow-hidden"
      data-testid="ai-threat-summary"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${modeConfig[mode].color}`}>
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Résumé IA des Menaces</h3>
              <p className="text-xs text-slate-500">Analyse automatique par Guardian AI</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors disabled:opacity-50"
            title="Régénérer le résumé"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2">
          {(Object.keys(modeConfig) as SummaryMode[]).map((m) => {
            const config = modeConfig[m];
            const Icon = config.icon;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? `bg-gradient-to-r ${config.color} text-white`
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-700/50 rounded animate-pulse w-5/6" />
            <div className="h-20 bg-slate-700/50 rounded animate-pulse mt-4" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-white font-medium">Impossible de charger le résumé IA</p>
              <p className="text-sm text-slate-400">Veuillez réessayer dans quelques instants</p>
            </div>
          </div>
        ) : data ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'simple' && <SimpleContent data={data} />}
              {mode === 'executive' && <ExecutiveContent data={data} />}
              {mode === 'analyst' && <AnalystContent data={data} />}
            </motion.div>
          </AnimatePresence>
        ) : null}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Mis à jour : {data?.generated_at ? new Date(data.generated_at).toLocaleString('fr-FR') : 'N/A'}</span>
          </div>
          <span className="text-slate-600">Mode : {modeConfig[mode].description}</span>
        </div>
      </div>
    </motion.div>
  );
}
