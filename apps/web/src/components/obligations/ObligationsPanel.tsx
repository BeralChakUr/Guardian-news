import { useMemo, useState } from 'react';
import {
  Building2,
  Clock,
  ExternalLink,
  Copy,
  ShieldAlert,
  CheckCircle2,
  Inbox,
  Scale,
  ShieldCheck,
  Circle,
  Loader2,
  Check,
  Ban,
} from 'lucide-react';
import {
  OBLIGATIONS,
  computeActiveConditions,
  evaluateSeverityFromAnswers,
  PRIORITY_STYLE,
  CATEGORY_LABEL,
  type Obligation,
} from '../../data/obligationsData';
import { INCIDENTS } from '../../data/incidentQualificationData';
import { useMainCouranteStore } from '../../store/mainCouranteStore';

type ObligationStatus = 'pending' | 'in_progress' | 'done' | 'na';

const STATUS_META: Record<ObligationStatus, { label: string; icon: typeof Circle; color: string; bg: string; border: string }> = {
  pending: { label: 'À vérifier', icon: Circle, color: 'text-slate-300', bg: 'bg-slate-500/15', border: 'border-slate-500/40' },
  in_progress: { label: 'En cours', icon: Loader2, color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-500/40' },
  done: { label: 'Fait', icon: Check, color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  na: { label: 'Non applicable', icon: Ban, color: 'text-slate-500', bg: 'bg-slate-700/30', border: 'border-slate-700/40' },
};

const STATUS_CYCLE: ObligationStatus[] = ['pending', 'in_progress', 'done', 'na'];

const CATEGORY_ICON: Record<string, typeof Building2> = {
  legal: Scale,
  regulatory: ShieldCheck,
  insurance: ShieldAlert,
};

interface Props {
  /** Incident ID (format Qualification : mail_compromise / ransomware / defacement / ddos / system_compromise) */
  incidentId: string | null;
  /** Réponses du questionnaire Qualification */
  answers: Record<string, string | string[]>;
}

export default function ObligationsPanel({ incidentId, answers }: Props) {
  const addEntry = useMainCouranteStore((s) => s.addEntry);
  const [statuses, setStatuses] = useState<Record<string, ObligationStatus>>({});

  const cycleStatus = (o: Obligation) => {
    const current = statuses[o.id] ?? 'pending';
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setStatuses({ ...statuses, [o.id]: next });
    addEntry({
      author: 'Obligations',
      type: 'obligation',
      description: `Statut "${o.title}" → ${STATUS_META[next].label}`,
      scope: CATEGORY_LABEL[o.category],
      auto: true,
    });
  };

  const incident = useMemo(
    () => (incidentId ? INCIDENTS.find((i) => i.id === incidentId) : null),
    [incidentId]
  );

  const severity = useMemo(() => {
    if (!incident) return null;
    return evaluateSeverityFromAnswers(incident, answers);
  }, [incident, answers]);

  const activeConditions = useMemo(
    () => computeActiveConditions({ incidentId, severity, answers }),
    [incidentId, severity, answers]
  );

  // Filtre les obligations dont au moins UNE trigger_condition matche
  const triggered = useMemo(() => {
    return OBLIGATIONS.filter((o) =>
      o.trigger_conditions.some((c) => activeConditions.has(c))
    );
  }, [activeConditions]);

  const notTriggered = useMemo(() => {
    return OBLIGATIONS.filter(
      (o) => !o.trigger_conditions.some((c) => activeConditions.has(c))
    );
  }, [activeConditions]);

  const handleCopyToMC = (o: Obligation) => {
    const txt = [
      `📌 ${o.title} [${CATEGORY_LABEL[o.category]}]`,
      o.deadlineHours ? `Délai légal : ${o.deadlineHours}h` : '',
      '',
      o.description,
      '',
      'Actions :',
      ...o.actions.map((a) => `  • ${a}`),
      o.legal_reference ? `\nRéférence : ${o.legal_reference}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    addEntry({
      author: 'Obligations',
      description: `Obligation ajoutée à suivre : ${o.title}`,
      scope: o.deadlineHours ? `Délai ${o.deadlineHours}h` : CATEGORY_LABEL[o.category],
      auto: true,
    });

    navigator.clipboard.writeText(txt).then(
      () => alert('Obligation copiée dans le presse-papier'),
      () => alert('Impossible de copier')
    );
  };

  // Pas d'incident sélectionné → écran d'invitation
  if (!incidentId) {
    return (
      <div className="space-y-5" data-testid="obligations-panel">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-800/60 text-slate-500 mb-3">
            <Inbox className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Aucune qualification active</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Pour voir les obligations légales et réglementaires applicables, commencez par qualifier
            l'incident dans l'onglet <span className="text-cyan-300 font-medium">Qualification</span>.
            Les obligations affichées dépendent des réponses du questionnaire (type d'incident, données
            personnelles concernées, type d'organisation, assurance cyber, etc.).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="obligations-panel">
      {/* Header */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {triggered.length} obligation{triggered.length > 1 ? 's' : ''} active{triggered.length > 1 ? 's' : ''}
              </span>
              {incident && (
                <span className="rounded-full bg-slate-800 text-slate-300 px-2 py-0.5 text-[10px] font-medium">
                  {incident.shortTitle}
                </span>
              )}
              {severity && (
                <span className="rounded-full bg-orange-500/15 text-orange-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Niveau {severity}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white">Obligations légales et réglementaires</h2>
            <p className="text-sm text-slate-300 mt-1 leading-snug">
              Obligations déclenchées par votre situation. Cette analyse est indicative et ne se substitue
              pas à un avis juridique.
            </p>
          </div>
        </div>
      </div>

      {/* Obligations actives */}
      {triggered.length > 0 && (
        <div className="space-y-3">
          {triggered.map((o) => {
            const sty = PRIORITY_STYLE[o.ui_priority];
            const Icon = CATEGORY_ICON[o.category] ?? Building2;
            const status = statuses[o.id] ?? 'pending';
            const stMeta = STATUS_META[status];
            const StIcon = stMeta.icon;
            // Conditions matchées pour expliciter le pourquoi
            const matchedConditions = o.trigger_conditions.filter((c) =>
              activeConditions.has(c)
            );
            return (
              <div
                key={o.id}
                className={`rounded-2xl border ${sty.border} ${sty.bg} p-4 backdrop-blur-sm`}
                data-testid={`obligation-${o.id}`}
              >
                <div className="flex items-start gap-3 mb-3 flex-wrap">
                  <div className={`rounded-lg ${sty.bg} ${sty.color} p-2 shrink-0 border ${sty.border}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`rounded-md ${sty.bg} ${sty.color} border ${sty.border} px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider`}
                      >
                        {sty.label}
                      </span>
                      <span className="rounded-md bg-slate-800 text-slate-300 px-1.5 py-0.5 text-[10px] font-medium">
                        {CATEGORY_LABEL[o.category]}
                      </span>
                      {o.deadlineHours && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold">
                          <Clock className="h-3 w-3" />
                          Délai {o.deadlineHours}h
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">{o.title}</h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">{o.description}</p>
                  </div>
                  {/* Badge statut cliquable */}
                  <button
                    onClick={() => cycleStatus(o)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border ${stMeta.bg} ${stMeta.color} ${stMeta.border} px-2.5 py-1.5 text-xs font-bold hover:opacity-80 transition-opacity shrink-0`}
                    title="Cliquer pour changer le statut"
                    data-testid={`obligation-status-${o.id}`}
                  >
                    <StIcon className={`h-3.5 w-3.5 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
                    {stMeta.label}
                  </button>
                </div>

                {/* Raison du déclenchement */}
                {matchedConditions.length > 0 && (
                  <div className="ml-12 mb-3 rounded-lg bg-slate-900/40 border border-slate-700/40 px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Pourquoi cette obligation est déclenchée
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {matchedConditions.map((c) => (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 text-cyan-200 border border-cyan-500/30 px-1.5 py-0.5 text-[10px] font-mono"
                        >
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="ml-12">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Actions à entreprendre
                  </div>
                  <ul className="space-y-1 text-sm text-slate-200">
                    {o.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className={`h-3.5 w-3.5 ${sty.color} mt-0.5 shrink-0`} />
                        <span className="break-words">{a}</span>
                      </li>
                    ))}
                  </ul>

                  {o.legal_reference && (
                    <div className="mt-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Référence : </span>
                      {o.legal_reference}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleCopyToMC(o)}
                      className={`inline-flex items-center gap-1.5 rounded-lg ${sty.bg} ${sty.color} border ${sty.border} hover:bg-opacity-30 px-3 py-1.5 text-xs font-bold transition-colors`}
                      data-testid={`obligation-copy-${o.id}`}
                    >
                      <Copy className="h-3 w-3" />
                      Copier dans la main courante
                    </button>
                    {o.external_link && (
                      <a
                        href={o.external_link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 hover:border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {o.external_link.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Obligations non déclenchées */}
      {notTriggered.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-2 inline-flex items-center gap-2">
            <Inbox className="h-4 w-4 text-slate-500" />
            Obligations non déclenchées par cette situation
          </h3>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Ces obligations ne s'appliquent pas selon les réponses fournies. Vérifiez vos
            réponses si vous pensez qu'elles devraient être déclenchées.
          </p>
          <ul className="space-y-1.5">
            {notTriggered.map((o) => (
              <li key={o.id} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="text-slate-700 mt-0.5">○</span>
                <div className="min-w-0">
                  <span className="text-slate-400">{o.title}</span>
                  <span className="text-xs text-slate-600 ml-2">— {CATEGORY_LABEL[o.category]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Avertissement légal */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3 text-xs text-slate-400 leading-relaxed">
        ⚖️ <strong>Disclaimer</strong> — Cette analyse est indicative et automatisée. Elle ne se substitue
        pas à l'avis d'un juriste, d'un DPO ou d'un avocat spécialisé. Chaque incident a ses spécificités :
        consultez systématiquement vos référents internes (juridique, compliance, RSSI).
      </div>
    </div>
  );
}
