import { LearningModule, Badge } from '../types';

export const mockLearningModules: LearningModule[] = [
  {
    id: 'level0',
    level: 0,
    levelName: 'Les bases',
    title: 'Premiers pas en cybersécurité',
    description: 'Découvrez les fondamentaux pour vous protéger en ligne',
    icon: 'school-outline',
    duration: '15 min',
    lessons: [
      {
        id: 'l0-1',
        title: 'Créer un mot de passe solide',
        content: 'Un bon mot de passe est votre première ligne de défense. Il doit être long (12+ caractères), unique pour chaque service, et combiner lettres, chiffres et symboles.',
        tips: [
          'Utilisez une phrase de passe : "MonChienAdore3Croquettes!"',
          'Ne réutilisez jamais le même mot de passe',
          'Évitez les informations personnelles (date de naissance, nom)',
          'Changez vos mots de passe compromis immédiatement'
        ],
        quiz: {
          question: 'Quel est le mot de passe le plus sécurisé ?',
          options: ['password123', 'Jean2024', 'MonCh@tMange5Souris!', '123456789'],
          correctIndex: 2,
          explanation: 'Une phrase de passe longue avec des caractères spéciaux est beaucoup plus difficile à craquer qu\'un mot simple.'
        }
      },
      {
        id: 'l0-2',
        title: 'Activer la double authentification (2FA)',
        content: 'La 2FA ajoute une couche de sécurité en demandant un code en plus de votre mot de passe. Même si votre mot de passe est volé, le pirate ne peut pas accéder à votre compte.',
        tips: [
          'Préférez une app (Google Authenticator, Authy) au SMS',
          'Activez la 2FA sur tous vos comptes importants',
          'Conservez vos codes de récupération en lieu sûr',
          'La 2FA bloque 99.9% des attaques automatisées'
        ],
        quiz: {
          question: 'Quelle méthode de 2FA est la plus sécurisée ?',
          options: ['SMS', 'Email', 'Application d\'authentification', 'Aucune'],
          correctIndex: 2,
          explanation: 'Les applications d\'authentification sont plus sécurisées car les SMS peuvent être interceptés.'
        }
      },
      {
        id: 'l0-3',
        title: 'Mettre à jour ses appareils',
        content: 'Les mises à jour corrigent des failles de sécurité. Ne pas les installer, c\'est laisser la porte ouverte aux pirates.',
        tips: [
          'Activez les mises à jour automatiques',
          'Mettez à jour votre système ET vos applications',
          'Ne retardez jamais les mises à jour de sécurité',
          'Vérifiez régulièrement les mises à jour disponibles'
        ],
        quiz: {
          question: 'Pourquoi les mises à jour sont-elles importantes ?',
          options: ['Pour avoir de nouvelles fonctionnalités', 'Pour corriger les failles de sécurité', 'Pour que l\'appareil soit plus joli', 'Elles ne sont pas importantes'],
          correctIndex: 1,
          explanation: 'Les mises à jour corrigent des vulnérabilités qui peuvent être exploitées par les pirates.'
        }
      }
    ]
  },
  {
    id: 'level1',
    level: 1,
    levelName: 'Hygiène numérique',
    title: 'Bonnes pratiques au quotidien',
    description: 'Adoptez les réflexes qui vous protègent chaque jour',
    icon: 'shield-checkmark-outline',
    duration: '20 min',
    lessons: [
      {
        id: 'l1-1',
        title: 'Reconnaître le phishing',
        content: 'Le phishing représente 90% des cyberattaques. Apprenez à identifier les emails frauduleux pour ne jamais tomber dans le piège.',
        tips: [
          'Vérifiez l\'adresse de l\'expéditeur (pas juste le nom)',
          'Méfiez-vous des demandes urgentes',
          'Ne cliquez jamais sur les liens suspects',
          'En cas de doute, contactez directement l\'organisme'
        ],
        quiz: {
          question: 'Un email de "support@banque-france.info" demandant vos identifiants est probablement :',
          options: ['Légitime, c\'est la Banque de France', 'Suspect, l\'adresse n\'est pas officielle', 'Normal, les banques font ça', 'Une mise à jour de sécurité'],
          correctIndex: 1,
          explanation: 'Une banque officielle n\'utiliserait pas un domaine générique. Toujours vérifier les domaines officiels.'
        }
      },
      {
        id: 'l1-2',
        title: 'Sécuriser ses réseaux sociaux',
        content: 'Les informations que vous partagez peuvent être utilisées contre vous. Apprenez à configurer vos paramètres de confidentialité.',
        tips: [
          'Rendez vos profils privés',
          'Ne partagez pas d\'informations sensibles',
          'Méfiez-vous des demandes d\'amis inconnus',
          'Vérifiez régulièrement vos paramètres de confidentialité'
        ]
      },
      {
        id: 'l1-3',
        title: 'Naviguer en sécurité',
        content: 'Internet regorge de pièges. Quelques réflexes simples vous protègent de la majorité des menaces.',
        tips: [
          'Vérifiez le cadenas HTTPS',
          'Évitez les sites de téléchargement illégaux',
          'Utilisez un bloqueur de publicités',
          'Ne téléchargez que depuis les sources officielles'
        ]
      }
    ]
  },
  {
    id: 'level2',
    level: 2,
    levelName: 'Outils de protection',
    title: 'S\'équiper pour se défendre',
    description: 'Découvrez les outils essentiels pour votre sécurité',
    icon: 'construct-outline',
    duration: '25 min',
    lessons: [
      {
        id: 'l2-1',
        title: 'Gestionnaire de mots de passe',
        content: 'Un gestionnaire de mots de passe génère et stocke des mots de passe uniques et complexes pour chaque service. Vous n\'avez plus qu\'un seul mot de passe à retenir.',
        tips: [
          'Choisissez un gestionnaire réputé (Bitwarden, 1Password)',
          'Créez un mot de passe maître très fort',
          'Activez la 2FA sur le gestionnaire',
          'Synchronisez sur tous vos appareils'
        ],
        quiz: {
          question: 'Un gestionnaire de mots de passe est :',
          options: ['Dangereux car tous les mots de passe sont au même endroit', 'Utile car il permet d\'avoir des mots de passe uniques', 'Inutile si on a une bonne mémoire', 'Réservé aux experts'],
          correctIndex: 1,
          explanation: 'Les gestionnaires utilisent un chiffrement fort. Avoir des mots de passe uniques est plus important que le risque théorique.'
        }
      },
      {
        id: 'l2-2',
        title: 'VPN : quand et comment l\'utiliser',
        content: 'Un VPN chiffre votre connexion internet et masque votre adresse IP. Indispensable sur les Wi-Fi publics.',
        tips: [
          'Utilisez un VPN sur les Wi-Fi publics',
          'Choisissez un VPN payant et réputé',
          'Vérifiez la politique de logs du fournisseur',
          'Un VPN ne vous rend pas totalement anonyme'
        ]
      },
      {
        id: 'l2-3',
        title: 'La règle de sauvegarde 3-2-1',
        content: '3 copies de vos données, sur 2 types de supports différents, dont 1 hors site. Cette règle simple vous protège de la plupart des catastrophes.',
        tips: [
          '3 copies : original + 2 sauvegardes',
          '2 supports : disque externe + cloud par exemple',
          '1 hors site : en cas d\'incendie ou cambriolage',
          'Testez régulièrement vos sauvegardes'
        ]
      }
    ]
  },
  {
    id: 'level3',
    level: 3,
    levelName: 'Concepts avancés',
    title: 'Aller plus loin',
    description: 'Comprenez les concepts utilisés par les pros',
    icon: 'rocket-outline',
    duration: '30 min',
    lessons: [
      {
        id: 'l3-1',
        title: 'Le chiffrement expliqué',
        content: 'Le chiffrement transforme vos données en un code illisible sans la clé. C\'est la base de la confidentialité numérique.',
        tips: [
          'HTTPS = chiffrement de votre navigation',
          'WhatsApp utilise le chiffrement de bout en bout',
          'Chiffrez vos disques durs (BitLocker, FileVault)',
          'Le chiffrement protège même si on vous vole vos données'
        ]
      },
      {
        id: 'l3-2',
        title: 'Zero Trust : ne faire confiance à personne',
        content: 'Le principe Zero Trust considère que toute connexion est potentiellement malveillante, même depuis l\'intérieur du réseau.',
        tips: [
          'Vérifier systématiquement l\'identité',
          'Limiter les accès au strict nécessaire',
          'Surveiller en permanence les comportements',
          'Chiffrer toutes les communications'
        ]
      }
    ]
  }
];

export const badges: Badge[] = [
  {
    id: 'first_lesson',
    name: 'Premier pas',
    description: 'Complétez votre première leçon',
    icon: 'ribbon-outline',
    requirement: '1 leçon complétée'
  },
  {
    id: 'level0_complete',
    name: 'Fondations solides',
    description: 'Terminez le niveau 0',
    icon: 'school-outline',
    requirement: 'Niveau 0 complété'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Répondez correctement à 5 quiz',
    icon: 'help-circle-outline',
    requirement: '5 bonnes réponses aux quiz'
  },
  {
    id: 'streak_3',
    name: 'Régularité',
    description: '3 jours consécutifs d\'apprentissage',
    icon: 'flame-outline',
    requirement: 'Streak de 3 jours'
  },
  {
    id: 'all_levels',
    name: 'Expert Cyber',
    description: 'Complétez tous les niveaux',
    icon: 'trophy-outline',
    requirement: 'Tous les niveaux complétés'
  }
];
