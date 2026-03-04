import { Tool, GlossaryItem } from '../types';

export const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Bitwarden',
    description: 'Gestionnaire de mots de passe open source et gratuit. Génère et stocke vos mots de passe de manière sécurisée.',
    level: 'debutant',
    os: ['ios', 'android', 'windows', 'mac', 'linux'],
    category: 'Mots de passe',
    icon: 'key-outline',
    link: 'https://bitwarden.com',
    isFree: true
  },
  {
    id: '2',
    name: '1Password',
    description: 'Gestionnaire de mots de passe premium avec interface intuitive et partage familial.',
    level: 'debutant',
    os: ['ios', 'android', 'windows', 'mac'],
    category: 'Mots de passe',
    icon: 'key-outline',
    link: 'https://1password.com',
    isFree: false
  },
  {
    id: '3',
    name: 'Authy',
    description: 'Application de double authentification (2FA) avec sauvegarde cloud et multi-appareils.',
    level: 'debutant',
    os: ['ios', 'android', 'windows', 'mac'],
    category: 'Authentification',
    icon: 'phone-portrait-outline',
    link: 'https://authy.com',
    isFree: true
  },
  {
    id: '4',
    name: 'Google Authenticator',
    description: 'Application 2FA simple de Google. Génère des codes à usage unique.',
    level: 'debutant',
    os: ['ios', 'android'],
    category: 'Authentification',
    icon: 'phone-portrait-outline',
    link: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
    isFree: true
  },
  {
    id: '5',
    name: 'ProtonVPN',
    description: 'VPN suisse respectueux de la vie privée. Version gratuite disponible.',
    level: 'intermediaire',
    os: ['ios', 'android', 'windows', 'mac', 'linux'],
    category: 'VPN',
    icon: 'shield-outline',
    link: 'https://protonvpn.com',
    isFree: true
  },
  {
    id: '6',
    name: 'Malwarebytes',
    description: 'Anti-malware efficace pour détecter et supprimer les logiciels malveillants.',
    level: 'debutant',
    os: ['windows', 'mac', 'android', 'ios'],
    category: 'Antivirus',
    icon: 'bug-outline',
    link: 'https://www.malwarebytes.com',
    isFree: true
  },
  {
    id: '7',
    name: 'Signal',
    description: 'Messagerie chiffrée de bout en bout. Alternative sécurisée à WhatsApp.',
    level: 'debutant',
    os: ['ios', 'android', 'windows', 'mac', 'linux'],
    category: 'Communication',
    icon: 'chatbubble-outline',
    link: 'https://signal.org',
    isFree: true
  },
  {
    id: '8',
    name: 'VeraCrypt',
    description: 'Outil de chiffrement de disque open source. Protège vos fichiers sensibles.',
    level: 'avance',
    os: ['windows', 'mac', 'linux'],
    category: 'Chiffrement',
    icon: 'lock-closed-outline',
    link: 'https://veracrypt.fr',
    isFree: true
  },
  {
    id: '9',
    name: 'uBlock Origin',
    description: 'Bloqueur de publicités et de trackers efficace pour navigateur.',
    level: 'debutant',
    os: ['windows', 'mac', 'linux'],
    category: 'Navigation',
    icon: 'eye-off-outline',
    link: 'https://ublockorigin.com',
    isFree: true
  },
  {
    id: '10',
    name: 'KeePassXC',
    description: 'Gestionnaire de mots de passe local et open source. Pas de cloud.',
    level: 'avance',
    os: ['windows', 'mac', 'linux'],
    category: 'Mots de passe',
    icon: 'key-outline',
    link: 'https://keepassxc.org',
    isFree: true
  }
];

export const toolCategories = [
  { id: 'passwords', name: 'Mots de passe', icon: 'key-outline' },
  { id: 'auth', name: 'Authentification', icon: 'phone-portrait-outline' },
  { id: 'vpn', name: 'VPN', icon: 'shield-outline' },
  { id: 'antivirus', name: 'Antivirus', icon: 'bug-outline' },
  { id: 'encryption', name: 'Chiffrement', icon: 'lock-closed-outline' },
  { id: 'communication', name: 'Communication', icon: 'chatbubble-outline' },
  { id: 'navigation', name: 'Navigation', icon: 'globe-outline' }
];

export const glossary: GlossaryItem[] = [
  { term: '2FA / MFA', definition: 'Authentification à deux facteurs / multi-facteurs. Ajoute une couche de sécurité en plus du mot de passe.', category: 'Authentification' },
  { term: 'Chiffrement', definition: 'Processus qui transforme des données lisibles en données codées, illisibles sans la clé de déchiffrement.', category: 'Cryptographie' },
  { term: 'Credential Stuffing', definition: 'Attaque utilisant des identifiants volés pour tenter de se connecter à d\'autres services.', category: 'Attaques' },
  { term: 'EDR', definition: 'Endpoint Detection and Response. Solution de sécurité qui surveille et répond aux menaces sur les postes de travail.', category: 'Entreprise' },
  { term: 'Firewall', definition: 'Pare-feu. Système qui filtre le trafic réseau pour bloquer les connexions non autorisées.', category: 'Réseau' },
  { term: 'Hash', definition: 'Empreinte numérique unique générée à partir de données. Utilisé pour vérifier l\'intégrité ou stocker des mots de passe.', category: 'Cryptographie' },
  { term: 'HTTPS', definition: 'Protocol HTTP sécurisé. Le cadenas dans la barre d\'adresse indique une connexion chiffrée.', category: 'Web' },
  { term: 'Malware', definition: 'Logiciel malveillant : virus, trojan, ransomware, spyware, etc.', category: 'Menaces' },
  { term: 'Patch', definition: 'Correctif logiciel qui corrige des failles de sécurité ou des bugs.', category: 'Maintenance' },
  { term: 'Phishing', definition: 'Hameçonnage. Technique d\'escroquerie pour voler des informations en se faisant passer pour une entité de confiance.', category: 'Attaques' },
  { term: 'Ransomware', definition: 'Rançongiciel. Malware qui chiffre vos fichiers et demande une rançon pour les récupérer.', category: 'Menaces' },
  { term: 'SIEM', definition: 'Security Information and Event Management. Système centralisant les logs de sécurité pour détecter les menaces.', category: 'Entreprise' },
  { term: 'Social Engineering', definition: 'Ingénierie sociale. Manipulation psychologique pour obtenir des informations ou accès.', category: 'Attaques' },
  { term: 'VPN', definition: 'Virtual Private Network. Crée un tunnel chiffré pour sécuriser votre connexion internet.', category: 'Réseau' },
  { term: 'Zero-day', definition: 'Vulnérabilité inconnue des éditeurs, donc sans correctif disponible.', category: 'Vulnérabilités' },
  { term: 'Zero Trust', definition: 'Modèle de sécurité où aucune connexion n\'est considérée comme fiable par défaut.', category: 'Concepts' }
];
