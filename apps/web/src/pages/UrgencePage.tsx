import { useState } from 'react';
import {
  AlertTriangle,
  Mail,
  Lock,
  CreditCard,
  User,
  Cloud,
  Phone,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  X,
  Shield,
  HelpCircle,
} from 'lucide-react';
import RelatedArticlesBlock from '../components/RelatedArticlesBlock';

// Emergency scenarios with symptoms for quick recognition (V3)
const scenarios = [
  {
    id: 'phishing',
    title: "J'ai cliqué sur un lien suspect",
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    severity: 'eleve',
    // Symptoms for quick recognition (V3)
    symptoms: [
      "J'ai reçu un email inhabituel",
      "J'ai cliqué sur un lien dans l'email",
      "Une page m'a demandé mes identifiants",
      "Je suis inquiet d'avoir fait une erreur"
    ],
    quickAction: "Fermez la page immédiatement, ne saisissez rien",
    actions: [
      'Ne saisissez AUCUNE information si une page s\'est ouverte',
      'Fermez immédiatement la page/l\'onglet',
      'Changez vos mots de passe depuis un autre appareil',
      'Activez la 2FA sur vos comptes importants',
      'Surveillez vos comptes les prochains jours',
    ],
    contacts: [
      { name: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr' },
      { name: 'Signal Spam', url: 'https://www.signal-spam.fr' },
      { name: 'Pharos', url: 'https://www.internet-signalement.gouv.fr' },
    ],
  },
  {
    id: 'account',
    title: 'Mon compte a été piraté',
    icon: Lock,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    severity: 'critique',
    symptoms: [
      "Je ne peux plus me connecter à mon compte",
      "Mon mot de passe ne fonctionne plus",
      "J'ai reçu des alertes de connexion suspecte",
      "Des actions ont été faites sans mon accord"
    ],
    quickAction: "Utilisez 'Mot de passe oublié' immédiatement",
    actions: [
      'Tentez de récupérer l\'accès via "Mot de passe oublié"',
      'Si impossible, contactez le support du service',
      'Changez le mot de passe de votre email associé',
      'Vérifiez les autres comptes utilisant le même mot de passe',
      'Activez la 2FA partout où possible',
    ],
    contacts: [
      { name: 'Cybermalveillance.gouv.fr', url: 'https://www.cybermalveillance.gouv.fr' },
      { name: 'Plainte en ligne', url: 'https://www.pre-plainte-en-ligne.gouv.fr' },
    ],
  },
  {
    id: 'ransomware',
    title: 'Mes fichiers sont chiffrés / Ransomware',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    severity: 'critique',
    symptoms: [
      "Je ne peux plus ouvrir mes fichiers",
      "Un message de rançon s'affiche",
      "Mes fichiers ont une nouvelle extension",
      "Mon fond d'écran a été modifié"
    ],
    quickAction: "DÉCONNECTEZ du réseau immédiatement !",
    actions: [
      'DÉCONNECTEZ immédiatement la machine du réseau (câble + Wi-Fi)',
      'NE PAYEZ PAS la rançon',
      'Ne redémarrez pas l\'ordinateur',
      'Prenez des photos du message de rançon',
      'Contactez un expert en cybersécurité',
      'Déposez plainte',
    ],
    contacts: [
      { name: 'ANSSI', url: 'https://www.ssi.gouv.fr' },
      { name: 'No More Ransom', url: 'https://www.nomoreransom.org/fr' },
      { name: 'Police/Gendarmerie', phone: '17' },
    ],
  },
  {
    id: 'fraud',
    title: 'Fraude bancaire / Arnaque',
    icon: CreditCard,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    severity: 'critique',
    symptoms: [
      "J'ai vu des transactions que je n'ai pas faites",
      "J'ai communiqué mes infos bancaires par erreur",
      "J'ai reçu un SMS suspect de ma banque",
      "On m'a demandé de faire un virement urgent"
    ],
    quickAction: "Appelez votre banque MAINTENANT",
    actions: [
      'Contactez IMMÉDIATEMENT votre banque',
      'Faites opposition sur votre carte',
      'Changez vos identifiants bancaires en ligne',
      'Conservez toutes les preuves (SMS, emails, captures)',
      'Déposez plainte',
    ],
    contacts: [
      { name: 'Votre banque', description: 'Numéro au dos de votre carte' },
      { name: 'Perceval', url: 'https://www.service-public.fr/particuliers/vosdroits/R46526' },
      { name: 'Info Escroqueries', phone: '0 805 805 817' },
    ],
  },
  {
    id: 'identity',
    title: "Usurpation d'identité",
    icon: User,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    severity: 'critique',
    symptoms: [
      "Quelqu'un utilise mon nom sur internet",
      "J'ai reçu des factures pour des achats inconnus",
      "On a ouvert des comptes à mon nom",
      "Mes documents d'identité ont été volés"
    ],
    quickAction: "Déposez plainte et prévenez votre banque",
    actions: [
      'Déposez plainte immédiatement',
      'Prévenez votre banque',
      'Alertez la CNIL si données personnelles concernées',
      'Conservez toutes les preuves',
      'Faites opposition sur vos documents si volés',
    ],
    contacts: [
      { name: 'Police/Gendarmerie', phone: '17' },
      { name: 'CNIL', url: 'https://www.cnil.fr' },
      { name: 'ANTS', url: 'https://ants.gouv.fr' },
    ],
  },
  {
    id: 'dataleak',
    title: 'Mes données ont fuité',
    icon: Cloud,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    severity: 'eleve',
    symptoms: [
      "J'ai reçu un email d'alerte d'une entreprise",
      "haveibeenpwned.com montre mon email",
      "Je reçois des emails de phishing ciblés",
      "Des inconnus connaissent mes infos personnelles"
    ],
    quickAction: "Changez tous vos mots de passe concernés",
    actions: [
      'Vérifiez sur haveibeenpwned.com',
      'Changez immédiatement les mots de passe concernés',
      'Activez la 2FA sur tous vos comptes',
      'Surveillez vos comptes pour activité suspecte',
      'Méfiez-vous des tentatives de phishing ciblé',
    ],
    contacts: [
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com' },
      { name: 'CNIL', url: 'https://www.cnil.fr' },
    ],
  },
];

const severityConfig = {
  critique: { label: 'Critique', color: 'bg-red-500', textColor: 'text-red-400', emoji: '🟥' },
  eleve: { label: 'Élevé', color: 'bg-orange-500', textColor: 'text-orange-400', emoji: '🟧' },
  moyen: { label: 'Moyen', color: 'bg-yellow-500', textColor: 'text-yellow-400', emoji: '🟨' },
  faible: { label: 'Faible', color: 'bg-green-500', textColor: 'text-green-400', emoji: '🟩' },
};

type Scenario = typeof scenarios[0];

// Modal for detailed guide
function ScenarioDetailModal({ scenario, onClose, copiedPhone, onCopyPhone }: { 
  scenario: Scenario; 
  onClose: () => void;
  copiedPhone: string | null;
  onCopyPhone: (phone: string) => void;
}) {
  const Icon = scenario.icon;
  const severity = severityConfig[scenario.severity as keyof typeof severityConfig];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cyber-surface border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-700 bg-cyber-surface/95 backdrop-blur-md`}>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`rounded-xl p-3 ${scenario.bgColor} border ${scenario.borderColor} shrink-0`}>
              <Icon className={`h-8 w-8 ${scenario.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">{scenario.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${severity.textColor}`}>{severity.emoji} {severity.label}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Action Banner */}
          <div className={`p-4 rounded-xl ${scenario.bgColor} border ${scenario.borderColor}`}>
            <p className="text-lg font-semibold text-white mb-1">Action immédiate</p>
            <p className={`text-lg ${scenario.color}`}>{scenario.quickAction}</p>
          </div>

          {/* Step by step actions */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Étapes à suivre
            </h3>
            <ul className="space-y-3">
              {scenario.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyber-primary text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-gray-300 pt-0.5">{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contacts utiles</h3>
            <div className="space-y-3">
              {scenario.contacts.map((contact, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-cyber-elevated p-4 border border-gray-700"
                >
                  <div>
                    <span className="font-medium text-white">{contact.name}</span>
                    {contact.description && (
                      <p className="text-sm text-gray-400">{contact.description}</p>
                    )}
                  </div>
                  {contact.url && (
                    <a
                      href={contact.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-primary/20 text-cyber-primary hover:bg-cyber-primary/30 transition-colors"
                    >
                      Ouvrir <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {contact.phone && (
                    <button
                      onClick={() => onCopyPhone(contact.phone!)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      {contact.phone}
                      {copiedPhone === contact.phone ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-gray-700 bg-cyber-surface">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-cyber-primary text-white font-semibold hover:bg-cyber-primary/80 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UrgencePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone.replace(/\s/g, ''));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h1 className="text-2xl font-bold text-white">Urgence</h1>
        </div>
        <p className="text-cyber-secondary">
          Identifiez votre situation et obtenez un guide d'action immédiat
        </p>
      </div>

      {/* Emergency Numbers */}
      <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <Phone className="h-5 w-5 text-red-400" />
          Numéros d'urgence
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { number: '17', label: 'Police', color: 'bg-blue-500/20 border-blue-500/30' },
            { number: '112', label: 'Urgences EU', color: 'bg-red-500/20 border-red-500/30' },
            { number: '0 805 805 817', label: 'Info Escroqueries', color: 'bg-orange-500/20 border-orange-500/30' },
          ].map(({ number, label, color }) => (
            <button
              key={number}
              onClick={() => copyPhone(number)}
              className={`flex flex-col items-center rounded-xl ${color} border p-4 transition-all hover:scale-105`}
              data-testid={`emergency-${number.replace(/\s/g, '')}`}
            >
              <span className="text-2xl font-bold text-white">{number}</span>
              <span className="text-sm text-gray-300">{label}</span>
              {copiedPhone === number && (
                <span className="mt-1 flex items-center gap-1 text-xs text-green-400">
                  <Check className="h-3 w-3" /> Copié
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick instruction banner */}
      <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-cyan-100 font-medium">Comment utiliser cette page ?</p>
            <p className="text-sm text-cyan-200/70 mt-1">
              Lisez les <strong>symptômes</strong> de chaque carte. Si vous vous reconnaissez, 
              cliquez sur <strong>"C'est mon cas"</strong> pour obtenir les étapes à suivre.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Cards - V3 UX with symptoms */}
      <div className="grid gap-4 md:grid-cols-2">
        {scenarios.map(scenario => {
          const Icon = scenario.icon;
          const severity = severityConfig[scenario.severity as keyof typeof severityConfig];

          return (
            <div
              key={scenario.id}
              className={`rounded-2xl border bg-cyber-surface overflow-hidden transition-all hover:border-opacity-100 ${scenario.borderColor}`}
              data-testid={`scenario-card-${scenario.id}`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-3 ${scenario.bgColor}`}>
                      <Icon className={`h-6 w-6 ${scenario.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{scenario.title}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${scenario.bgColor} ${severity.textColor}`}>
                    {severity.emoji} {severity.label}
                  </div>
                </div>

                {/* Symptoms - V3 UX */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Reconnaissez-vous ces symptômes ?
                  </h4>
                  <ul className="space-y-1.5">
                    {scenario.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Action */}
                <div className={`p-3 rounded-lg ${scenario.bgColor} border ${scenario.borderColor} mb-4`}>
                  <p className="text-sm">
                    <span className="font-medium text-white">Action immédiate : </span>
                    <span className="text-gray-300">{scenario.quickAction}</span>
                  </p>
                </div>

                {/* "C'est mon cas" button - V3 UX */}
                <button
                  onClick={() => setSelectedScenario(scenario)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${scenario.bgColor} ${scenario.color} hover:opacity-80 border ${scenario.borderColor}`}
                  data-testid={`cta-${scenario.id}`}
                >
                  C'est mon cas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* V4 - Critical alerts block */}
      <div className="mt-8">
        <RelatedArticlesBlock
          title="Alertes critiques en cours"
          description="Incidents de sévérité Critique détectés récemment"
          filters={{ severity: 'critique' }}
          limit={6}
          testId="urgence-critical-alerts"
        />
      </div>

      {/* Detail Modal */}
      {selectedScenario && (
        <ScenarioDetailModal
          scenario={selectedScenario}
          onClose={() => setSelectedScenario(null)}
          copiedPhone={copiedPhone}
          onCopyPhone={copyPhone}
        />
      )}
    </div>
  );
}
