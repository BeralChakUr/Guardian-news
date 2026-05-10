import { useState } from 'react';
import { Activity, ClipboardCheck, Lock, ShieldOff, Building2, User, Microscope } from 'lucide-react';
import QualificationWizard from '../components/qualification/QualificationWizard';
import MainCourante from '../components/qualification/MainCourante';
import ContainmentPanel from '../components/containment/ContainmentPanel';
import ObligationsPanel from '../components/obligations/ObligationsPanel';
import { useCentreOpStore } from '../store/centreOpStore';

type Tab = 'qualification' | 'endiguement' | 'obligations' | 'analyste' | 'documents';

const TABS: { id: Tab; label: string; icon: typeof ClipboardCheck; locked?: boolean }[] = [
  { id: 'qualification', label: 'Qualification', icon: ClipboardCheck },
  { id: 'endiguement', label: 'Endiguement', icon: ShieldOff },
  { id: 'obligations', label: 'Obligations', icon: Building2 },
  { id: 'analyste', label: 'Analyste avancé', icon: Activity, locked: true },
  { id: 'documents', label: 'Documents', icon: Lock, locked: true },
];

export default function CentreOperationnelPage() {
  const [tab, setTab] = useState<Tab>('qualification');
  // Incident hérité de la Qualification (ID format Qualification : mail_compromise / ransomware / defacement / ddos / system_compromise)
  const [qualifiedIncidentId, setQualifiedIncidentId] = useState<string | null>(null);
  // Réponses du questionnaire Qualification (utilisées par Obligations)
  const [qualifiedAnswers, setQualifiedAnswers] = useState<Record<string, string | string[]>>({});
  // Mode global Victime / Analyste
  const mode = useCentreOpStore((s) => s.mode);
  const setMode = useCentreOpStore((s) => s.setMode);

  return (
    <div className="space-y-5" data-testid="centre-operationnel">
      {/* Page header */}
      <header className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 text-cyan-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Activity className="h-3 w-3" />
              Centre opérationnel
            </div>
            <h1 className="text-2xl font-bold text-white">Assistant de réponse incident cyber</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Qualifiez l'incident, suivez le playbook d'endiguement adapté, identifiez vos obligations
              légales et tracez chaque action dans la main courante.
            </p>
          </div>

          {/* Toggle Mode Victime / Analyste */}
          <div
            className="inline-flex items-stretch rounded-xl border border-slate-700 bg-slate-900/60 p-1 shrink-0"
            role="tablist"
            data-testid="mode-toggle"
          >
            <button
              onClick={() => setMode('victim')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === 'victim'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="mode-victim"
            >
              <User className="h-3.5 w-3.5" />
              Mode Victime
            </button>
            <button
              onClick={() => setMode('analyst')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === 'analyst'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="mode-analyst"
            >
              <Microscope className="h-3.5 w-3.5" />
              Mode Analyste
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 border-b border-slate-700 overflow-x-auto scrollbar-none" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                disabled={t.locked}
                onClick={() => !t.locked && setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  active
                    ? 'border-cyan-400 text-cyan-300'
                    : t.locked
                    ? 'border-transparent text-slate-600 cursor-not-allowed'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
                data-testid={`tab-${t.id}`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.locked && (
                  <span className="ml-1 rounded-full bg-slate-700 text-slate-400 px-1.5 py-0.5 text-[9px] uppercase tracking-wider">
                    À venir
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {tab === 'qualification' && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 items-start">
          <div className="min-w-0">
            <QualificationWizard
              onIncidentSelected={(id) => setQualifiedIncidentId(id)}
              onAnswersChange={(a) => setQualifiedAnswers(a)}
              onCompleted={() => setTab('endiguement')}
            />
          </div>
          <div className="min-w-0">
            <MainCourante />
          </div>
        </div>
      )}

      {tab === 'endiguement' && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 items-start">
          <div className="min-w-0">
            <ContainmentPanel inheritedIncidentType={qualifiedIncidentId} />
          </div>
          <div className="min-w-0">
            <MainCourante />
          </div>
        </div>
      )}

      {tab === 'obligations' && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 items-start">
          <div className="min-w-0">
            <ObligationsPanel incidentId={qualifiedIncidentId} answers={qualifiedAnswers} />
          </div>
          <div className="min-w-0">
            <MainCourante />
          </div>
        </div>
      )}
    </div>
  );
}
