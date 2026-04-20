import { useState } from 'react';
import {
  Mail,
  Lock,
  Bug,
  Database,
  Shield,
  Users,
  Wifi,
  Server,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Eye,
  Target,
  HelpCircle,
  X,
} from 'lucide-react';

// Attack types with symptoms for quick recognition
const attacks = [
  {
    id: 'phishing',
    name: 'Phishing',
    category: 'Ingénierie sociale',
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    severity: 'eleve',
    // Symptoms for quick recognition (V3)
    symptoms: [
      "Email urgent ou inhabituel",
      "Lien suspect dans le message",
      "Demande de mot de passe",
      "Fautes d'orthographe"
    ],
    quickAction: "Ne cliquez pas, signalez immédiatement",
    definition: "Le phishing est une technique d'hameçonnage où l'attaquant se fait passer pour une entité de confiance (banque, service public, entreprise) pour voler des informations sensibles.",
    example: "Vous recevez un email de 'votre banque' vous demandant de mettre à jour vos informations. Le lien mène vers un faux site qui capture vos identifiants.",
    signs: [
      "URL suspecte ou mal orthographiée",
      "Sentiment d'urgence (compte bloqué, action requise)",
      "Fautes d'orthographe dans le message",
      "Adresse d'expéditeur inhabituelle",
      "Demande d'informations sensibles par email"
    ],
    impacts: [
      "Vol d'identifiants bancaires",
      "Usurpation d'identité",
      "Perte financière directe",
      "Compromission de comptes professionnels"
    ],
    prevention: [
      "Vérifier l'URL avant de cliquer",
      "Ne jamais communiquer ses identifiants par email",
      "Activer l'authentification à deux facteurs",
      "Utiliser un gestionnaire de mots de passe",
      "En cas de doute, contacter directement l'organisme"
    ]
  },
  {
    id: 'ransomware',
    name: 'Ransomware',
    category: 'Malware',
    icon: Lock,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    severity: 'critique',
    symptoms: [
      "Fichiers inaccessibles",
      "Message de rançon à l'écran",
      "Extensions de fichiers modifiées",
      "Système très lent"
    ],
    quickAction: "Déconnectez du réseau, ne payez PAS",
    definition: "Un ransomware (rançongiciel) est un logiciel malveillant qui chiffre les fichiers de la victime et exige une rançon pour les déchiffrer.",
    example: "WannaCry, NotPetya, LockBit - ces ransomwares ont paralysé des hôpitaux, entreprises et administrations en chiffrant leurs données.",
    signs: [
      "Fichiers inaccessibles avec extension modifiée",
      "Message de rançon sur l'écran",
      "Fond d'écran modifié avec instructions",
      "Ralentissement important du système",
      "Activité disque intense inexpliquée"
    ],
    impacts: [
      "Perte totale d'accès aux données",
      "Interruption complète de l'activité",
      "Coûts de récupération élevés",
      "Atteinte à la réputation",
      "Risque de fuite de données (double extorsion)"
    ],
    prevention: [
      "Sauvegardes régulières hors ligne (3-2-1)",
      "Maintenir les systèmes à jour",
      "Former les employés au phishing",
      "Segmenter le réseau",
      "Utiliser un EDR/antivirus professionnel"
    ]
  },
  {
    id: 'malware',
    name: 'Malware',
    category: 'Logiciel malveillant',
    icon: Bug,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    severity: 'eleve',
    symptoms: [
      "Ordinateur très lent",
      "Pop-ups intempestifs",
      "Programmes inconnus installés",
      "Antivirus désactivé"
    ],
    quickAction: "Lancez un scan antivirus complet",
    definition: "Malware est un terme générique désignant tout logiciel conçu pour endommager, perturber ou prendre le contrôle d'un système : virus, trojans, spywares, etc.",
    example: "Un logiciel gratuit téléchargé sur un site non officiel contient un trojan qui donne un accès distant à l'attaquant.",
    signs: [
      "Ralentissement inexpliqué de l'ordinateur",
      "Fenêtres pop-up intempestives",
      "Programmes inconnus qui se lancent",
      "Connexions réseau suspectes",
      "Désactivation de l'antivirus"
    ],
    impacts: [
      "Vol de données personnelles",
      "Utilisation de la machine pour des attaques",
      "Espionnage (keylogger, capture d'écran)",
      "Dégradation des performances"
    ],
    prevention: [
      "Télécharger uniquement depuis sources officielles",
      "Garder l'antivirus à jour et actif",
      "Ne pas désactiver les protections Windows/macOS",
      "Scanner les clés USB avant utilisation",
      "Mettre à jour régulièrement tous les logiciels"
    ]
  },
  {
    id: 'data_breach',
    name: 'Fuite de données',
    category: 'Violation de données',
    icon: Database,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    severity: 'critique',
    symptoms: [
      "Email de notification d'une entreprise",
      "Connexions suspectes sur vos comptes",
      "Emails de phishing ciblés",
      "Transactions bancaires inconnues"
    ],
    quickAction: "Changez vos mots de passe immédiatement",
    definition: "Une fuite de données survient quand des informations confidentielles sont exposées, volées ou publiées sans autorisation suite à une intrusion ou une erreur.",
    example: "Les données de millions d'utilisateurs d'un site e-commerce sont publiées sur le dark web après une intrusion dans leurs serveurs.",
    signs: [
      "Notification de l'entreprise concernée",
      "Email présent sur haveibeenpwned.com",
      "Connexions suspectes sur vos comptes",
      "Emails de phishing ciblés",
      "Transactions bancaires inconnues"
    ],
    impacts: [
      "Usurpation d'identité",
      "Fraude financière",
      "Chantage (si données sensibles)",
      "Perte de confiance des clients",
      "Sanctions RGPD pour les entreprises"
    ],
    prevention: [
      "Utiliser un mot de passe unique par service",
      "Activer la 2FA partout",
      "Surveiller ses comptes régulièrement",
      "Limiter les données partagées en ligne",
      "Vérifier régulièrement haveibeenpwned.com"
    ]
  },
  {
    id: 'social_engineering',
    name: 'Ingénierie sociale',
    category: 'Manipulation',
    icon: Users,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    severity: 'moyen',
    symptoms: [
      "Appel téléphonique suspect",
      "Demande urgente d'informations",
      "Flatterie ou intimidation",
      "Offre trop belle pour être vraie"
    ],
    quickAction: "Raccrochez et vérifiez l'identité",
    definition: "L'ingénierie sociale exploite la psychologie humaine plutôt que les failles techniques pour manipuler les victimes et obtenir des informations ou des accès.",
    example: "Un 'technicien informatique' appelle en prétendant une urgence et demande vos identifiants pour 'réparer' un problème inexistant.",
    signs: [
      "Sentiment d'urgence artificiel",
      "Appel à l'autorité (police, direction)",
      "Demande d'informations inhabituelles",
      "Flatterie excessive ou intimidation",
      "Offres trop belles pour être vraies"
    ],
    impacts: [
      "Divulgation d'informations confidentielles",
      "Accès non autorisé aux systèmes",
      "Fraude financière",
      "Installation de malwares"
    ],
    prevention: [
      "Vérifier l'identité de l'interlocuteur",
      "Ne jamais agir dans l'urgence",
      "Suivre les procédures établies",
      "En cas de doute, raccrocher et rappeler",
      "Former régulièrement les équipes"
    ]
  },
  {
    id: 'mitm',
    name: 'Man-in-the-Middle',
    category: 'Interception',
    icon: Wifi,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    severity: 'eleve',
    symptoms: [
      "Wi-Fi public non sécurisé",
      "Certificat SSL invalide",
      "Avertissement du navigateur",
      "Connexion HTTPS devenue HTTP"
    ],
    quickAction: "Déconnectez-vous du Wi-Fi, utilisez 4G/5G",
    definition: "Une attaque MITM intercepte les communications entre deux parties pour espionner, modifier ou injecter des données dans les échanges.",
    example: "Sur un Wi-Fi public non sécurisé, un attaquant intercepte votre connexion bancaire et capture vos identifiants.",
    signs: [
      "Certificat SSL invalide ou suspect",
      "Connexion HTTPS qui devient HTTP",
      "Avertissements du navigateur",
      "Lenteur inhabituelle de la connexion",
      "Redirections vers des sites suspects"
    ],
    impacts: [
      "Vol d'identifiants de connexion",
      "Interception de données sensibles",
      "Modification de transactions",
      "Injection de malwares"
    ],
    prevention: [
      "Éviter les Wi-Fi publics pour les opérations sensibles",
      "Utiliser un VPN fiable",
      "Vérifier le cadenas HTTPS",
      "Ne pas ignorer les alertes de certificat",
      "Utiliser des connexions mobiles (4G/5G)"
    ]
  },
  {
    id: 'ddos',
    name: 'Attaque DDoS',
    category: 'Déni de service',
    icon: Server,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    severity: 'moyen',
    symptoms: [
      "Site web inaccessible",
      "Erreurs 503 répétées",
      "Connexion très lente",
      "Services en panne"
    ],
    quickAction: "Contactez votre hébergeur/FAI",
    definition: "Une attaque par déni de service distribué (DDoS) submerge un serveur ou réseau de requêtes pour le rendre inaccessible aux utilisateurs légitimes.",
    example: "Des milliers de machines infectées (botnet) envoient simultanément des requêtes vers un site web qui devient inaccessible.",
    signs: [
      "Site web inaccessible ou très lent",
      "Erreurs 503 (Service Unavailable)",
      "Trafic réseau anormalement élevé",
      "Consommation CPU/mémoire maximale",
      "Connexions depuis de nombreuses IPs"
    ],
    impacts: [
      "Interruption de service",
      "Perte de chiffre d'affaires",
      "Atteinte à la réputation",
      "Coûts d'infrastructure accrus"
    ],
    prevention: [
      "Utiliser un service anti-DDoS (Cloudflare, AWS Shield)",
      "Dimensionner l'infrastructure",
      "Mettre en place un CDN",
      "Configurer le rate limiting",
      "Avoir un plan de continuité d'activité"
    ]
  },
  {
    id: 'credential_stuffing',
    name: 'Credential Stuffing',
    category: 'Authentification',
    icon: Target,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    severity: 'eleve',
    symptoms: [
      "Connexions inhabituelles notifiées",
      "Tentatives de connexion bloquées",
      "Emails de réinitialisation non demandés",
      "Activité suspecte sur vos comptes"
    ],
    quickAction: "Activez la 2FA, changez vos mots de passe",
    definition: "Le credential stuffing utilise des listes d'identifiants volés lors de fuites de données pour tenter de se connecter automatiquement à d'autres services.",
    example: "Un attaquant utilise les millions de couples email/mot de passe d'une fuite pour tester automatiquement des connexions sur Netflix, Amazon, etc.",
    signs: [
      "Notifications de connexion inhabituelles",
      "Tentatives de connexion bloquées",
      "Activité sur vos comptes que vous ne reconnaissez pas",
      "Emails de réinitialisation non demandés"
    ],
    impacts: [
      "Compromission de multiples comptes",
      "Vol de données personnelles",
      "Achats frauduleux",
      "Usurpation d'identité"
    ],
    prevention: [
      "Mot de passe unique pour chaque service",
      "Utiliser un gestionnaire de mots de passe",
      "Activer la 2FA sur tous les comptes",
      "Vérifier régulièrement haveibeenpwned.com",
      "Changer les mots de passe après une fuite"
    ]
  },
];

const severityConfig = {
  critique: { label: 'Critique', color: 'bg-red-500', textColor: 'text-red-400', emoji: '🟥' },
  eleve: { label: 'Élevé', color: 'bg-orange-500', textColor: 'text-orange-400', emoji: '🟧' },
  moyen: { label: 'Moyen', color: 'bg-yellow-500', textColor: 'text-yellow-400', emoji: '🟨' },
  faible: { label: 'Faible', color: 'bg-green-500', textColor: 'text-green-400', emoji: '🟩' },
};

type Attack = typeof attacks[0];

// Modal for detailed guide
function AttackDetailModal({ attack, onClose }: { attack: Attack; onClose: () => void }) {
  const Icon = attack.icon;
  const severity = severityConfig[attack.severity as keyof typeof severityConfig];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-cyber-surface border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-700 bg-cyber-surface/95 backdrop-blur-md`}>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={`rounded-xl p-3 ${attack.bgColor} border ${attack.borderColor} shrink-0`}>
              <Icon className={`h-8 w-8 ${attack.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">{attack.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${severity.textColor}`}>{severity.emoji} {severity.label}</span>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-400 truncate">{attack.category}</span>
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
          {/* Definition */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <Eye className="h-5 w-5 text-cyber-primary" />
              Qu'est-ce que c'est ?
            </h3>
            <p className="text-gray-300 leading-relaxed">{attack.definition}</p>
          </div>

          {/* Example */}
          <div className={`rounded-xl p-4 ${attack.bgColor} border ${attack.borderColor}`}>
            <h4 className="font-semibold text-white mb-2">Exemple concret</h4>
            <p className="text-sm text-gray-300">{attack.example}</p>
          </div>

          {/* Signs */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Signes d'alerte détaillés
            </h3>
            <ul className="space-y-2">
              {attack.signs.map((sign, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-orange-400 shrink-0" />
                  <span className="text-gray-300">{sign}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Impacts */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <Target className="h-5 w-5 text-red-400" />
              Impacts potentiels
            </h3>
            <ul className="space-y-2">
              {attack.impacts.map((impact, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-gray-300">{impact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-white mb-3">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Comment se protéger
            </h3>
            <ul className="space-y-3">
              {attack.prevention.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
                    {i + 1}
                  </span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
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

export default function AttaquesPage() {
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);

  const filteredAttacks = filterSeverity
    ? attacks.filter(a => a.severity === filterSeverity)
    : attacks;

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-cyber-primary" />
          <h1 className="text-2xl font-bold text-white">Types d'Attaques</h1>
        </div>
        <p className="text-cyber-secondary">
          Reconnaissez rapidement les menaces pour agir immédiatement
        </p>
      </div>

      {/* Quick instruction banner */}
      <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-cyan-100 font-medium">Comment utiliser cette page ?</p>
            <p className="text-sm text-cyan-200/70 mt-1">
              Regardez les <strong>symptômes</strong> de chaque carte. Si vous les reconnaissez, 
              cliquez sur <strong>"C'est mon cas"</strong> pour obtenir un guide détaillé.
            </p>
          </div>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSeverity(null)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !filterSeverity
              ? 'bg-cyber-primary text-white'
              : 'border border-gray-700 text-cyber-secondary hover:text-white'
          }`}
          data-testid="filter-all"
        >
          Tous
        </button>
        {Object.entries(severityConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterSeverity(filterSeverity === key ? null : key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
              filterSeverity === key
                ? `${config.color} text-white`
                : 'border border-gray-700 text-cyber-secondary hover:text-white'
            }`}
            data-testid={`filter-${key}`}
          >
            <span>{config.emoji}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Attack Cards - V3 UX with symptoms and "C'est mon cas" button */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredAttacks.map(attack => {
          const Icon = attack.icon;
          const severity = severityConfig[attack.severity as keyof typeof severityConfig];

          return (
            <div
              key={attack.id}
              className={`rounded-2xl border bg-cyber-surface overflow-hidden transition-all hover:border-opacity-100 ${attack.borderColor}`}
              data-testid={`attack-card-${attack.id}`}
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl p-3 ${attack.bgColor}`}>
                      <Icon className={`h-6 w-6 ${attack.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{attack.name}</h3>
                      <span className="text-xs text-gray-400">{attack.category}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${attack.bgColor} ${severity.textColor}`}>
                    {severity.emoji} {severity.label}
                  </div>
                </div>

                {/* Symptoms - V3 UX */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Symptômes visibles
                  </h4>
                  <ul className="space-y-1.5">
                    {attack.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Action */}
                <div className={`p-3 rounded-lg ${attack.bgColor} border ${attack.borderColor} mb-4`}>
                  <p className="text-sm">
                    <span className="font-medium text-white">Action immédiate : </span>
                    <span className="text-gray-300">{attack.quickAction}</span>
                  </p>
                </div>

                {/* "C'est mon cas" button - V3 UX */}
                <button
                  onClick={() => setSelectedAttack(attack)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${attack.bgColor} ${attack.color} hover:opacity-80 border ${attack.borderColor}`}
                  data-testid={`cta-${attack.id}`}
                >
                  C'est mon cas
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedAttack && (
        <AttackDetailModal
          attack={selectedAttack}
          onClose={() => setSelectedAttack(null)}
        />
      )}
    </div>
  );
}
