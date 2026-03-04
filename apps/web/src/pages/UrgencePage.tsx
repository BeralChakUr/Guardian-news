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
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

const scenarios = [
  {
    id: 'phishing',
    title: "J'ai cliqué sur un lien de phishing",
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
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
    title: 'Ransomware / Fichiers chiffrés',
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    actions: [
      'DÉCONNECTEZ immédiatement la machine du réseau',
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
    actions: [
      'Contactez IMMÉDIATEMENT votre banque',
      'Faites opposition sur votre carte',
      'Changez vos identifiants bancaires en ligne',
      'Conservez toutes les preuves',
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
    title: 'Fuite de données / Email exposé',
    icon: Cloud,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
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

export default function UrgencePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone.replace(/\s/g, ''));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Urgence</h1>
        <p className="text-cyber-secondary">Guide de réaction en cas d'incident cyber</p>
      </div>

      {/* Emergency Numbers */}
      <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-white">
          <Phone className="h-5 w-5 text-red-400" />
          Numéros d'urgence
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { number: '17', label: 'Police' },
            { number: '112', label: 'Urgences EU' },
            { number: '0 805 805 817', label: 'Info Escroqueries' },
          ].map(({ number, label }) => (
            <button
              key={number}
              onClick={() => copyPhone(number)}
              className="flex flex-col items-center rounded-xl bg-cyber-surface p-4 transition-colors hover:bg-cyber-elevated"
            >
              <span className="text-2xl font-bold text-white">{number}</span>
              <span className="text-sm text-cyber-secondary">{label}</span>
              {copiedPhone === number && (
                <span className="mt-1 flex items-center gap-1 text-xs text-green-400">
                  <Check className="h-3 w-3" /> Copié
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios */}
      <div className="space-y-4">
        {scenarios.map(scenario => {
          const Icon = scenario.icon;
          const isExpanded = expandedId === scenario.id;

          return (
            <div
              key={scenario.id}
              className="rounded-2xl border border-gray-800 bg-cyber-surface overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                className="flex w-full items-center justify-between p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${scenario.bgColor}`}>
                    <Icon className={`h-6 w-6 ${scenario.color}`} />
                  </div>
                  <span className="text-lg font-semibold text-white">{scenario.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-cyber-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-cyber-secondary" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-800 p-6">
                  {/* Actions */}
                  <h3 className="mb-4 font-semibold text-white">Actions immédiates</h3>
                  <ul className="mb-6 space-y-3">
                    {scenario.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyber-primary text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="text-cyber-secondary">{action}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Contacts */}
                  <h3 className="mb-4 font-semibold text-white">Contacts utiles</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scenario.contacts.map((contact, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-cyber-elevated p-4"
                      >
                        <span className="font-medium text-white">{contact.name}</span>
                        {contact.url && (
                          <a
                            href={contact.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-cyber-primary hover:underline"
                          >
                            Ouvrir <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {contact.phone && (
                          <button
                            onClick={() => copyPhone(contact.phone)}
                            className="flex items-center gap-1 text-sm text-cyber-primary"
                          >
                            {contact.phone}
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
