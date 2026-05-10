import { useMemo, useState, useEffect } from 'react';
import {
  ShieldOff,
  Mail,
  Globe,
  Skull,
  Activity,
  Server,
  AlertTriangle,
  Check,
  ArrowRight,
  RotateCcw,
  Microscope,
} from 'lucide-react';
import {
  CONTAINMENT_PLAYBOOKS,
  CONTAINMENT_BY_ID,
  CATEGORY_META,
  SEVERITY_LABEL,
  QUALIFICATION_TO_CONTAINMENT,
  type ContainmentPlaybook,
  type ContainmentSeverity,
} from '../../data/containmentPlaybooks';
import { useMainCouranteStore } from '../../store/mainCouranteStore';
import { useCentreOpStore } from '../../store/centreOpStore';

const ICON_MAP: Record<string, typeof Skull> = {
  ransomware: Skull,
  mail_account_compromise: Mail,
  website_defacement: Globe,
  ddos: Activity,
  system_compromise: Server,
};

const SEVERITY_STYLE: Record<ContainmentSeverity, { color: string; bg: string; border: string }> = {
  critical: { color: 'text-red-300', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  high: { color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  medium: { color: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  low: { color: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
};

const PRIORITY_STYLE: Record<number, { label: string; color: string }> = {
  1: { label: 'P1 — Immédiat', color: 'bg-red-500/20 text-red-200 border-red-500/40' },
  2: { label: 'P2 — Très haut', color: 'bg-orange-500/20 text-orange-200 border-orange-500/40' },
  3: { label: 'P3 — Haut', color: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40' },
  4: { label: 'P4 — Moyen', color: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40' },
  5: { label: 'P5 — Faible', color: 'bg-slate-500/20 text-slate-200 border-slate-500/40' },
};

interface Props {
  /** Incident hérité depuis l'onglet Qualification (ID au format Qualification ou Endiguement) */
  inheritedIncidentType?: string | null;
}

export default function ContainmentPanel({ inheritedIncidentType }: Props) {
  // Mappe l'ID Qualification → ID Endiguement si nécessaire
  const initialId = useMemo(() => {
    if (!inheritedIncidentType) return null;
    return QUALIFICATION_TO_CONTAINMENT[inheritedIncidentType] ?? inheritedIncidentType;
  }, [inheritedIncidentType]);

  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  // Cases cochées par action (clé = `${groupIndex}:${actionIndex}` pour priority_actions, `analyst:${gIdx}:${aIdx}` pour analyst_actions)
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const addEntry = useMainCouranteStore((s) => s.addEntry);
  const mode = useCentreOpStore((s) => s.mode);

  // Hérite si Qualification met à jour le choix
  useEffect(() => {
    if (initialId && initialId !== selectedId) {
      setSelectedId(initialId);
      setChecked({});
    }
  }, [initialId]); // eslint-disable-line react-hooks/exhaustive-deps

  const playbook: ContainmentPlaybook | null = selectedId ? CONTAINMENT_BY_ID[selectedId] ?? null : null;

  const totalActions = playbook
    ? playbook.priority_actions.reduce((sum, g) => sum + g.actions.length, 0)
    : 0;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const progress = totalActions > 0 ? Math.round((doneCount / totalActions) * 100) : 0;

  const toggle = (gIdx: number, aIdx: number, action: string, group: string, isAnalyst = false) => {
    const key = isAnalyst ? `analyst:${gIdx}:${aIdx}` : `${gIdx}:${aIdx}`;
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Si on coche (passage false→true), on log dans la main courante
      if (!prev[key]) {
        addEntry({
          author: isAnalyst ? 'Endiguement (Analyste)' : 'Endiguement',
          description: `✓ ${action}`,
          scope: group,
          auto: true,
        });
      }
      return next;
    });
  };

  const reset = () => {
    setSelectedId(null);
    setChecked({});
  };

  if (!playbook) {
    // Vue sélection d'incident
    return (
      <div className="space-y-5" data-testid="containment-panel">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5">
          <h2 className="text-lg font-bold text-white mb-1">Sélectionnez le type d'incident</h2>
          <p className="text-sm text-slate-400 mb-5">
            Choisissez un playbook d'endiguement adapté à la situation. Chaque action cochée sera
            ajoutée automatiquement à la main courante.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
            {CONTAINMENT_PLAYBOOKS.map((pb) => {
              const Icon = ICON_MAP[pb.incident_type] ?? ShieldOff;
              const sev = SEVERITY_STYLE[pb.severity];
              return (
                <button
                  key={pb.incident_type}
                  type="button"
                  onClick={() => setSelectedId(pb.incident_type)}
                  className="text-left rounded-xl border border-slate-700 bg-slate-800/30 hover:border-cyan-500/40 hover:bg-slate-800/60 p-4 transition-all flex flex-col h-full"
                  data-testid={`containment-card-${pb.incident_type}`}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sev.color} ${sev.bg} ${sev.border}`}
                    >
                      {SEVERITY_LABEL[pb.severity]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 leading-snug">{pb.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 flex-1 leading-relaxed">{pb.objective}</p>
                  <div className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700/50 text-slate-200 px-3 py-2 text-xs font-bold">
                    Ouvrir le playbook
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vue playbook ouvert
  const sev = SEVERITY_STYLE[playbook.severity];
  const Icon = ICON_MAP[playbook.incident_type] ?? ShieldOff;

  return (
    <div className="space-y-5" data-testid="containment-panel">
      {/* En-tête playbook */}
      <div className={`rounded-2xl border ${sev.border} ${sev.bg} p-5`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="rounded-xl bg-slate-900/60 p-2.5 text-cyan-400 shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 text-cyan-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldOff className="h-3 w-3" />
                  Endiguement
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sev.color} ${sev.bg} ${sev.border}`}
                >
                  Sévérité {SEVERITY_LABEL[playbook.severity]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white leading-tight">{playbook.title}</h2>
              <p className="text-sm text-slate-300 mt-1.5 leading-snug">{playbook.objective}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
            data-testid="containment-reset-btn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Changer d'incident
          </button>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>
              Avancement : <span className="text-white font-semibold">{doneCount}</span> / {totalActions}{' '}
              actions
            </span>
            <span className="font-bold text-cyan-300">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Groupes d'actions */}
      <div className="space-y-4">
        {playbook.priority_actions.map((group, gIdx) => {
          const prio = PRIORITY_STYLE[group.priority] ?? PRIORITY_STYLE[5];
          const cat = CATEGORY_META[group.category];
          const groupDone = group.actions.filter((_, aIdx) => checked[`${gIdx}:${aIdx}`]).length;
          return (
            <div
              key={`${gIdx}-${group.title}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${prio.color}`}
                    >
                      {prio.label}
                    </span>
                    {cat && (
                      <span className="rounded-md bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-medium">
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white leading-snug">{group.title}</h3>
                </div>
                <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                  {groupDone} / {group.actions.length}
                </span>
              </div>

              {/* Avertissements */}
              {group.warning && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-100 leading-snug">{group.warning}</p>
                </div>
              )}
              {group.impact_warning && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-100 leading-snug">
                    <span className="font-semibold">Impact possible : </span>
                    {group.impact_warning}
                  </p>
                </div>
              )}

              {/* Liste d'actions cochables */}
              <ul className="space-y-1.5">
                {group.actions.map((action, aIdx) => {
                  const key = `${gIdx}:${aIdx}`;
                  const isDone = checked[key];
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        onClick={() => toggle(gIdx, aIdx, action, group.title)}
                        className={`w-full flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition-all ${
                          isDone
                            ? 'border-cyan-500/40 bg-cyan-500/10'
                            : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-500'
                        }`}
                        data-testid={`containment-action-${gIdx}-${aIdx}`}
                      >
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isDone ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-slate-900/60'
                          }`}
                        >
                          {isDone && <Check className="h-3.5 w-3.5 text-slate-900" />}
                        </div>
                        <span
                          className={`text-sm leading-snug break-words ${
                            isDone ? 'text-slate-300 line-through' : 'text-white'
                          }`}
                        >
                          {action}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Actions techniques additionnelles (mode Analyste) */}
      {mode === 'analyst' && playbook.analyst_actions && playbook.analyst_actions.length > 0 && (
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="rounded-lg bg-purple-500/20 text-purple-300 p-2 shrink-0 border border-purple-500/40">
              <Microscope className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1">
                Mode Analyste
              </div>
              <h3 className="text-base font-semibold text-white leading-snug">
                Actions techniques avancées
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Ces étapes complémentaires s'adressent aux analystes SOC/CSIRT pour l'investigation
                forensique, le threat hunting et la mitigation avancée.
              </p>
            </div>
          </div>

          <div className="space-y-3 ml-12">
            {playbook.analyst_actions.map((group, gIdx) => {
              const cat = CATEGORY_META[group.category];
              const groupDone = group.actions.filter(
                (_, aIdx) => checked[`analyst:${gIdx}:${aIdx}`]
              ).length;
              return (
                <div
                  key={`analyst-${gIdx}`}
                  className="rounded-xl border border-purple-500/20 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="min-w-0 flex-1">
                      {cat && (
                        <span className="inline-block rounded-md bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-medium mr-2 mb-1">
                          {cat.label}
                        </span>
                      )}
                      <h4 className="text-sm font-semibold text-white">{group.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {groupDone} / {group.actions.length}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {group.actions.map((action, aIdx) => {
                      const key = `analyst:${gIdx}:${aIdx}`;
                      const isDone = checked[key];
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => toggle(gIdx, aIdx, action, `[Analyste] ${group.title}`, true)}
                            className={`w-full flex items-start gap-2.5 rounded-lg border px-2.5 py-1.5 text-left transition-all ${
                              isDone
                                ? 'border-purple-500/40 bg-purple-500/10'
                                : 'border-slate-700/40 bg-slate-800/30 hover:border-purple-500/40'
                            }`}
                            data-testid={`analyst-action-${gIdx}-${aIdx}`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                isDone
                                  ? 'bg-purple-500 border-purple-500'
                                  : 'border-slate-600 bg-slate-900/60'
                              }`}
                            >
                              {isDone && <Check className="h-3 w-3 text-slate-900" />}
                            </div>
                            <span
                              className={`text-xs leading-snug break-words ${
                                isDone ? 'text-slate-300 line-through' : 'text-slate-200'
                              }`}
                            >
                              {action}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3 text-xs text-slate-400 leading-relaxed">
        💡 Astuce : chaque action cochée est consignée automatiquement dans la <strong>Main courante</strong>{' '}
        avec horodatage. Les cases ne sont pas persistées : pensez à exporter régulièrement votre main
        courante.
      </div>
    </div>
  );
}
