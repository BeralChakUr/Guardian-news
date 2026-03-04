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
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Target,
} from 'lucide-react';

const attacks = [
  {
    id: 'phishing',
    name: 'Phishing',
    category: 'Ingénierie sociale',
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    level: 'Débutant',
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
    level: 'Avancé',
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
    level: 'Intermédiaire',
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
    level: 'Intermédiaire',
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
    level: 'Débutant',
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
    level: 'Avancé',
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
    level: 'Avancé',
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
    level: 'Intermédiaire',
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

export default function AttaquesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  const filteredAttacks = filterLevel
    ? attacks.filter(a => a.level === filterLevel)
    : attacks;

  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-cyber-primary" />
          <h1 className="text-2xl font-bold text-white">Types d'Attaques</h1>
        </div>
        <p className="text-cyber-secondary">
          Comprendre les menaces pour mieux se protéger
        </p>
      </div>

      {/* Level Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterLevel(null)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !filterLevel
              ? 'bg-cyber-primary text-white'
              : 'border border-gray-700 text-cyber-secondary hover:text-white'
          }`}
        >
          Tous
        </button>
        {levels.map(level => (
          <button
            key={level}
            onClick={() => setFilterLevel(filterLevel === level ? null : level)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterLevel === level
                ? level === 'Débutant' ? 'bg-green-500 text-white' :
                  level === 'Intermédiaire' ? 'bg-orange-500 text-white' :
                  'bg-red-500 text-white'
                : 'border border-gray-700 text-cyber-secondary hover:text-white'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Attacks List */}
      <div className="space-y-4">
        {filteredAttacks.map(attack => {
          const Icon = attack.icon;
          const isExpanded = expandedId === attack.id;

          return (
            <div
              key={attack.id}
              className={`rounded-2xl border bg-cyber-surface overflow-hidden transition-all ${attack.borderColor}`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : attack.id)}
                className="flex w-full items-center justify-between p-5"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${attack.bgColor}`}>
                    <Icon className={`h-6 w-6 ${attack.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{attack.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-cyber-secondary">{attack.category}</span>
                      <span className="text-gray-600">•</span>
                      <span className={`text-xs font-medium ${
                        attack.level === 'Débutant' ? 'text-green-400' :
                        attack.level === 'Intermédiaire' ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {attack.level}
                      </span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-cyber-secondary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-cyber-secondary" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-5 space-y-6">
                  {/* Definition */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-white mb-2">
                      <Eye className="h-4 w-4 text-cyber-primary" />
                      Définition
                    </h4>
                    <p className="text-cyber-secondary">{attack.definition}</p>
                  </div>

                  {/* Example */}
                  <div className={`rounded-xl p-4 ${attack.bgColor}`}>
                    <h4 className="font-semibold text-white mb-2">Exemple concret</h4>
                    <p className="text-sm text-cyber-secondary">{attack.example}</p>
                  </div>

                  {/* Signs */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      Signes d'alerte
                    </h4>
                    <ul className="space-y-2">
                      {attack.signs.map((sign, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
                          <span className="text-sm text-cyber-secondary">{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Impacts */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                      <Target className="h-4 w-4 text-red-400" />
                      Impacts potentiels
                    </h4>
                    <ul className="space-y-2">
                      {attack.impacts.map((impact, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-sm text-cyber-secondary">{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-white mb-3">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Comment se protéger
                    </h4>
                    <ul className="space-y-2">
                      {attack.prevention.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-bold text-green-400">
                            {i + 1}
                          </span>
                          <span className="text-sm text-cyber-secondary">{tip}</span>
                        </li>
                      ))}
                    </ul>
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
