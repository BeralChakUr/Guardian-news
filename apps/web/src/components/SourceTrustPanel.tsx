import { Shield, CheckCircle, Globe, Star } from 'lucide-react';

const sources = [
  { name: 'CERT-FR', trust: 10, status: 'active', items: 6, flag: '🇫🇷' },
  { name: 'CISA', trust: 10, status: 'active', items: 11, flag: '🇺🇸' },
  { name: 'BleepingComputer', trust: 8, status: 'active', items: 15, flag: '🌐' },
  { name: 'The Hacker News', trust: 7, status: 'active', items: 20, flag: '🌐' },
  { name: 'Dark Reading', trust: 7, status: 'active', items: 20, flag: '🌐' },
  { name: 'Krebs on Security', trust: 8, status: 'active', items: 5, flag: '🌐' },
  { name: 'Malwarebytes Labs', trust: 8, status: 'active', items: 15, flag: '🌐' },
  { name: 'Microsoft Security', trust: 9, status: 'active', items: 6, flag: '🌐' },
];

interface SourceTrustPanelProps {
  isLoading?: boolean;
}

export default function SourceTrustPanel({ isLoading }: SourceTrustPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cyber-surface border border-gray-800 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 w-40 bg-cyber-elevated rounded" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-cyber-elevated rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-cyber-surface/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/20">
            <Globe className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Trusted Sources</h3>
            <p className="text-xs text-cyber-secondary">{sources.length} active intelligence feeds</p>
          </div>
        </div>
      </div>

      {/* Sources list */}
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {sources.map((source, index) => (
          <div
            key={source.name}
            className="flex items-center justify-between p-3 rounded-xl bg-cyber-bg/50 hover:bg-cyber-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{source.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{source.name}</span>
                  {source.trust >= 9 && (
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <span className="text-xs text-cyber-secondary">{source.items} articles</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Trust badge */}
              <div className="flex items-center gap-1">
                <Shield className={`h-3 w-3 ${
                  source.trust >= 9 ? 'text-green-400' :
                  source.trust >= 7 ? 'text-cyan-400' :
                  'text-yellow-400'
                }`} />
                <span className="text-xs text-cyber-secondary">{source.trust}/10</span>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  source.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-xs text-green-400">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-cyber-secondary">Last sync: Just now</span>
          <div className="flex items-center gap-1 text-green-400">
            <CheckCircle className="h-3 w-3" />
            All sources operational
          </div>
        </div>
      </div>
    </div>
  );
}
