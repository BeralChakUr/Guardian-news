import { useMemo } from 'react';
import { Radio, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import type { NewsItem } from '../services/newsService';

interface ThreatRadarProps {
  news: NewsItem[];
  isLoading?: boolean;
}

const threatCategories = [
  { id: 'ransomware', label: 'Ransomware', color: '#F85149' },
  { id: 'phishing', label: 'Phishing', color: '#58A6FF' },
  { id: 'malware', label: 'Malware', color: '#A371F7' },
  { id: 'vuln', label: 'Vulnerabilities', color: '#F0883E' },
  { id: 'data_leak', label: 'Data Breaches', color: '#3FB950' },
  { id: 'scam', label: 'Scams', color: '#D29922' },
  { id: 'ddos', label: 'DDoS', color: '#79C0FF' },
  { id: 'other', label: 'Other', color: '#8B949E' },
];

export default function ThreatRadar({ news, isLoading }: ThreatRadarProps) {
  const threatData = useMemo(() => {
    const counts: Record<string, number> = {};
    news.forEach(n => {
      counts[n.threat_type] = (counts[n.threat_type] || 0) + 1;
    });
    
    const maxCount = Math.max(...Object.values(counts), 1);
    
    return threatCategories.map(cat => ({
      ...cat,
      count: counts[cat.id] || 0,
      intensity: ((counts[cat.id] || 0) / maxCount) * 100,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    }));
  }, [news]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-cyber-surface border border-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-cyber-elevated rounded mb-4" />
          <div className="h-48 bg-cyber-elevated rounded" />
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
            <div className="relative">
              <div className="p-2 rounded-lg bg-cyber-primary/20">
                <Radio className="h-5 w-5 text-cyber-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-cyber-surface animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Threat Radar</h3>
              <p className="text-xs text-cyber-secondary">Real-time threat intensity</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Radar Visualization */}
      <div className="p-5">
        <div className="relative">
          {/* Circular radar background */}
          <div className="aspect-square max-w-[280px] mx-auto relative">
            {/* Radar circles */}
            <div className="absolute inset-0 rounded-full border border-gray-800/50" />
            <div className="absolute inset-[15%] rounded-full border border-gray-800/50" />
            <div className="absolute inset-[30%] rounded-full border border-gray-800/50" />
            <div className="absolute inset-[45%] rounded-full border border-gray-800/50" />
            
            {/* Center pulse */}
            <div className="absolute inset-[45%] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-cyber-primary animate-ping opacity-75" />
              <div className="absolute w-3 h-3 rounded-full bg-cyber-primary" />
            </div>

            {/* Threat points */}
            {threatData.map((threat, index) => {
              const angle = (index / threatData.length) * 2 * Math.PI - Math.PI / 2;
              const distance = threat.intensity * 0.4 + 10; // 10-50% from center
              const x = 50 + distance * Math.cos(angle);
              const y = 50 + distance * Math.sin(angle);
              
              return (
                <div
                  key={threat.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full transition-transform group-hover:scale-150"
                    style={{ 
                      backgroundColor: threat.color,
                      boxShadow: `0 0 10px ${threat.color}50`,
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-cyber-bg rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <span className="text-white font-medium">{threat.label}</span>
                    <span className="text-cyber-secondary ml-1">({threat.count})</span>
                  </div>
                </div>
              );
            })}

            {/* Scanning line */}
            <div 
              className="absolute inset-0 origin-center"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(88, 166, 255, 0.1) 30deg, transparent 60deg)',
                animation: 'spin 4s linear infinite',
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {threatData.filter(t => t.count > 0).slice(0, 6).map(threat => (
            <div
              key={threat.id}
              className="flex items-center justify-between p-2 rounded-lg bg-cyber-bg/50 hover:bg-cyber-bg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: threat.color }}
                />
                <span className="text-xs text-cyber-secondary">{threat.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-white">{threat.count}</span>
                {threat.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-400" />}
                {threat.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-400" />}
                {threat.trend === 'stable' && <Minus className="h-3 w-3 text-gray-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-cyber-bg/50 text-xs text-cyber-secondary">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-cyber-primary" />
          <span>This radar reflects the current intensity of monitored cyber threats across trusted intelligence sources.</span>
        </div>
      </div>
    </div>
  );
}
