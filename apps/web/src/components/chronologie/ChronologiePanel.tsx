import { useMemo, useState } from 'react';
import {
  ClipboardList,
  Filter,
  Plus,
  Trash2,
  AlertTriangle,
  Inbox,
  User,
  Bot,
  ClipboardCheck,
  ShieldOff,
  Building2,
  Download as DownloadIcon,
  Settings as Cog,
} from 'lucide-react';
import {
  useMainCouranteStore,
  ENTRY_TYPE_META,
  type EntryType,
  type MainCouranteEntry,
} from '../../store/mainCouranteStore';

const TYPE_ICON: Record<EntryType, typeof ClipboardList> = {
  qualification: ClipboardCheck,
  containment: ShieldOff,
  obligation: Building2,
  export: DownloadIcon,
  manual: User,
  system: Cog,
};

const TYPE_COLOR_STYLES: Record<string, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  orange: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  slate: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function ChronologiePanel() {
  const entries = useMainCouranteStore((s) => s.entries);
  const addEntry = useMainCouranteStore((s) => s.addEntry);
  const removeEntry = useMainCouranteStore((s) => s.removeEntry);
  const clear = useMainCouranteStore((s) => s.clear);

  const [filter, setFilter] = useState<EntryType | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    author: '',
    description: '',
    scope: '',
    type: 'manual' as EntryType,
  });

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [entries]);

  const filtered = useMemo(() => {
    if (filter === 'all') return sorted;
    return sorted.filter((e) => e.type === filter);
  }, [sorted, filter]);

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.type] = (counts[e.type] ?? 0) + 1;
    return counts;
  }, [entries]);

  const handleSubmit = () => {
    if (!draft.description.trim()) return;
    addEntry({
      author: draft.author.trim() || 'Manuel',
      description: draft.description.trim(),
      scope: draft.scope.trim() || undefined,
      type: draft.type,
      auto: false,
    });
    setDraft({ author: '', description: '', scope: '', type: 'manual' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4" data-testid="chronologie-panel">
      {/* Avertissement de sécurité */}
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
        <p className="text-xs text-red-100 leading-relaxed">
          <strong>Avertissement sécurité :</strong> ne stockez pas cette main courante sur un système
          potentiellement compromis. Préférez un appareil sain ou un export imprimé pour les preuves.
        </p>
      </div>

      {/* Header avec filtres */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-white inline-flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-cyan-400" />
              Chronologie / Main courante
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Journal horodaté de toutes les actions de gestion de l'incident.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors"
              data-testid="chrono-add-btn"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une entrée
            </button>
            {entries.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Vider toute la main courante ? Cette action est irréversible.')) {
                    clear();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-red-500/50 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-300 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Vider
              </button>
            )}
          </div>
        </div>

        {/* Form d'ajout manuel */}
        {showForm && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 mb-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Auteur (ex: Jean Dupont)"
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                className="rounded-lg bg-slate-900 border border-slate-700 text-sm text-white px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as EntryType })}
                className="rounded-lg bg-slate-900 border border-slate-700 text-sm text-white px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="manual">Manuel</option>
                <option value="qualification">Qualification</option>
                <option value="containment">Endiguement</option>
                <option value="obligation">Obligation</option>
                <option value="system">Système</option>
              </select>
              <input
                type="text"
                placeholder="Machines / comptes / services concernés"
                value={draft.scope}
                onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                className="rounded-lg bg-slate-900 border border-slate-700 text-sm text-white px-3 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <textarea
              placeholder="Description de l'événement (obligatoire)"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 text-sm text-white px-3 py-1.5 focus:outline-none focus:border-cyan-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!draft.description.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-bold text-slate-900 transition-colors"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Filtres par type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Tout ({entries.length})
          </button>
          {(Object.keys(ENTRY_TYPE_META) as EntryType[]).map((t) => {
            const meta = ENTRY_TYPE_META[t];
            const count = countsByType[t] ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
                  filter === t
                    ? TYPE_COLOR_STYLES[meta.color] + ' border'
                    : 'border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <Inbox className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Aucune entrée</h3>
          <p className="text-sm text-slate-400">
            {filter === 'all'
              ? 'La main courante est vide. Commencez par qualifier un incident ou ajoutez une entrée manuelle.'
              : 'Aucune entrée de ce type. Changez de filtre pour voir tout l\'historique.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60 border-b border-slate-700">
                <tr>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2 whitespace-nowrap">Date · Heure</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2">Auteur</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2">Type</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2">Description</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2">Contexte</th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-slate-400 font-bold px-3 py-2">Source</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e: MainCouranteEntry) => {
                  const meta = ENTRY_TYPE_META[e.type] ?? ENTRY_TYPE_META.manual;
                  const Icon = TYPE_ICON[e.type] ?? Cog;
                  const colorClass = TYPE_COLOR_STYLES[meta.color] ?? TYPE_COLOR_STYLES.slate;
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                      data-testid="chrono-entry"
                    >
                      <td className="px-3 py-2 text-xs text-slate-300 font-mono whitespace-nowrap align-top">
                        {formatTimestamp(e.timestamp)}
                      </td>
                      <td className="px-3 py-2 text-xs text-white align-top">{e.author}</td>
                      <td className="px-3 py-2 align-top">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${colorClass}`}
                        >
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-200 align-top max-w-md">
                        {e.description}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400 align-top">
                        {e.scope ?? '—'}
                      </td>
                      <td className="px-3 py-2 align-top">
                        {e.auto ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-700/40 text-slate-300 border border-slate-700 px-1.5 py-0.5 text-[10px] font-medium">
                            <Bot className="h-3 w-3" />
                            Auto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-medium">
                            <User className="h-3 w-3" />
                            Manuel
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <button
                          onClick={() => removeEntry(e.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Supprimer cette entrée"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-800/40 px-3 py-2 text-[11px] text-slate-400 border-t border-slate-700">
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} sur {entries.length} au total
          </div>
        </div>
      )}
    </div>
  );
}
