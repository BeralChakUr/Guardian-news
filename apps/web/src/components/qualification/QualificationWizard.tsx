import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Skull,
  Globe,
  Activity,
  Server,
  Shield,
  AlertCircle,
  Clock,
  Copy,
  ClipboardList,
  Building2,
  HelpCircle,
} from 'lucide-react';
import {
  INCIDENTS,
  SEVERITY_META,
  evaluateRule,
  type IncidentType,
  type Question,
  type SeverityLevel,
} from '../../data/incidentQualificationData';
import { useMainCouranteStore } from '../../store/mainCouranteStore';

const ICON_MAP: Record<string, typeof Mail> = { Mail, Skull, Globe, Activity, Server };

type Answers = Record<string, string | string[]>;

function isAnswered(q: Question, answers: Answers) {
  const v = answers[q.id];
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== '';
}

function matches(rule: { questionId: string; equals: string | string[] }, answers: Answers): boolean {
  const a = answers[rule.questionId];
  const expected = Array.isArray(rule.equals) ? rule.equals : [rule.equals];
  if (Array.isArray(a)) return a.some((x) => expected.includes(String(x)));
  return expected.includes(String(a ?? ''));
}

function shouldShow(q: Question, answers: Answers): boolean {
  if (!q.condition) return true;
  return matches(q.condition, answers);
}

const SEVERITY_ORDER: SeverityLevel[] = ['anomalie', 'mineur', 'majeur', 'crise'];

function evaluate(incident: IncidentType, answers: Answers) {
  let level: SeverityLevel = incident.severityDefault;
  const reasons: string[] = [];
  let bestPriority = -1;

  for (const rule of incident.resultRules) {
    // Utilise le nouveau moteur allOf / anyOf / not (et legacy `when`)
    if (!evaluateRule(rule, answers)) continue;
    if (
      rule.priority > bestPriority ||
      (rule.priority === bestPriority && SEVERITY_ORDER.indexOf(rule.level) > SEVERITY_ORDER.indexOf(level))
    ) {
      bestPriority = rule.priority;
      level = rule.level;
    }
    rule.reasons.forEach((r) => {
      if (!reasons.includes(r)) reasons.push(r);
    });
  }

  const obligations = incident.obligations.filter(
    (o) => !o.trigger || matches(o.trigger, answers)
  );

  return { level, reasons, obligations };
}

interface QuestionFieldProps {
  q: Question;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}

function QuestionField({ q, value, onChange }: QuestionFieldProps) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
      <label className="block text-sm font-medium text-white mb-2">
        {q.label} {q.required && <span className="text-red-400">*</span>}
      </label>
      {q.helpText && (
        <p className="text-xs text-slate-400 mb-3 inline-flex items-start gap-1">
          <HelpCircle className="h-3 w-3 mt-0.5 shrink-0" />
          {q.helpText}
        </p>
      )}
      {q.type === 'yesno' && (
        <div className="flex gap-2">
          {[
            { v: 'true', label: 'Oui' },
            { v: 'false', label: 'Non' },
            { v: 'unknown', label: 'Je ne sais pas' },
          ].map((opt) => {
            const active = String(value ?? '') === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => onChange(opt.v)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cyan-500 border-cyan-500 text-slate-900'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      {q.type === 'choice' && q.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt) => {
            const active = String(value ?? '') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      {q.type === 'multichoice' && q.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            const active = arr.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = active ? arr.filter((x) => x !== opt.value) : [...arr, opt.value];
                  onChange(next);
                }}
                className={`text-left rounded-lg border px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                  active
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className={`h-4 w-4 rounded border ${active ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'} flex items-center justify-center shrink-0`}>
                  {active && <Check className="h-3 w-3 text-slate-900" />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      {q.type === 'text' && (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      )}
      {q.type === 'datetime' && (
        <input
          type="datetime-local"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
      )}
    </div>
  );
}

const STEPS = [
  { id: 'choice', label: 'Incident' },
  { id: 'situation', label: 'Situation' },
  { id: 'general', label: 'Général' },
  { id: 'specific', label: 'Spécifique' },
  { id: 'result', label: 'Résultat' },
];

interface QualificationWizardProps {
  onLogEvent?: (description: string, scope?: string) => void;
  /** Notifie le parent à chaque sélection d'incident (id type Qualification) */
  onIncidentSelected?: (incidentId: string) => void;
  /** Notifie le parent quand la qualification est terminée (utile pour basculer vers Endiguement) */
  onCompleted?: () => void;
  /** Notifie le parent à chaque modification des réponses (utile pour Obligations) */
  onAnswersChange?: (answers: Record<string, string | string[]>) => void;
}

export default function QualificationWizard({ onLogEvent, onIncidentSelected, onCompleted, onAnswersChange }: QualificationWizardProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [incident, setIncident] = useState<IncidentType | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const addEntry = useMainCouranteStore((s) => s.addEntry);

  const setAnswer = (id: string, v: string | string[]) => {
    setAnswers((prev) => {
      const next = { ...prev, [id]: v };
      onAnswersChange?.(next);
      return next;
    });
  };

  const result = useMemo(
    () => (incident ? evaluate(incident, answers) : null),
    [incident, answers]
  );

  const reset = () => {
    setIncident(null);
    setAnswers({});
    setStepIdx(0);
  };

  const logAuto = (description: string, scope?: string) => {
    addEntry({ author: 'Assistant Qualification', description, scope, auto: true });
    onLogEvent?.(description, scope);
  };

  const goNext = () => {
    if (stepIdx === 0 && incident) {
      logAuto(`Démarrage qualification : ${incident.shortTitle}`);
      onIncidentSelected?.(incident.id);
    }
    if (stepIdx === STEPS.length - 2 && incident && result) {
      logAuto(
        `Qualification terminée : ${SEVERITY_META[result.level].label}`,
        result.reasons.join(' · ')
      );
    }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));

  const visibleQuestions = (qs: Question[]) => qs.filter((q) => shouldShow(q, answers));

  const allAnswered = (qs: Question[]) =>
    visibleQuestions(qs)
      .filter((q) => q.required)
      .every((q) => isAnswered(q, answers));

  const canProceed = () => {
    if (stepIdx === 0) return incident !== null;
    if (stepIdx === 1 && incident) return allAnswered(incident.situationQuestions);
    if (stepIdx === 2 && incident) return allAnswered(incident.generalQuestions);
    if (stepIdx === 3 && incident) return allAnswered(incident.specificQuestions);
    return true;
  };

  const buildSummary = () => {
    if (!incident || !result) return '';
    const sev = SEVERITY_META[result.level];
    return [
      '🛡️  GUARDIAN NEWS — Synthèse de qualification',
      `Date         : ${new Date().toLocaleString('fr-FR')}`,
      `Incident     : ${incident.title}`,
      `Niveau       : ${sev.label}`,
      '',
      'Pourquoi ce niveau ?',
      ...result.reasons.map((r) => `  • ${r}`),
      '',
      'Actions immédiates :',
      ...incident.baseActions.map((a) => `  • ${a}`),
      '',
      'Obligations à vérifier :',
      ...result.obligations.map((o) => `  • [${o.authority}] ${o.label} — ${o.description}${o.deadlineHours ? ` (délai ${o.deadlineHours}h)` : ''}`),
      '',
      'Liens utiles :',
      ...incident.usefulLinks.map((l) => `  • ${l.label} : ${l.url}`),
    ].join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      logAuto('Synthèse copiée');
      alert('Synthèse copiée dans le presse-papier');
    } catch {
      alert('Impossible de copier');
    }
  };

  return (
    <div className="space-y-5" data-testid="qualification-wizard">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((s, i) => {
          const active = i === stepIdx;
          const done = i < stepIdx;
          return (
            <div key={s.id} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border ${
                  active
                    ? 'bg-cyan-500 border-cyan-500 text-slate-900'
                    : done
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'border-slate-600 text-slate-500'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-xs ${active ? 'text-white font-semibold' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="hidden sm:block w-8 h-px bg-slate-700" />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5">
        {/* STEP 0 — Choix incident */}
        {stepIdx === 0 && (
          <div data-testid="step-incident-choice">
            <h2 className="text-lg font-bold text-white mb-1">Quel type d'incident ?</h2>
            <p className="text-sm text-slate-400 mb-5">
              Choisissez l'incident qui correspond le mieux aux symptômes observés.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
              {INCIDENTS.map((i) => {
                const Icon = ICON_MAP[i.icon] ?? Shield;
                const selected = incident?.id === i.id;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setIncident(i)}
                    className={`text-left rounded-xl border p-4 transition-all flex flex-col h-full ${
                      selected
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                        : 'border-slate-700 bg-slate-800/30 hover:border-cyan-500/40'
                    }`}
                    data-testid={`incident-card-${i.id}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">{i.category}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2 leading-snug">{i.shortTitle}</h3>
                    <ul className="space-y-1 mb-4 text-xs text-slate-400 flex-1">
                      {i.symptoms.slice(0, 3).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-cyan-400 shrink-0">•</span>
                          <span className="break-words">{s}</span>
                        </li>
                      ))}
                    </ul>
                    <div
                      className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-cyan-500 text-slate-900'
                          : 'bg-slate-700/50 text-slate-200'
                      }`}
                    >
                      {selected ? 'Incident sélectionné' : 'Démarrer la qualification'}
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                );
              })}
            </div>
            {incident && (
              <div className="mt-5 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-orange-300 mb-1">Action immédiate</div>
                    <p className="text-sm text-orange-100 leading-snug">{incident.immediateAction}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 — Situation */}
        {stepIdx === 1 && incident && (
          <div data-testid="step-situation">
            <h2 className="text-lg font-bold text-white mb-1">Situation actuelle</h2>
            <p className="text-sm text-slate-400 mb-5">Quelques questions pour cadrer l'incident.</p>
            <div className="space-y-3">
              {visibleQuestions(incident.situationQuestions).map((q) => (
                <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — General */}
        {stepIdx === 2 && incident && (
          <div data-testid="step-general">
            <h2 className="text-lg font-bold text-white mb-1">Questions générales</h2>
            <p className="text-sm text-slate-400 mb-5">Pratiques de sécurité actuelles dans votre organisation.</p>
            <div className="space-y-3">
              {visibleQuestions(incident.generalQuestions).map((q) => (
                <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Specific */}
        {stepIdx === 3 && incident && (
          <div data-testid="step-specific">
            <h2 className="text-lg font-bold text-white mb-1">Questions spécifiques — {incident.shortTitle}</h2>
            <p className="text-sm text-slate-400 mb-5">Détails propres au type d'incident sélectionné.</p>
            <div className="space-y-3">
              {visibleQuestions(incident.specificQuestions).map((q) => (
                <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 — Result */}
        {stepIdx === 4 && incident && result && (
          <div data-testid="step-result" className="space-y-4">
            <h2 className="text-lg font-bold text-white">Qualification</h2>
            {/* Severity banner */}
            <div className={`rounded-xl border ${SEVERITY_META[result.level].border} ${SEVERITY_META[result.level].bg} p-4`}>
              <div className="flex items-start gap-3">
                <Shield className={`h-6 w-6 ${SEVERITY_META[result.level].color} shrink-0`} />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-slate-400">Niveau estimé</div>
                  <div className={`text-xl font-bold ${SEVERITY_META[result.level].color}`}>
                    {SEVERITY_META[result.level].label}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">{SEVERITY_META[result.level].description}</div>
                </div>
              </div>
            </div>

            {/* Why this level */}
            {result.reasons.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <h3 className="text-sm font-bold text-white mb-2 inline-flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-cyan-400" />
                  Pourquoi ce niveau ?
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 shrink-0">•</span>
                      <span className="break-words">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Immediate actions */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <h3 className="text-sm font-bold text-cyan-300 mb-2 inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Actions immédiates
              </h3>
              <ul className="space-y-1.5 text-sm text-slate-200">
                {incident.baseActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="break-words">{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Obligations */}
            {result.obligations.length > 0 && (
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
                <h3 className="text-sm font-bold text-orange-300 mb-2 inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Obligations à vérifier
                </h3>
                <div className="space-y-2">
                  {result.obligations.map((o) => (
                    <div key={o.id} className="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-orange-500/20 text-orange-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          {o.authority}
                        </span>
                        <span className="text-sm font-semibold text-white">{o.label}</span>
                        {o.deadlineHours && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-500/15 text-red-300 px-2 py-0.5 text-[10px] font-bold">
                            <Clock className="h-3 w-3" />
                            {o.deadlineHours}h
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 break-words">{o.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Useful links */}
            {incident.usefulLinks.length > 0 && (
              <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <h3 className="text-sm font-bold text-white mb-2">Liens utiles</h3>
                <ul className="space-y-1 text-sm">
                  {incident.usefulLinks.map((l) => (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline break-all"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  onCompleted?.();
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-900 transition-colors"
                data-testid="goto-containment-btn"
              >
                <ArrowRight className="h-4 w-4" />
                Passer à l'endiguement
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 hover:border-cyan-400 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors"
                data-testid="copy-summary-btn"
              >
                <Copy className="h-4 w-4" />
                Copier la synthèse
              </button>
              <button
                onClick={() => {
                  document
                    .querySelector('[data-testid="main-courante"]')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 transition-colors"
                data-testid="open-mc-btn"
              >
                <ClipboardList className="h-4 w-4" />
                Ouvrir la main courante
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-400 transition-colors"
              >
                Nouvelle qualification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {stepIdx < STEPS.length - 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            disabled={stepIdx === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-900 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            data-testid="wizard-next-btn"
          >
            {stepIdx === STEPS.length - 2 ? 'Voir le résultat' : 'Suivant'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
