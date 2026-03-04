import { AlertCircle, TrendingUp, Activity } from 'lucide-react';
import type { CyberTension } from '../services/newsService';

interface TensionBannerProps {
  tension: CyberTension | null;
  loading: boolean;
}

export default function TensionBanner({ tension, loading }: TensionBannerProps) {
  if (loading) {
    return (
      <div className="mb-6 animate-pulse rounded-2xl bg-cyber-surface p-6">
        <div className="h-6 w-48 rounded bg-cyber-elevated" />
        <div className="mt-2 h-4 w-64 rounded bg-cyber-elevated" />
      </div>
    );
  }

  if (!tension) return null;

  const getTensionStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critique':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          text: 'text-red-400',
          icon: 'text-red-500',
        };
      case 'élevé':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30',
          text: 'text-orange-400',
          icon: 'text-orange-500',
        };
      case 'modéré':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30',
          text: 'text-yellow-400',
          icon: 'text-yellow-500',
        };
      default:
        return {
          bg: 'bg-green-500/10 border-green-500/30',
          text: 'text-green-400',
          icon: 'text-green-500',
        };
    }
  };

  const style = getTensionStyle(tension.level);

  return (
    <div className={`mb-6 rounded-2xl border p-6 ${style.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className={`h-6 w-6 ${style.icon}`} />
          <div>
            <h2 className={`text-lg font-bold ${style.text}`}>
              Niveau de menace : {tension.level}
            </h2>
            <p className="text-sm text-cyber-secondary">{tension.reason}</p>
          </div>
        </div>
        <div className={`rounded-full px-4 py-2 ${style.bg}`}>
          <span className={`text-2xl font-bold ${style.text}`}>{tension.score}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        {tension.critical_count > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">
              {tension.critical_count} critique{tension.critical_count > 1 ? 's' : ''}
            </span>
          </div>
        )}
        {tension.high_count > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/20 px-3 py-1">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-400">
              {tension.high_count} élevée{tension.high_count > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
