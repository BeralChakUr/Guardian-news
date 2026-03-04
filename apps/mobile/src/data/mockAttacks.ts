import { Attack } from '../types';

export const attackCategories = [
  { id: 'social', name: 'Social Engineering', icon: 'people-outline' },
  { id: 'malware', name: 'Malware', icon: 'bug-outline' },
  { id: 'ransomware', name: 'Ransomware', icon: 'lock-closed-outline' },
  { id: 'fraude', name: 'Fraude', icon: 'card-outline' },
  { id: 'identity', name: 'Vol d\'identité', icon: 'finger-print-outline' },
  { id: 'network', name: 'Attaques réseau', icon: 'wifi-outline' },
];

export const mockAttacks: Attack[] = [
  {
    id: '1',
    name: 'Phishing',
    category: 'social',
    icon: 'mail-outline',
    definition: 'Le phishing (ou hameçonnage) est une technique d\'escroquerie qui consiste à se faire passer pour une entité de confiance (banque, administration, entreprise) pour voler vos informations personnelles.',
    example: 'Vous recevez un email de "votre banque" vous demandant de confirmer vos identifiants car votre compte serait "compromis". Le lien mène vers un faux site qui récupère vos données.',
    signs: [
      'Email provenant d\'une adresse suspecte',
      'Fautes d\'orthographe ou de grammaire',
      'Ton urgent ou menaçant',
      'Demande d\'informations personnelles',
      'Liens raccourcis ou suspects',
      'Pièces jointes inattendues'
    ],
    impacts: [
      'Vol de vos identifiants bancaires',
      'Usurpation d\'identité',
      'Pertes financières',
      'Compromission de vos comptes'
    ],
    prevention: [
      'Vérifier l\'adresse email de l\'expéditeur',
      'Ne jamais cliquer sur les liens suspects',
      'Aller directement sur le site officiel',
      'Activer la double authentification (2FA)',
      'Utiliser un filtre anti-spam'
    ],
    victimSteps: [
      'Changer immédiatement vos mots de passe',
      'Contacter votre banque si données bancaires compromises',
      'Signaler sur Pharos (internet-signalement.gouv.fr)',
      'Déposer plainte si préjudice financier'
    ],
    level: 'debutant'
  },
  {
    id: '2',
    name: 'Ransomware',
    category: 'ransomware',
    icon: 'lock-closed-outline',
    definition: 'Un ransomware (rançongiciel) est un logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les récupérer. C\'est l\'une des menaces les plus destructrices.',
    example: 'Un employé ouvre une pièce jointe infectée. En quelques minutes, tous les fichiers de l\'entreprise sont chiffrés. Un message s\'affiche demandant 50 000€ en Bitcoin.',
    signs: [
      'Fichiers avec extensions modifiées (.encrypted, .locked)',
      'Message de rançon sur l\'écran',
      'Impossibilité d\'ouvrir vos documents',
      'Ordinateur très lent',
      'Programmes qui ne répondent plus'
    ],
    impacts: [
      'Perte totale des données si pas de sauvegarde',
      'Arrêt de l\'activité (entreprise)',
      'Coût financier important',
      'Atteinte à la réputation'
    ],
    prevention: [
      'Sauvegardes régulières (règle 3-2-1)',
      'Mises à jour systèmes et logiciels',
      'Formation des employés',
      'Antivirus et EDR à jour',
      'Ne jamais ouvrir de pièces jointes suspectes',
      'Segmentation réseau'
    ],
    victimSteps: [
      'Déconnecter immédiatement la machine du réseau',
      'Ne PAS payer la rançon',
      'Contacter un expert en cybersécurité',
      'Déposer plainte auprès de la police/gendarmerie',
      'Signaler sur cybermalveillance.gouv.fr'
    ],
    level: 'intermediaire'
  },
  {
    id: '3',
    name: 'Usurpation d\'identité',
    category: 'identity',
    icon: 'person-outline',
    definition: 'L\'usurpation d\'identité consiste à utiliser les informations personnelles d\'une personne sans son consentement pour commettre des actes frauduleux.',
    example: 'Un fraudeur utilise vos nom, adresse et numéro de sécurité sociale pour contracter un crédit à votre nom.',
    signs: [
      'Courriers pour des services non souscrits',
      'Relances pour des impayés inconnus',
      'Transactions bancaires non reconnues',
      'Difficultés à obtenir un crédit',
      'Appels de recouvrement'
    ],
    impacts: [
      'Problèmes financiers',
      'Dégradation de votre score de crédit',
      'Procédures judiciaires',
      'Stress et atteinte psychologique'
    ],
    prevention: [
      'Protéger vos documents d\'identité',
      'Ne jamais partager votre numéro de sécu inutilement',
      'Détruire les documents sensibles',
      'Surveiller régulièrement vos comptes',
      'Être vigilant sur les réseaux sociaux'
    ],
    victimSteps: [
      'Porter plainte immédiatement',
      'Prévenir votre banque',
      'Contacter la CNIL',
      'Faire opposition sur vos documents',
      'Demander un fichier Banque de France'
    ],
    level: 'debutant'
  },
  {
    id: '4',
    name: 'Attaque Wi-Fi (Man-in-the-Middle)',
    category: 'network',
    icon: 'wifi-outline',
    definition: 'Une attaque Man-in-the-Middle (MITM) consiste à intercepter les communications entre vous et un service en ligne en se plaçant "au milieu" de la connexion.',
    example: 'Vous vous connectez à un Wi-Fi gratuit "Free_WiFi" dans un café. En réalité, c\'est un pirate qui capture tout votre trafic internet et vos mots de passe.',
    signs: [
      'Connexion Wi-Fi non sécurisée',
      'Certificat de sécurité invalide',
      'Connexion inhabituellement lente',
      'Redirection vers des sites suspects'
    ],
    impacts: [
      'Vol de mots de passe',
      'Interception de données sensibles',
      'Usurpation de session',
      'Installation de malware'
    ],
    prevention: [
      'Éviter les Wi-Fi publics non sécurisés',
      'Utiliser un VPN',
      'Vérifier les certificats HTTPS',
      'Désactiver la connexion automatique Wi-Fi',
      'Utiliser le partage de connexion mobile'
    ],
    victimSteps: [
      'Se déconnecter immédiatement du Wi-Fi',
      'Changer tous vos mots de passe',
      'Vérifier vos comptes bancaires',
      'Scanner votre appareil avec un antivirus'
    ],
    level: 'intermediaire'
  },
  {
    id: '5',
    name: 'Fraude au président (BEC)',
    category: 'fraude',
    icon: 'briefcase-outline',
    definition: 'La fraude au président (ou Business Email Compromise) est une arnaque où le fraudeur se fait passer pour un dirigeant pour ordonner un virement urgent et confidentiel.',
    example: 'Un comptable reçoit un email "du PDG" lui demandant de virer 50 000€ à un fournisseur étranger "de manière urgente et confidentielle".',
    signs: [
      'Demande urgente et confidentielle',
      'Changement de coordonnées bancaires',
      'Email légèrement différent de l\'habituel',
      'Pression pour agir vite',
      'Interdiction d\'en parler à d\'autres'
    ],
    impacts: [
      'Pertes financières majeures',
      'Atteinte à la réputation',
      'Conséquences juridiques',
      'Perte de confiance'
    ],
    prevention: [
      'Procédure de double validation pour les virements',
      'Vérifier par téléphone les demandes inhabituelles',
      'Former les équipes comptables',
      'Ne jamais céder à l\'urgence',
      'Vérifier l\'adresse email exacte'
    ],
    victimSteps: [
      'Contacter immédiatement votre banque',
      'Déposer plainte',
      'Informer la direction',
      'Conserver toutes les preuves'
    ],
    level: 'intermediaire'
  },
  {
    id: '6',
    name: 'Malware / Virus',
    category: 'malware',
    icon: 'bug-outline',
    definition: 'Un malware (logiciel malveillant) est un programme conçu pour infiltrer ou endommager un système informatique. Cela inclut virus, trojans, spywares, etc.',
    example: 'Vous téléchargez un "crack" pour un logiciel. En réalité, il contient un trojan qui vole vos mots de passe enregistrés.',
    signs: [
      'Ordinateur très lent',
      'Pop-ups intempestifs',
      'Programmes inconnus installés',
      'Antivirus désactivé',
      'Connexions réseau suspectes'
    ],
    impacts: [
      'Vol de données',
      'Dégradation des performances',
      'Prise de contrôle de l\'appareil',
      'Utilisation pour des attaques (botnet)'
    ],
    prevention: [
      'Antivirus à jour et actif',
      'Ne télécharger que depuis sources officielles',
      'Éviter les cracks et keygens',
      'Mises à jour régulières',
      'Ne pas cliquer sur les pièces jointes suspectes'
    ],
    victimSteps: [
      'Déconnecter d\'Internet',
      'Scanner avec un antivirus',
      'Changer vos mots de passe depuis un autre appareil',
      'Réinstaller le système si compromis'
    ],
    level: 'debutant'
  }
];
