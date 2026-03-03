import { EmergencyScenario } from '../types';

export const mockEmergencyScenarios: EmergencyScenario[] = [
  {
    id: 'phishing_click',
    title: 'J\'ai cliqué sur un lien de phishing',
    icon: 'mail-unread-outline',
    description: 'Vous avez cliqué sur un lien suspect dans un email ou SMS',
    immediateActions: [
      '1. Ne saisissez AUCUNE information si une page s\'est ouverte',
      '2. Fermez immédiatement la page/l\'onglet',
      '3. Changez vos mots de passe depuis un autre appareil',
      '4. Activez la 2FA sur vos comptes importants',
      '5. Surveillez vos comptes les prochains jours'
    ],
    contacts: [
      {
        name: 'Cybermalveillance.gouv.fr',
        website: 'https://www.cybermalveillance.gouv.fr',
        description: 'Assistance et prévention du risque numérique',
        icon: 'shield-outline'
      },
      {
        name: 'Signal Spam',
        website: 'https://www.signal-spam.fr',
        description: 'Signaler un spam ou phishing',
        icon: 'warning-outline'
      },
      {
        name: 'Pharos',
        website: 'https://www.internet-signalement.gouv.fr',
        description: 'Signalement de contenus illicites',
        icon: 'alert-circle-outline'
      }
    ],
    evidence: [
      'Capture d\'écran de l\'email/SMS',
      'Adresse email de l\'expéditeur',
      'URL du lien cliqué',
      'Date et heure de l\'incident'
    ],
    reportLinks: [
      { name: 'Signal Spam', url: 'https://www.signal-spam.fr', description: 'Signaler l\'email de phishing' },
      { name: 'Pharos', url: 'https://www.internet-signalement.gouv.fr', description: 'Signalement officiel' }
    ],
    templates: [
      {
        title: 'Email à votre banque',
        type: 'email',
        content: 'Objet : Signalement tentative de phishing\n\nBonjour,\n\nJe souhaite vous signaler que j\'ai reçu un email frauduleux se faisant passer pour [VOTRE BANQUE] le [DATE].\n\nJ\'ai malheureusement cliqué sur le lien contenu dans cet email. Je n\'ai saisi aucune information.\n\nPar précaution, je souhaite :\n- Vérifier qu\'aucune opération suspecte n\'a été effectuée\n- Être informé(e) des mesures de protection à prendre\n\nCordialement,\n[Votre nom]'
      }
    ]
  },
  {
    id: 'account_hacked',
    title: 'Mon compte a été piraté',
    icon: 'lock-open-outline',
    description: 'Vous n\'avez plus accès à votre compte ou constatez une activité suspecte',
    immediateActions: [
      '1. Tentez de récupérer l\'accès via "Mot de passe oublié"',
      '2. Si impossible, contactez le support du service',
      '3. Changez le mot de passe de votre email associé',
      '4. Vérifiez les autres comptes utilisant le même mot de passe',
      '5. Activez la 2FA partout où possible',
      '6. Prévenez vos contacts si réseau social'
    ],
    contacts: [
      {
        name: 'Support du service concerné',
        description: 'Contactez le support officiel du service piraté',
        icon: 'help-circle-outline'
      },
      {
        name: 'Cybermalveillance.gouv.fr',
        website: 'https://www.cybermalveillance.gouv.fr',
        description: 'Parcours d\'assistance personnalisé',
        icon: 'shield-outline'
      },
      {
        name: 'Police/Gendarmerie',
        phone: '17',
        description: 'En cas d\'usurpation d\'identité ou préjudice',
        icon: 'call-outline'
      }
    ],
    evidence: [
      'Historique des connexions (si accessible)',
      'Emails de notification de changement',
      'Messages reçus par vos contacts',
      'Captures d\'écran des anomalies'
    ],
    reportLinks: [
      { name: 'Cybermalveillance', url: 'https://www.cybermalveillance.gouv.fr', description: 'Obtenir de l\'aide' },
      { name: 'Plainte en ligne', url: 'https://www.pre-plainte-en-ligne.gouv.fr', description: 'Pré-plainte si préjudice' }
    ]
  },
  {
    id: 'ransomware',
    title: 'Ransomware / Fichiers chiffrés',
    icon: 'lock-closed-outline',
    description: 'Vos fichiers sont bloqués et on vous demande une rançon',
    immediateActions: [
      '1. DÉCONNECTEZ immédiatement la machine du réseau',
      '2. NE PAYEZ PAS la rançon',
      '3. Ne redémarrez pas l\'ordinateur',
      '4. Prenez des photos du message de rançon',
      '5. Contactez un expert en cybersécurité',
      '6. Déposez plainte'
    ],
    contacts: [
      {
        name: 'ANSSI',
        website: 'https://www.ssi.gouv.fr',
        description: 'Agence nationale de sécurité (entreprises)',
        icon: 'shield-outline'
      },
      {
        name: 'Cybermalveillance.gouv.fr',
        website: 'https://www.cybermalveillance.gouv.fr',
        description: 'Trouver un prestataire de confiance',
        icon: 'shield-outline'
      },
      {
        name: 'Police/Gendarmerie',
        phone: '17',
        description: 'Dépôt de plainte',
        icon: 'call-outline'
      },
      {
        name: 'No More Ransom',
        website: 'https://www.nomoreransom.org/fr',
        description: 'Outils de déchiffrement gratuits',
        icon: 'key-outline'
      }
    ],
    evidence: [
      'Photo du message de rançon',
      'Extension des fichiers chiffrés',
      'Note de rançon (.txt)',
      'Logs système si accessibles',
      'Historique des emails récents'
    ],
    reportLinks: [
      { name: 'Plainte en ligne', url: 'https://www.pre-plainte-en-ligne.gouv.fr', description: 'Pré-plainte officielle' },
      { name: 'No More Ransom', url: 'https://www.nomoreransom.org/fr', description: 'Vérifier si un déchiffreur existe' }
    ]
  },
  {
    id: 'bank_fraud',
    title: 'Fraude bancaire / Arnaque',
    icon: 'card-outline',
    description: 'Vous êtes victime d\'une arnaque financière ou constatez des mouvements suspects',
    immediateActions: [
      '1. Contactez IMMÉDIATEMENT votre banque',
      '2. Faites opposition sur votre carte',
      '3. Changez vos identifiants bancaires en ligne',
      '4. Conservez toutes les preuves',
      '5. Déposez plainte',
      '6. Signalez sur Perceval (arnaques carte bancaire)'
    ],
    contacts: [
      {
        name: 'Votre banque',
        description: 'Numéro d\'urgence carte (au dos de votre carte)',
        icon: 'call-outline'
      },
      {
        name: 'Perceval',
        website: 'https://www.service-public.fr/particuliers/vosdroits/R46526',
        description: 'Signaler une fraude à la carte bancaire',
        icon: 'card-outline'
      },
      {
        name: 'Info Escroqueries',
        phone: '0 805 805 817',
        description: 'Numéro vert, appel gratuit',
        icon: 'information-circle-outline'
      },
      {
        name: 'Police/Gendarmerie',
        phone: '17',
        description: 'Dépôt de plainte',
        icon: 'call-outline'
      }
    ],
    evidence: [
      'Relevés bancaires avec opérations frauduleuses',
      'Emails/SMS de la "fausse" entité',
      'Captures d\'écran des échanges',
      'Coordonnées du fraudeur',
      'Référence des virements'
    ],
    reportLinks: [
      { name: 'Perceval', url: 'https://www.service-public.fr/particuliers/vosdroits/R46526', description: 'Fraude carte bancaire' },
      { name: 'Plainte en ligne', url: 'https://www.pre-plainte-en-ligne.gouv.fr', description: 'Pré-plainte officielle' }
    ],
    templates: [
      {
        title: 'Email à votre banque',
        type: 'email',
        content: 'Objet : Contestation opération frauduleuse\n\nBonjour,\n\nJe conteste formellement l\'opération suivante :\n- Date : [DATE]\n- Montant : [MONTANT]\n- Libellé : [LIBELLÉ]\n\nJe n\'ai pas effectué ni autorisé cette transaction.\n\nJe vous demande :\n1. Le remboursement immédiat de cette somme\n2. La mise en opposition de ma carte\n3. L\'émission d\'une nouvelle carte\n\nJe me tiens à votre disposition pour tout complément.\n\nCordialement,\n[Votre nom]\n[Numéro de compte]'
      }
    ]
  },
  {
    id: 'identity_theft',
    title: 'Usurpation d\'identité',
    icon: 'person-outline',
    description: 'Quelqu\'un utilise votre identité à des fins frauduleuses',
    immediateActions: [
      '1. Déposez plainte immédiatement',
      '2. Prévenez votre banque',
      '3. Alertez la CNIL si données personnelles',
      '4. Conservez toutes les preuves',
      '5. Surveillez vos relevés bancaires et crédit',
      '6. Faites opposition sur vos documents si volés'
    ],
    contacts: [
      {
        name: 'Police/Gendarmerie',
        phone: '17',
        description: 'Dépôt de plainte obligatoire',
        icon: 'call-outline'
      },
      {
        name: 'CNIL',
        website: 'https://www.cnil.fr',
        description: 'Si vos données personnelles sont concernées',
        icon: 'document-text-outline'
      },
      {
        name: 'Banque de France',
        website: 'https://www.banque-france.fr',
        description: 'Fichier des incidents de crédit',
        icon: 'business-outline'
      },
      {
        name: 'ANTS',
        website: 'https://ants.gouv.fr',
        description: 'Déclaration perte/vol documents',
        icon: 'document-outline'
      }
    ],
    evidence: [
      'Copie de vos documents d\'identité',
      'Preuves de l\'usurpation (factures, relances)',
      'Correspondances reçues au nom usurpé',
      'Déclaration de perte/vol des documents'
    ],
    reportLinks: [
      { name: 'Plainte en ligne', url: 'https://www.pre-plainte-en-ligne.gouv.fr', description: 'Pré-plainte officielle' },
      { name: 'CNIL', url: 'https://www.cnil.fr/fr/plaintes', description: 'Plainte CNIL' }
    ]
  },
  {
    id: 'data_leak',
    title: 'Fuite de données / Email exposé',
    icon: 'cloud-offline-outline',
    description: 'Vos données personnelles ont été exposées dans une fuite',
    immediateActions: [
      '1. Vérifiez sur haveibeenpwned.com',
      '2. Changez immédiatement les mots de passe concernés',
      '3. Activez la 2FA sur tous vos comptes',
      '4. Surveillez vos comptes pour activité suspecte',
      '5. Méfiez-vous des tentatives de phishing ciblé'
    ],
    contacts: [
      {
        name: 'Have I Been Pwned',
        website: 'https://haveibeenpwned.com',
        description: 'Vérifier si vos données ont fuité',
        icon: 'search-outline'
      },
      {
        name: 'CNIL',
        website: 'https://www.cnil.fr',
        description: 'Signaler une violation de données',
        icon: 'document-text-outline'
      },
      {
        name: 'Cybermalveillance.gouv.fr',
        website: 'https://www.cybermalveillance.gouv.fr',
        description: 'Conseils personnalisés',
        icon: 'shield-outline'
      }
    ],
    evidence: [
      'Liste des comptes potentiellement compromis',
      'Notification de la fuite (si reçue)',
      'Résultat du test haveibeenpwned'
    ],
    reportLinks: [
      { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com', description: 'Vérifier vos emails' },
      { name: 'CNIL', url: 'https://www.cnil.fr', description: 'Signaler la fuite' }
    ]
  }
];
