import { useState } from 'react';
import {
  Wrench,
  Shield,
  Key,
  Eye,
  Search,
  Lock,
  Globe,
  Mail,
  Smartphone,
  Server,
  ExternalLink,
  Star,
  Filter,
} from 'lucide-react';

const tools = [
  // Gestionnaires de mots de passe
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    description: 'Gestionnaire de mots de passe open source, gratuit et sécurisé',
    category: 'Mots de passe',
    icon: Key,
    level: 'Débutant',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android', 'Web'],
    isFree: true,
    isRecommended: true,
    link: 'https://bitwarden.com',
    features: ['Synchronisation cloud', 'Générateur de mots de passe', 'Partage sécurisé', 'Audit de sécurité'],
  },
  {
    id: 'keepassxc',
    name: 'KeePassXC',
    description: 'Gestionnaire local et offline, aucune donnée dans le cloud',
    category: 'Mots de passe',
    icon: Key,
    level: 'Intermédiaire',
    os: ['Windows', 'Mac', 'Linux'],
    isFree: true,
    isRecommended: false,
    link: 'https://keepassxc.org',
    features: ['100% hors ligne', 'Open source', 'Intégration navigateur', 'TOTP intégré'],
  },
  // 2FA
  {
    id: 'aegis',
    name: 'Aegis Authenticator',
    description: 'Application 2FA open source avec sauvegarde chiffrée',
    category: 'Authentification',
    icon: Smartphone,
    level: 'Débutant',
    os: ['Android'],
    isFree: true,
    isRecommended: true,
    link: 'https://getaegis.app',
    features: ['Open source', 'Sauvegarde chiffrée', 'Import/Export', 'Biométrie'],
  },
  {
    id: 'raivo',
    name: 'Raivo OTP',
    description: 'Application 2FA minimaliste et sécurisée pour iOS',
    category: 'Authentification',
    icon: Smartphone,
    level: 'Débutant',
    os: ['iOS', 'Mac'],
    isFree: true,
    isRecommended: true,
    link: 'https://raivo-otp.com',
    features: ['Design Apple natif', 'Synchronisation iCloud', 'Widget iOS', 'Open source'],
  },
  // VPN
  {
    id: 'protonvpn',
    name: 'ProtonVPN',
    description: 'VPN suisse respectueux de la vie privée avec version gratuite',
    category: 'VPN',
    icon: Globe,
    level: 'Débutant',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android'],
    isFree: true,
    isRecommended: true,
    link: 'https://protonvpn.com',
    features: ['No-logs vérifié', 'Version gratuite', 'Kill switch', 'Serveurs SecureCore'],
  },
  {
    id: 'mullvad',
    name: 'Mullvad VPN',
    description: 'VPN anonyme sans compte - paiement en cash accepté',
    category: 'VPN',
    icon: Globe,
    level: 'Avancé',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android'],
    isFree: false,
    isRecommended: true,
    link: 'https://mullvad.net',
    features: ['Anonymat total', 'Prix unique 5€/mois', 'Open source', 'Audit externe'],
  },
  // Email sécurisé
  {
    id: 'protonmail',
    name: 'ProtonMail',
    description: 'Email chiffré de bout en bout basé en Suisse',
    category: 'Email',
    icon: Mail,
    level: 'Débutant',
    os: ['Web', 'iOS', 'Android'],
    isFree: true,
    isRecommended: true,
    link: 'https://proton.me',
    features: ['Chiffrement E2E', 'Zéro accès', 'Domaines personnalisés', 'Calendrier chiffré'],
  },
  // Antivirus
  {
    id: 'defender',
    name: 'Windows Defender',
    description: 'Antivirus intégré à Windows, suffisant pour la plupart des usages',
    category: 'Antivirus',
    icon: Shield,
    level: 'Débutant',
    os: ['Windows'],
    isFree: true,
    isRecommended: true,
    link: 'https://microsoft.com',
    features: ['Intégré à Windows', 'Protection temps réel', 'Pare-feu', 'Mises à jour auto'],
  },
  {
    id: 'malwarebytes',
    name: 'Malwarebytes',
    description: 'Scanner anti-malware pour nettoyage ponctuel',
    category: 'Antivirus',
    icon: Shield,
    level: 'Débutant',
    os: ['Windows', 'Mac', 'iOS', 'Android'],
    isFree: true,
    isRecommended: false,
    link: 'https://malwarebytes.com',
    features: ['Scan à la demande gratuit', 'Détection avancée', 'Suppression rootkits', 'Protection navigateur'],
  },
  // Vérification fuites
  {
    id: 'hibp',
    name: 'Have I Been Pwned',
    description: 'Vérifiez si vos données ont été exposées dans une fuite',
    category: 'Vérification',
    icon: Search,
    level: 'Débutant',
    os: ['Web'],
    isFree: true,
    isRecommended: true,
    link: 'https://haveibeenpwned.com',
    features: ['Recherche par email', 'Alertes de fuite', 'API gratuite', 'Base de 12+ milliards'],
  },
  // DNS sécurisé
  {
    id: 'nextdns',
    name: 'NextDNS',
    description: 'DNS chiffré avec blocage de pubs et trackers',
    category: 'Réseau',
    icon: Server,
    level: 'Intermédiaire',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android', 'Router'],
    isFree: true,
    isRecommended: true,
    link: 'https://nextdns.io',
    features: ['300k requêtes/mois gratuites', 'Blocage pubs/trackers', 'Logs configurables', 'Profils multiples'],
  },
  // Navigateur
  {
    id: 'firefox',
    name: 'Firefox',
    description: 'Navigateur respectueux de la vie privée avec protection renforcée',
    category: 'Navigateur',
    icon: Globe,
    level: 'Débutant',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android'],
    isFree: true,
    isRecommended: true,
    link: 'https://firefox.com',
    features: ['Enhanced Tracking Protection', 'Containers', 'Open source', 'Pas de Google'],
  },
  {
    id: 'brave',
    name: 'Brave',
    description: 'Navigateur avec bloqueur de pubs et trackers intégré',
    category: 'Navigateur',
    icon: Globe,
    level: 'Débutant',
    os: ['Windows', 'Mac', 'Linux', 'iOS', 'Android'],
    isFree: true,
    isRecommended: false,
    link: 'https://brave.com',
    features: ['Bloqueur intégré', 'Fingerprinting protection', 'Tor intégré', 'Sync chiffré'],
  },
  // Analyse
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'Analysez fichiers et URLs avec 70+ antivirus',
    category: 'Analyse',
    icon: Eye,
    level: 'Intermédiaire',
    os: ['Web'],
    isFree: true,
    isRecommended: true,
    link: 'https://virustotal.com',
    features: ['70+ moteurs antivirus', 'Analyse URL', 'Sandbox comportemental', 'API gratuite'],
  },
  // Chiffrement
  {
    id: 'veracrypt',
    name: 'VeraCrypt',
    description: 'Chiffrement de disques et conteneurs sécurisés',
    category: 'Chiffrement',
    icon: Lock,
    level: 'Avancé',
    os: ['Windows', 'Mac', 'Linux'],
    isFree: true,
    isRecommended: true,
    link: 'https://veracrypt.fr',
    features: ['Chiffrement AES-256', 'Volumes cachés', 'Chiffrement système', 'Open source'],
  },
];

const categories = ['Tous', 'Mots de passe', 'Authentification', 'VPN', 'Email', 'Antivirus', 'Vérification', 'Réseau', 'Navigateur', 'Analyse', 'Chiffrement'];

export default function OutilsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const filteredTools = tools.filter(tool => {
    if (selectedCategory !== 'Tous' && tool.category !== selectedCategory) return false;
    if (showFreeOnly && !tool.isFree) return false;
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-500/20 text-green-400';
      case 'Intermédiaire': return 'bg-orange-500/20 text-orange-400';
      case 'Avancé': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="h-6 w-6 text-cyber-primary" />
          <h1 className="text-2xl font-bold text-white">Boîte à Outils</h1>
        </div>
        <p className="text-cyber-secondary">
          Outils recommandés pour sécuriser votre vie numérique
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyber-primary text-white'
                  : 'border border-gray-700 text-cyber-secondary hover:text-white hover:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Free filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFreeOnly(!showFreeOnly)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              showFreeOnly
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'border border-gray-700 text-cyber-secondary hover:text-white'
            }`}
          >
            <Filter className="h-4 w-4" />
            Gratuits uniquement
          </button>
          <span className="text-sm text-cyber-secondary">
            {filteredTools.length} outil{filteredTools.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTools.map(tool => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className="group rounded-2xl border border-gray-800 bg-cyber-surface p-5 transition-all hover:border-cyber-primary/50"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyber-elevated p-3">
                    <Icon className="h-5 w-5 text-cyber-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{tool.name}</h3>
                      {tool.isRecommended && (
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <span className="text-xs text-cyber-secondary">{tool.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getLevelColor(tool.level)}`}>
                    {tool.level}
                  </span>
                  {tool.isFree && (
                    <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                      Gratuit
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-cyber-secondary mb-4">{tool.description}</p>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-cyber-elevated px-2 py-1 text-xs text-cyber-secondary"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* OS badges */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tool.os.slice(0, 4).map((os, i) => (
                    <span
                      key={i}
                      className="rounded bg-cyber-bg px-1.5 py-0.5 text-xs text-gray-500"
                    >
                      {os}
                    </span>
                  ))}
                  {tool.os.length > 4 && (
                    <span className="rounded bg-cyber-bg px-1.5 py-0.5 text-xs text-gray-500">
                      +{tool.os.length - 4}
                    </span>
                  )}
                </div>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-cyber-primary hover:underline"
                >
                  Ouvrir
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Tips */}
      <div className="mt-8 rounded-2xl border border-cyber-primary/30 bg-cyber-primary/10 p-6">
        <h3 className="font-semibold text-white mb-3">💡 Conseils de pro</h3>
        <ul className="space-y-2 text-sm text-cyber-secondary">
          <li>• Commencez par un <strong className="text-white">gestionnaire de mots de passe</strong> - c'est la base de tout</li>
          <li>• Activez la <strong className="text-white">2FA</strong> sur tous vos comptes importants (email, banque, réseaux sociaux)</li>
          <li>• <strong className="text-white">Windows Defender</strong> suffit généralement, pas besoin d'antivirus payant</li>
          <li>• Vérifiez régulièrement vos emails sur <strong className="text-white">HaveIBeenPwned</strong></li>
        </ul>
      </div>
    </div>
  );
}
