import { Zap, Swords, Globe, LayoutGrid } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  icon?: typeof Zap;
  description?: string;
}

export const DEFAULT_FILTER_CHIPS: FilterChip[] = [
  { id: 'all', label: 'Tous', icon: LayoutGrid, description: 'Toutes les actualités' },
  { id: 'urgence', label: 'Urgence', icon: Zap, description: 'Critique & Élevé' },
  { id: 'attaque', label: 'Attaque', icon: Swords, description: 'Ransomware, malware, APT...' },
  { id: 'france', label: 'France', icon: Globe, description: 'Alertes France uniquement' },
];

interface FilterChipsProps {
  value: string;
  onChange: (id: string) => void;
  chips?: FilterChip[];
  counts?: Partial<Record<string, number>>;
}

export default function FilterChips({ value, onChange, chips = DEFAULT_FILTER_CHIPS, counts }: FilterChipsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtres rapides"
      className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      data-testid="filter-chips"
    >
      {chips.map((chip) => {
        const Icon = chip.icon;
        const active = value === chip.id;
        const count = counts?.[chip.id];
        return (
          <button
            key={chip.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(chip.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              active
                ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
            }`}
            data-testid={`filter-chip-${chip.id}`}
            title={chip.description}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{chip.label}</span>
            {typeof count === 'number' && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  active ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
