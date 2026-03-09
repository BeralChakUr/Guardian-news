import { Activity, AlertTriangle, Shield, Bug, TrendingUp, Clock, Radio } from 'lucide-react';
import type { CyberTension } from '../services/newsService';

interface CommandCenterProps {
  tension: CyberTension | null;
  totalNews: number;
  criticalCount: number;
  newToday: number;
  isLoading?: boolean;
}

export default function CommandCenter({ tension, totalNews, criticalCount, newToday, isLoading }: CommandCenterProps) {
  const getTensionColor = () => {
    if (!tension) return { bg: 'bg-gray-500', text: 'text-gray-400', glow: '' };
    if (tension.score >= 70) return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
    if (tension.score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/50' };
    return { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' };
  };

  const colors = getTensionColor();

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-cyber-surface via-cyber-elevated to-cyber-surface border border-gray-800 p-6">
        <div className="animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-cyber-bg rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-cyber-bg rounded" />
              <div className="h-6 w-24 bg-cyber-bg rounded" />
            </div>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center">
                <div className="h-8 w-12 bg-cyber-bg rounded mb-1" />
                <div className="h-3 w-16 bg-cyber-bg rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyber-surface via-cyber-elevated to-cyber-surface border border-gray-800">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyber-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-primary/5 rounded-full blur-3xl" />
      
      <div className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Threat Level */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-full ${colors.bg}/20 flex items-center justify-center ring-4 ring-cyber-surface shadow-lg ${colors.glow}`}>
                <Activity className={`h-8 w-8 ${colors.text}`} />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-cyber-secondary">Threat Level</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  <Radio className="h-3 w-3" />
                  Live
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${colors.text}`}>
                  {tension?.level || 'Unknown'}
                </span>
                <span className="text-lg text-cyber-secondary">
                  ({tension?.score || 0}/100)
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
            <div className="text-center p-3 rounded-xl bg-cyber-bg/50 hover:bg-cyber-bg transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-2xl font-bold text-white">{criticalCount}</span>
              </div>
              <span className="text-xs text-cyber-secondary">Critical Alerts</span>
            </div>

            <div className="text-center p-3 rounded-xl bg-cyber-bg/50 hover:bg-cyber-bg transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Bug className="h-4 w-4 text-orange-400" />
                <span className="text-2xl font-bold text-white">{totalNews}</span>
              </div>
              <span className="text-xs text-cyber-secondary">Threats Tracked</span>
            </div>

            <div className="text-center p-3 rounded-xl bg-cyber-bg/50 hover:bg-cyber-bg transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-2xl font-bold text-white">{newToday}</span>
              </div>
              <span className="text-xs text-cyber-secondary">New Today</span>
            </div>

            <div className="text-center p-3 rounded-xl bg-cyber-bg/50 hover:bg-cyber-bg transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-2xl font-bold text-white">10+</span>
              </div>
              <span className="text-xs text-cyber-secondary">Sources Active</span>
            </div>
          </div>
        </div>

        {/* Reason banner */}
        {tension?.reason && (
          <div className="mt-4 p-3 rounded-lg bg-cyber-bg/50 border-l-2 border-cyber-primary">
            <p className="text-sm text-cyber-secondary">
              <span className="text-cyber-primary font-medium">Assessment: </span>
              {tension.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
