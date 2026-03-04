import { News } from '../types';

export const mockNews: News[] = [
  {
    id: '1',
    title: 'Nouvelle vague de phishing ciblant les banques françaises',
    source: 'ANSSI',
    date: '2025-07-15',
    level: 'debutant',
    threatType: 'phishing',
    severity: 'eleve',
    audience: 'tous',
    tldr: [
      'Des emails frauduleux imitent BNP, Crédit Agricole et Société Générale',
      'Les liens redirigent vers de faux sites bancaires',
      'Plus de 10 000 victimes potentielles identifiées'
    ],
    impact: 'Particuliers et entreprises utilisant ces banques',
    actions: [
      'Ne jamais cliquer sur les liens dans les emails bancaires',
      'Vérifier l\'URL du site (doit commencer par https://)',
      'Contacter votre banque directement en cas de doute',
      'Activer les notifications de connexion sur votre espace bancaire',
      'Signaler tout email suspect à votre banque'
    ],
    details: 'Une campagne de phishing sophistiquée cible actuellement les clients des principales banques françaises. Les emails sont très réalistes et utilisent le logo officiel des banques. Le CERT-FR a émis une alerte et recommande la plus grande vigilance.'
  },
  {
    id: '2',
    title: 'Ransomware LockBit 4.0 : Alerte maximale pour les PME',
    source: 'CERT-FR',
    date: '2025-07-14',
    level: 'intermediaire',
    threatType: 'ransomware',
    severity: 'critique',
    audience: 'entreprises',
    tldr: [
      'Nouvelle version plus agressive du ransomware LockBit',
      'Cible principalement les PME françaises',
      'Demandes de rançon moyennes de 50 000€'
    ],
    impact: 'PME et ETI de tous secteurs',
    actions: [
      'Sauvegarder immédiatement vos données critiques',
      'Mettre à jour tous vos systèmes',
      'Vérifier vos accès RDP (désactiver si non utilisé)',
      'Former vos équipes aux risques',
      'Préparer un plan de réponse aux incidents',
      'Contacter votre CSIRT régional'
    ],
    details: 'LockBit 4.0 intègre de nouvelles techniques d\'évasion et de chiffrement. Les attaquants exploitent des vulnérabilités connues et le phishing pour pénétrer les réseaux. La sauvegarde 3-2-1 reste la meilleure protection.'
  },
  {
    id: '3',
    title: 'Fuite de données : 2 millions de comptes français exposés',
    source: 'Cybermalveillance.gouv.fr',
    date: '2025-07-13',
    level: 'debutant',
    threatType: 'data_leak',
    severity: 'eleve',
    audience: 'particuliers',
    tldr: [
      'Base de données contenant emails et mots de passe française en vente',
      'Provient possiblement de plusieurs brèches passées',
      'Risque de credential stuffing élevé'
    ],
    impact: 'Tout utilisateur ayant un compte en ligne',
    actions: [
      'Changer vos mots de passe principaux immédiatement',
      'Activer l\'authentification à deux facteurs (2FA)',
      'Vérifier vos comptes sur haveibeenpwned.com',
      'Utiliser un gestionnaire de mots de passe',
      'Surveiller vos relevés bancaires'
    ],
    details: 'Une base de données compilant des informations de plusieurs fuites est actuellement vendue sur le dark web. Elle contient principalement des adresses email françaises avec leurs mots de passe associés.'
  },
  {
    id: '4',
    title: 'Vulnérabilité critique dans Windows : Patch urgent',
    source: 'Microsoft',
    date: '2025-07-12',
    level: 'avance',
    threatType: 'vuln',
    severity: 'critique',
    audience: 'tous',
    tldr: [
      'Faille zero-day activement exploitée',
      'Permet l\'exécution de code à distance',
      'Patch disponible via Windows Update'
    ],
    impact: 'Tous les utilisateurs Windows 10/11',
    actions: [
      'Lancer Windows Update immédiatement',
      'Redémarrer après installation du patch',
      'Vérifier que la mise à jour KB5040442 est installée',
      'Scanner votre système avec un antivirus à jour'
    ],
    details: 'Microsoft a publié un correctif d\'urgence pour une vulnérabilité CVE-2025-XXXX qui permet à un attaquant d\'exécuter du code malveillant. Cette faille est activement exploitée par des groupes cybercriminels.'
  },
  {
    id: '5',
    title: 'Arnaque au faux support Microsoft en hausse',
    source: 'Signal Spam',
    date: '2025-07-11',
    level: 'debutant',
    threatType: 'scam',
    severity: 'moyen',
    audience: 'particuliers',
    tldr: [
      'Appels et pop-ups prétendant être le support Microsoft',
      'Demande de prise en main à distance du PC',
      'Vol de données et installation de malware'
    ],
    impact: 'Particuliers, seniors notamment',
    actions: [
      'Ne jamais appeler les numéros affichés dans des pop-ups',
      'Ne jamais donner accès à distance à un inconnu',
      'Microsoft ne contacte jamais par téléphone spontanément',
      'En cas de doute, éteindre l\'ordinateur',
      'Signaler sur signal-spam.fr'
    ],
    details: 'Les arnaques au faux support technique connaissent une recrudescence. Les escrocs utilisent des pop-ups alarmants ou des appels téléphoniques pour effrayer les victimes et leur soutirer de l\'argent.'
  },
  {
    id: '6',
    title: 'Malware Android : 15 apps malveillantes sur le Play Store',
    source: 'Google',
    date: '2025-07-10',
    level: 'debutant',
    threatType: 'malware',
    severity: 'eleve',
    audience: 'particuliers',
    tldr: [
      '15 applications malveillantes retirées du Play Store',
      'Volaient données bancaires et contacts',
      'Plus de 500 000 téléchargements au total'
    ],
    impact: 'Utilisateurs Android ayant installé ces apps',
    actions: [
      'Vérifier vos applications installées',
      'Désinstaller toute app suspecte ou inconnue',
      'Scanner avec Play Protect',
      'Changer vos mots de passe bancaires',
      'Surveiller vos comptes pour transactions suspectes'
    ],
    details: 'Google a supprimé 15 applications du Play Store qui contenaient un malware de type "banking trojan". Ces apps se faisaient passer pour des outils de productivité ou des jeux.'
  }
];
