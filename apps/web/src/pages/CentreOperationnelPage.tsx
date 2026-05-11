import { useState } from 'react';
import {
  Activity,
  ClipboardCheck,
  ShieldOff,
  Building2,
  User,
  Microscope,
  AlertTriangle,
  ClipboardList,
  Download,
  LifeBuoy,
} from 'lucide-react';
import QualificationWizard from '../components/qualification/QualificationWizard';
import ContainmentPanel from '../components/containment/ContainmentPanel';
import ObligationsPanel from '../components/obligations/ObligationsPanel';
import ChronologiePanel from '../components/chronologie/ChronologiePanel';
import ExportPanel from '../components/chronologie/ExportPanel';
import AssistanceTab from '../components/assistance/AssistanceTab';
import { useCentreOpStore } from '../store/centreOpStore';

type Section = 'incidents' | 'assistance';
type IncidentTab = 'qualification' | 'endiguement' | 'chronologie' | 'obligations' | 'export';

const SECTIONS: { id: Section; label: string; icon: typeof AlertTriangle; emoji: string }[] = [
  { id: 'incidents', label: 'Incidents', icon: AlertTriangle, emoji: '⚠️' },
  { id: 'assistance', label: 'Assistance', icon: LifeBuoy, emoji: '🛡' },
];

const INCIDENT_TABS: { id: IncidentTab; label: string; icon: typeof ClipboardCheck }[] = [
  { id: 'qualification', label: 'Qualification', icon: ClipboardCheck },
  { id: 'endiguement', label: 'Endiguement', icon: ShieldOff },
  { id: 'chronologie', label: 'Chronologie', icon: ClipboardList },
  { id: 'obligations', label: 'Obligations', icon: Building2 },
  { id: 'export', label: 'Export', icon: Download },
];

export default function CentreOperationnelPage() {
  const [section, setSection] = useState<Section>('incidents');
  const [tab, setTab] = useState<IncidentTab>('qualification');
  // Incident hérité de la Qualification (mail_compromise / ransomware / defacement / ddos / system_compromise)
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
              Centre Opérationnel
            </div>
            <h1 className="text-2xl font-bold text-white">Assistant de réponse incident cyber</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Qualifiez l'incident, suivez le playbook d'endiguement, tracez chaque action dans la
              chronologie et identifiez vos obligations légales.
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
                mode === 'victim' ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
              data-testid="mode-victim"
            >
              <User className="h-3.5 w-3.5" />
              Mode Victime
            </button>
            <button
              onClick={() => setMode('analyst')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === 'analyst' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
              data-testid="mode-analyst"
            >
              <Microscope className="h-3.5 w-3.5" />
              Mode Analyste
            </button>
          </div>
        </div>

        {/* Sections principales (Incidents / Assistance) */}
        <div className="mt-5 flex gap-1.5 flex-wrap">
          {SECTIONS.map((s) => {
            const SIcon = s.icon;
            const active = s.id === section;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold transition-colors ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-900/40 text-slate-400 border-slate-700 hover:text-white'
                }`}
                data-testid={`section-${s.id}`}
              >
                <span aria-hidden="true">{s.emoji}</span>
                <SIcon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Sous-onglets (uniquement pour Incidents) */}
        {section === 'incidents' && (
          <div className="mt-3 flex gap-1 border-b border-slate-700 overflow-x-auto scrollbar-none" role="tablist">
            {INCIDENT_TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                    active
                      ? 'border-cyan-400 text-cyan-300'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                  data-testid={`tab-${t.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Section : Incidents */}
      {section === 'incidents' && tab === 'qualification' && (
        <QualificationWizard
          onIncidentSelected={(id) => setQualifiedIncidentId(id)}
          onAnswersChange={(a) => setQualifiedAnswers(a)}
          onCompleted={() => setTab('endiguement')}
        />
      )}

      {section === 'incidents' && tab === 'endiguement' && (
        <ContainmentPanel inheritedIncidentType={qualifiedIncidentId} />
      )}

      {section === 'incidents' && tab === 'chronologie' && <ChronologiePanel />}

      {section === 'incidents' && tab === 'obligations' && (
        <ObligationsPanel incidentId={qualifiedIncidentId} answers={qualifiedAnswers} />
      )}

      {section === 'incidents' && tab === 'export' && <ExportPanel />}

      {/* Section : Assistance */}
      {section === 'assistance' && <AssistanceTab />}
    </div>
  );
}
