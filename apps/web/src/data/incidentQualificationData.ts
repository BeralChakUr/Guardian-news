// Guardian News V4.1 - Centre Opérationnel — Données fiches CSIRT
// Source d'inspiration : fiches réflexes CERT-FR / Cybermalveillance.gouv.fr

export type QuestionType = 'yesno' | 'choice' | 'multichoice' | 'text' | 'datetime';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: QuestionOption[];
  helpText?: string;
  required?: boolean;
  // Condition d'affichage : la question n'est posée que si la condition est vraie
  condition?: { questionId: string; equals: string | string[] };
}

export type SeverityLevel = 'anomalie' | 'mineur' | 'majeur' | 'crise';

/** Condition élémentaire : la réponse à une question doit correspondre à une valeur */
export interface RuleCondition {
  questionId: string;
  equals: string | string[];
}

export interface ResultRule {
  /**
   * Conditions cumulatives (legacy) — toutes doivent matcher.
   * Conservé pour rétrocompatibilité, équivalent à allOf.
   */
  when?: RuleCondition[];
  /** Toutes ces conditions doivent matcher (ET logique) */
  allOf?: RuleCondition[];
  /** Au moins une de ces conditions doit matcher (OU logique) */
  anyOf?: RuleCondition[];
  /** AUCUNE de ces conditions ne doit matcher (NON logique) */
  not?: RuleCondition[];
  /** Niveau résultant si la règle matche */
  level: SeverityLevel;
  /** Raisons à afficher dans "Pourquoi ce niveau ?" */
  reasons: string[];
  /** Priorité (plus élevé = niveau plus grave gagne) */
  priority: number;
  /** Identifiants d'obligations supplémentaires à déclencher (optionnel) */
  triggerObligations?: string[];
  /** Actions recommandées additionnelles (optionnel) */
  recommendedActions?: string[];
}

/** Helper : évalue une condition unique contre un set de réponses */
export function matchCondition(
  cond: RuleCondition,
  answers: Record<string, string | string[]>
): boolean {
  const val = answers[cond.questionId];
  const expected = Array.isArray(cond.equals) ? cond.equals : [cond.equals];
  if (Array.isArray(val)) return val.some((x) => expected.includes(String(x)));
  return expected.includes(String(val ?? ''));
}

/** Helper : évalue une règle complète (allOf + anyOf + not + when) */
export function evaluateRule(
  rule: ResultRule,
  answers: Record<string, string | string[]>
): boolean {
  // Legacy `when` traité comme allOf
  const allConds = [...(rule.allOf ?? []), ...(rule.when ?? [])];
  if (allConds.length > 0 && !allConds.every((c) => matchCondition(c, answers))) {
    return false;
  }
  if (rule.anyOf && rule.anyOf.length > 0 && !rule.anyOf.some((c) => matchCondition(c, answers))) {
    return false;
  }
  if (rule.not && rule.not.length > 0 && rule.not.some((c) => matchCondition(c, answers))) {
    return false;
  }
  return true;
}

export interface Obligation {
  id: string;
  label: string;
  description: string;
  /** Si défini, l'obligation se déclenche uniquement si la condition matche */
  trigger?: { questionId: string; equals: string | string[] };
  /** Délai légal en heures (ex: 72 pour CNIL) */
  deadlineHours?: number;
  authority: 'CNIL' | 'ANSSI' | 'POLICE' | 'ASSURANCE' | 'AUTRE';
}

export interface UsefulLink {
  label: string;
  url: string;
}

export interface IncidentType {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  icon: string; // nom d'une icône lucide
  severityDefault: SeverityLevel;
  symptoms: string[];
  immediateAction: string;
  situationQuestions: Question[];
  generalQuestions: Question[];
  specificQuestions: Question[];
  resultRules: ResultRule[];
  baseActions: string[];
  obligations: Obligation[];
  usefulLinks: UsefulLink[];
}

// ─────────────────── QUESTIONS COMMUNES ───────────────────

const SITUATION_QUESTIONS: Question[] = [
  {
    id: 'has_provider',
    label: 'Disposez-vous d\'un prestataire ou service informatique interne ?',
    type: 'choice',
    options: [
      { value: 'yes_internal', label: 'Oui, équipe interne' },
      { value: 'yes_external', label: 'Oui, prestataire externe' },
      { value: 'no', label: 'Non' },
    ],
    required: true,
  },
  {
    id: 'actions_taken',
    label: 'Quelles actions avez-vous déjà entreprises ?',
    type: 'multichoice',
    options: [
      { value: 'isolated', label: 'Isolé les machines concernées du réseau' },
      { value: 'changed_passwords', label: 'Changé les mots de passe' },
      { value: 'contacted_provider', label: 'Contacté un prestataire' },
      { value: 'backup_check', label: 'Vérifié les sauvegardes' },
      { value: 'none', label: 'Aucune pour le moment' },
    ],
  },
  {
    id: 'discovered_by',
    label: 'Qui a découvert l\'incident ?',
    type: 'choice',
    options: [
      { value: 'employee', label: 'Un collaborateur' },
      { value: 'it_team', label: 'Le service informatique' },
      { value: 'client', label: 'Un client / partenaire' },
      { value: 'external_alert', label: 'Une alerte externe (CERT, hébergeur…)' },
      { value: 'unknown', label: 'Indéterminé' },
    ],
    required: true,
  },
  {
    id: 'when',
    label: 'Quand l\'incident a-t-il été détecté ?',
    type: 'choice',
    options: [
      { value: 'now', label: 'En cours / il y a quelques minutes' },
      { value: 'today', label: 'Aujourd\'hui' },
      { value: 'days', label: 'Il y a quelques jours' },
      { value: 'weeks', label: 'Plus d\'une semaine' },
      { value: 'unknown', label: 'Inconnu' },
    ],
    required: true,
  },
  {
    id: 'people_impacted',
    label: 'Combien de personnes / postes sont impactés ?',
    type: 'choice',
    options: [
      { value: '1', label: '1 personne' },
      { value: 'few', label: '2 à 10 personnes' },
      { value: 'many', label: 'Plus de 10 personnes' },
      { value: 'all', label: 'Toute l\'organisation' },
    ],
    required: true,
  },
  {
    id: 'activity_state',
    label: 'État de votre activité ?',
    type: 'choice',
    options: [
      { value: 'normal', label: 'Activité normale' },
      { value: 'degraded', label: 'Activité dégradée' },
      { value: 'stopped', label: 'Activité totalement arrêtée' },
    ],
    required: true,
  },
  {
    id: 'plainte_deposee',
    label: 'Une plainte a-t-elle déjà été déposée ?',
    type: 'yesno',
    required: true,
  },
];

const GENERAL_QUESTIONS: Question[] = [
  {
    id: 'password_reuse',
    label: 'Utilisez-vous les mêmes mots de passe sur plusieurs services ?',
    type: 'yesno',
    helpText: 'La réutilisation des mots de passe aggrave la propagation d\'un incident.',
    required: true,
  },
  {
    id: 'mfa_enabled',
    label: 'Avez-vous activé l\'authentification à deux facteurs (2FA / MFA) ?',
    type: 'choice',
    options: [
      { value: 'all', label: 'Oui, sur tous les comptes critiques' },
      { value: 'partial', label: 'Sur quelques comptes seulement' },
      { value: 'no', label: 'Non' },
    ],
    required: true,
  },
  {
    id: 'password_manager',
    label: 'Utilisez-vous un gestionnaire de mots de passe ?',
    type: 'yesno',
    required: true,
  },
  {
    id: 'cyber_insurance',
    label: 'Disposez-vous d\'une assurance cyber ?',
    type: 'yesno',
    required: true,
  },
  {
    id: 'organization_type',
    label: 'Type d\'organisation ?',
    type: 'choice',
    options: [
      { value: 'individual', label: 'Particulier' },
      { value: 'small_business', label: 'TPE / PME' },
      { value: 'mid', label: 'ETI / Grande entreprise' },
      { value: 'public', label: 'Administration publique' },
      { value: 'oiv', label: 'OIV / OSE / Santé / Énergie (réglementé)' },
    ],
    required: true,
  },
  {
    id: 'personal_data',
    label: 'Des données personnelles, clientes ou de santé sont-elles concernées ?',
    type: 'choice',
    options: [
      { value: 'yes_sensitive', label: 'Oui, dont des données sensibles (santé, financières…)' },
      { value: 'yes_basic', label: 'Oui, données personnelles standard' },
      { value: 'no', label: 'Non' },
      { value: 'unknown', label: 'Inconnu / pas encore évalué' },
    ],
    required: true,
  },
];

// ─────────────────── INCIDENT 1 : COMPROMISSION MESSAGERIE ───────────────────

const INCIDENT_MAIL: IncidentType = {
  id: 'mail_compromise',
  title: 'Compromission d\'un compte de messagerie',
  shortTitle: 'Compromission messagerie',
  category: 'Compte & identité',
  icon: 'Mail',
  severityDefault: 'mineur',
  symptoms: [
    'Connexions suspectes à votre boîte mail',
    'Mails envoyés à votre insu (spam, demandes de virement…)',
    'Règles de transfert / filtres inconnus dans la messagerie',
    'Contacts qui signalent des messages étranges venant de vous',
    'Mot de passe modifié sans votre accord',
  ],
  immediateAction:
    'Changez immédiatement votre mot de passe depuis un appareil sain et activez l\'authentification à deux facteurs.',
  situationQuestions: SITUATION_QUESTIONS,
  generalQuestions: GENERAL_QUESTIONS,
  specificQuestions: [
    {
      id: 'mail_admin',
      label: 'Le compte concerné est-il un compte administrateur ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'mail_forwarding',
      label: 'Avez-vous constaté une règle de transfert / filtre suspect ?',
      type: 'yesno',
    },
    {
      id: 'mail_payment_fraud',
      label: 'Y a-t-il eu une demande de virement frauduleuse ou un paiement détourné ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'mail_other_accounts',
      label: 'Cette adresse était-elle utilisée pour réinitialiser d\'autres comptes ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'mail_recovery_changed',
      label: 'Les options de récupération (téléphone, email secondaire) ont-elles été modifiées ?',
      type: 'yesno',
    },
  ],
  baseActions: [
    'Changer le mot de passe depuis un appareil sain',
    'Activer la double authentification (MFA)',
    'Vérifier et supprimer les règles de transfert / filtres suspects',
    'Vérifier les options de récupération (téléphone, email secondaire)',
    'Examiner l\'historique des connexions et des envois',
    'Prévenir vos contacts du risque de mails frauduleux',
  ],
  resultRules: [
    {
      when: [{ questionId: 'mail_admin', equals: 'true' }],
      level: 'majeur',
      reasons: ['Compte administrateur compromis : risque de propagation à toute l\'organisation'],
      priority: 80,
    },
    {
      when: [{ questionId: 'mail_payment_fraud', equals: 'true' }],
      level: 'majeur',
      reasons: ['Fraude au paiement détectée : préjudice financier en cours'],
      priority: 75,
    },
    {
      when: [
        { questionId: 'mail_other_accounts', equals: 'true' },
        { questionId: 'password_reuse', equals: 'true' },
      ],
      level: 'majeur',
      reasons: [
        'Adresse utilisée pour la récupération d\'autres comptes',
        'Mots de passe réutilisés : risque de compromission en cascade',
      ],
      priority: 70,
    },
    {
      when: [{ questionId: 'mail_forwarding', equals: 'true' }],
      level: 'mineur',
      reasons: ['Règle de transfert suspecte : exfiltration possible mais limitée'],
      priority: 40,
    },
    {
      when: [{ questionId: 'people_impacted', equals: ['many', 'all'] }],
      level: 'majeur',
      reasons: ['Plus de 10 personnes / comptes impactés simultanément'],
      priority: 60,
    },
  ],
  obligations: [
    {
      id: 'cnil_mail',
      label: 'Notification CNIL (RGPD)',
      description:
        'Si des données personnelles ont fuité (carnet d\'adresses, contenus de mails…), une notification CNIL peut être obligatoire sous 72h.',
      trigger: { questionId: 'personal_data', equals: ['yes_sensitive', 'yes_basic'] },
      deadlineHours: 72,
      authority: 'CNIL',
    },
    {
      id: 'plainte_mail',
      label: 'Dépôt de plainte',
      description: 'Préparez un dépôt de plainte et préservez toutes les preuves (logs, captures, mails).',
      authority: 'POLICE',
    },
    {
      id: 'assurance_mail',
      label: 'Notifier l\'assurance cyber',
      description: 'Contactez votre assureur dès que possible pour respecter les délais contractuels.',
      trigger: { questionId: 'cyber_insurance', equals: 'true' },
      authority: 'ASSURANCE',
    },
    {
      id: 'anssi_mail',
      label: 'Notification autorité (ANSSI / régulateur)',
      description: 'Vérifiez vos obligations de notification (NIS2, secteur santé, finance, OIV/OSE).',
      trigger: { questionId: 'organization_type', equals: ['oiv', 'public'] },
      authority: 'ANSSI',
    },
  ],
  usefulLinks: [
    { label: 'Cybermalveillance — Piratage de compte', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/piratage-de-compte-en-ligne' },
    { label: 'CNIL — Notification de violation', url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles' },
  ],
};

// ─────────────────── INCIDENT 2 : RANÇONGICIEL ───────────────────

const INCIDENT_RANSOMWARE: IncidentType = {
  id: 'ransomware',
  title: 'Rançongiciel (ransomware)',
  shortTitle: 'Rançongiciel',
  category: 'Crise majeure',
  icon: 'Skull',
  severityDefault: 'majeur',
  symptoms: [
    'Fichiers chiffrés / extensions modifiées',
    'Message de rançon affiché à l\'écran ou dans des fichiers texte',
    'Impossibilité d\'ouvrir des documents habituels',
    'Postes ou serveurs hors service simultanément',
    'Activité anormale du réseau (trafic sortant inhabituel)',
  ],
  immediateAction:
    'Isolez immédiatement les machines du réseau (Wi-Fi + Ethernet) sans les éteindre. NE PAYEZ JAMAIS la rançon.',
  situationQuestions: SITUATION_QUESTIONS,
  generalQuestions: GENERAL_QUESTIONS,
  specificQuestions: [
    {
      id: 'ransom_visible',
      label: 'Une demande de rançon est-elle visible (note, message, lien onion) ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'ransom_servers_hit',
      label: 'Les serveurs / NAS / sauvegardes sont-ils également chiffrés ?',
      type: 'choice',
      options: [
        { value: 'all', label: 'Oui, tout est chiffré' },
        { value: 'some', label: 'Partiellement' },
        { value: 'no', label: 'Non, seulement les postes' },
        { value: 'unknown', label: 'Inconnu' },
      ],
      required: true,
    },
    {
      id: 'ransom_backups',
      label: 'Disposez-vous de sauvegardes hors-ligne / déconnectées et testées ?',
      type: 'choice',
      options: [
        { value: 'yes_tested', label: 'Oui, testées récemment' },
        { value: 'yes_untested', label: 'Oui, mais pas testées récemment' },
        { value: 'partial', label: 'Partiellement (cloud uniquement)' },
        { value: 'no', label: 'Non' },
      ],
      required: true,
    },
    {
      id: 'ransom_data_leak',
      label: 'Les attaquants menacent-ils de divulguer vos données (double extorsion) ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'ransom_propagation',
      label: 'Constatez-vous une propagation active sur le réseau (autres machines en train d\'être chiffrées) ?',
      type: 'yesno',
      required: true,
    },
  ],
  baseActions: [
    'Isoler immédiatement les machines (Wi-Fi + Ethernet) sans les éteindre',
    'NE PAS PAYER la rançon — cela ne garantit rien et finance la criminalité',
    'Préserver les preuves : photos écrans, fichiers de rançon, journaux',
    'Identifier le rançongiciel sur ID-Ransomware ou No More Ransom',
    'Contacter un prestataire de réponse à incident',
    'Réinitialiser les mots de passe critiques depuis un poste sain',
  ],
  resultRules: [
    {
      when: [{ questionId: 'ransom_propagation', equals: 'true' }],
      level: 'crise',
      reasons: ['Propagation active sur le réseau : la situation s\'aggrave en temps réel'],
      priority: 100,
    },
    {
      when: [{ questionId: 'ransom_servers_hit', equals: 'all' }],
      level: 'crise',
      reasons: ['Tous les serveurs et sauvegardes sont chiffrés : reprise d\'activité critique'],
      priority: 95,
    },
    {
      when: [{ questionId: 'activity_state', equals: 'stopped' }],
      level: 'crise',
      reasons: ['Activité totalement arrêtée par l\'attaque'],
      priority: 90,
    },
    {
      when: [{ questionId: 'ransom_data_leak', equals: 'true' }],
      level: 'majeur',
      reasons: ['Double extorsion : risque de fuite publique des données'],
      priority: 85,
    },
    {
      when: [{ questionId: 'ransom_backups', equals: 'no' }],
      level: 'crise',
      reasons: ['Aucune sauvegarde hors-ligne : reconstruction très difficile'],
      priority: 88,
    },
    {
      when: [{ questionId: 'ransom_visible', equals: 'true' }],
      level: 'majeur',
      reasons: ['Rançongiciel confirmé par la note de rançon'],
      priority: 70,
    },
  ],
  obligations: [
    {
      id: 'cnil_ransom',
      label: 'Notification CNIL (RGPD)',
      description:
        'Toute exfiltration probable de données personnelles déclenche une notification CNIL sous 72h.',
      trigger: { questionId: 'personal_data', equals: ['yes_sensitive', 'yes_basic', 'unknown'] },
      deadlineHours: 72,
      authority: 'CNIL',
    },
    {
      id: 'plainte_ransom',
      label: 'Dépôt de plainte obligatoire',
      description:
        'Conservez tous les éléments (note de rançon, échantillons chiffrés, logs) et déposez plainte au commissariat / gendarmerie.',
      authority: 'POLICE',
    },
    {
      id: 'assurance_ransom',
      label: 'Notifier l\'assurance cyber sans délai',
      description:
        'L\'assurance peut imposer des prestataires agréés et des délais courts. Contactez-les en priorité.',
      trigger: { questionId: 'cyber_insurance', equals: 'true' },
      authority: 'ASSURANCE',
    },
    {
      id: 'anssi_ransom',
      label: 'Notification ANSSI / autorité sectorielle',
      description:
        'OIV, OSE, secteur santé, NIS2 : signalement obligatoire à l\'ANSSI ou à votre régulateur.',
      trigger: { questionId: 'organization_type', equals: ['oiv', 'public'] },
      authority: 'ANSSI',
    },
  ],
  usefulLinks: [
    { label: 'Cybermalveillance — Rançongiciel', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/rancongiciels-ransomwares' },
    { label: 'No More Ransom (déchiffrement)', url: 'https://www.nomoreransom.org/fr/' },
    { label: 'ANSSI — Guide rançongiciel', url: 'https://cyber.gouv.fr/publications/attaques-par-rancongiciels-tous-concernes' },
  ],
};

// ─────────────────── INCIDENT 3 : DÉFIGURATION SITE WEB ───────────────────

const INCIDENT_DEFACEMENT: IncidentType = {
  id: 'defacement',
  title: 'Défiguration de site web',
  shortTitle: 'Défiguration',
  category: 'Site web public',
  icon: 'Globe',
  severityDefault: 'mineur',
  symptoms: [
    'Page d\'accueil remplacée par un message inhabituel',
    'Logos, images ou textes politiques / revendicatifs',
    'Redirections vers des sites externes suspects',
    'Pages inaccessibles ou contenus modifiés',
    'Alertes Google Safe Browsing sur le site',
  ],
  immediateAction:
    'Mettez le site en mode maintenance (page statique) pour limiter l\'impact image et préserver les preuves côté serveur.',
  situationQuestions: SITUATION_QUESTIONS,
  generalQuestions: GENERAL_QUESTIONS,
  specificQuestions: [
    {
      id: 'def_visible_external',
      label: 'La défiguration est-elle visible publiquement ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'def_admin_access',
      label: 'L\'accès administrateur du site est-il toujours fonctionnel ?',
      type: 'choice',
      options: [
        { value: 'yes', label: 'Oui' },
        { value: 'partial', label: 'Partiellement' },
        { value: 'no', label: 'Non, plus aucun accès' },
        { value: 'unknown', label: 'Inconnu' },
      ],
      required: true,
    },
    {
      id: 'def_cms_uptodate',
      label: 'Votre CMS / extensions sont-ils à jour ?',
      type: 'choice',
      options: [
        { value: 'yes', label: 'Oui, à jour' },
        { value: 'partial', label: 'Partiellement' },
        { value: 'no', label: 'Non, retard de mise à jour' },
        { value: 'unknown', label: 'Inconnu' },
      ],
    },
    {
      id: 'def_data_exposed',
      label: 'Le site héberge-t-il une base de données utilisateurs / clients ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'def_redirect',
      label: 'Y a-t-il des redirections vers des sites externes ?',
      type: 'yesno',
    },
    {
      id: 'def_political',
      label: 'Le contenu posté est-il politique, terroriste ou diffamatoire ?',
      type: 'yesno',
    },
  ],
  baseActions: [
    'Mettre le site en mode maintenance / page statique',
    'Préserver les logs (Apache/Nginx, FTP, base de données)',
    'Faire des captures écran horodatées des pages défigurées',
    'Réinitialiser tous les mots de passe (FTP, CMS, BDD, hébergeur)',
    'Mettre à jour le CMS et toutes les extensions',
    'Restaurer depuis une sauvegarde antérieure à la compromission',
  ],
  resultRules: [
    {
      when: [
        { questionId: 'def_data_exposed', equals: 'true' },
        { questionId: 'personal_data', equals: ['yes_sensitive', 'yes_basic'] },
      ],
      level: 'majeur',
      reasons: [
        'Site avec base utilisateurs : risque d\'exfiltration de données personnelles',
      ],
      priority: 80,
    },
    {
      when: [{ questionId: 'def_political', equals: 'true' }],
      level: 'majeur',
      reasons: ['Contenu politique / illégal : risque réputationnel et légal majeur'],
      priority: 70,
    },
    {
      when: [{ questionId: 'def_admin_access', equals: 'no' }],
      level: 'majeur',
      reasons: ['Plus aucun accès administrateur : reprise du contrôle bloquée'],
      priority: 65,
    },
    {
      when: [{ questionId: 'def_redirect', equals: 'true' }],
      level: 'majeur',
      reasons: ['Redirections externes : risque pour les visiteurs (phishing / malware)'],
      priority: 55,
    },
    {
      when: [{ questionId: 'def_visible_external', equals: 'true' }],
      level: 'mineur',
      reasons: ['Défiguration visible publiquement : impact image en cours'],
      priority: 30,
    },
  ],
  obligations: [
    {
      id: 'cnil_def',
      label: 'Notification CNIL si données exposées',
      description:
        'Si la base utilisateurs est compromise, déclencher la procédure CNIL sous 72h.',
      trigger: { questionId: 'def_data_exposed', equals: 'true' },
      deadlineHours: 72,
      authority: 'CNIL',
    },
    {
      id: 'plainte_def',
      label: 'Dépôt de plainte',
      description: 'Le délit d\'atteinte à un STAD est punissable. Conservez les preuves et déposez plainte.',
      authority: 'POLICE',
    },
    {
      id: 'assurance_def',
      label: 'Notifier l\'assurance cyber',
      description: 'Couverture possible pour la remise en service et la perte d\'image.',
      trigger: { questionId: 'cyber_insurance', equals: 'true' },
      authority: 'ASSURANCE',
    },
    {
      id: 'anssi_def',
      label: 'Notification ANSSI / régulateur',
      description: 'Pour les sites publics ou OIV/OSE, prévenir l\'ANSSI ou votre régulateur sectoriel.',
      trigger: { questionId: 'organization_type', equals: ['oiv', 'public'] },
      authority: 'ANSSI',
    },
  ],
  usefulLinks: [
    { label: 'Cybermalveillance — Défiguration', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/defacement-defiguration-site-internet' },
  ],
};

// ─────────────────── INCIDENT 4 : DÉNI DE SERVICE / DDoS ───────────────────

const INCIDENT_DDOS: IncidentType = {
  id: 'ddos',
  title: 'Déni de service réseau (DDoS)',
  shortTitle: 'Déni de service',
  category: 'Disponibilité',
  icon: 'Activity',
  severityDefault: 'mineur',
  symptoms: [
    'Sites ou services lents ou inaccessibles',
    'Pic de trafic anormal sur un service exposé',
    'Erreurs HTTP 5xx en masse',
    'Saturation du lien Internet ou du pare-feu',
    'Alertes du FAI ou de l\'hébergeur',
  ],
  immediateAction:
    "Identifiez le service impacté et contactez votre FAI / hébergeur / CDN pour activer les protections anti-DDoS. Préservez les logs.",
  situationQuestions: SITUATION_QUESTIONS,
  generalQuestions: GENERAL_QUESTIONS,
  specificQuestions: [
    {
      id: 'ddos_active',
      label: 'L\'attaque est-elle toujours en cours ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'ddos_target',
      label: 'Quel(s) service(s) sont impactés ?',
      type: 'choice',
      options: [
        { value: 'web', label: 'Site web / application web' },
        { value: 'api', label: 'API / services backend' },
        { value: 'dns', label: 'DNS' },
        { value: 'network', label: 'Réseau / lien Internet entier' },
        { value: 'multi', label: 'Plusieurs services simultanément' },
      ],
      required: true,
    },
    {
      id: 'ddos_volume',
      label: 'Volume estimé de l\'attaque ?',
      type: 'choice',
      options: [
        { value: 'low', label: 'Faible — service ralenti' },
        { value: 'medium', label: 'Important — service partiellement indispo' },
        { value: 'saturating', label: 'Saturant — service totalement KO' },
        { value: 'unknown', label: 'Inconnu / pas de visibilité' },
      ],
      required: true,
    },
    {
      id: 'ddos_protection',
      label: 'Disposez-vous d\'une protection anti-DDoS ?',
      type: 'choice',
      options: [
        { value: 'yes_active', label: 'Oui, déjà active' },
        { value: 'yes_dormant', label: 'Oui mais non activée' },
        { value: 'no', label: 'Non' },
        { value: 'unknown', label: 'Inconnu' },
      ],
    },
    {
      id: 'ddos_provider_contacted',
      label: 'FAI / hébergeur / CDN ont-ils été contactés ?',
      type: 'yesno',
    },
  ],
  baseActions: [
    'Contacter immédiatement FAI / hébergeur / CDN',
    'Activer les protections anti-DDoS si dormantes',
    'Identifier les discriminants (IP sources, user-agents, signatures)',
    'Mettre en place rate limiting / traffic shaping',
    'Préserver les logs (pare-feu, WAF, accès web, métriques réseau)',
    'Communiquer aux utilisateurs sur l\'indisponibilité',
  ],
  resultRules: [
    {
      when: [{ questionId: 'ddos_volume', equals: 'saturating' }, { questionId: 'activity_state', equals: 'stopped' }],
      level: 'crise',
      reasons: ['Activité totalement arrêtée par l\'attaque DDoS'],
      priority: 95,
    },
    {
      when: [{ questionId: 'ddos_volume', equals: 'saturating' }],
      level: 'majeur',
      reasons: ['Volume saturant : service complètement indisponible'],
      priority: 80,
    },
    {
      when: [{ questionId: 'ddos_target', equals: 'network' }],
      level: 'majeur',
      reasons: ['Lien Internet entier impacté : tous les services dégradés'],
      priority: 75,
    },
    {
      when: [{ questionId: 'ddos_target', equals: 'multi' }],
      level: 'majeur',
      reasons: ['Plusieurs services impactés simultanément'],
      priority: 70,
    },
    {
      when: [{ questionId: 'ddos_active', equals: 'true' }],
      level: 'mineur',
      reasons: ['Attaque DDoS active — surveillance continue requise'],
      priority: 30,
    },
  ],
  obligations: [
    {
      id: 'plainte_ddos',
      label: 'Dépôt de plainte',
      description:
        'Le déni de service constitue une atteinte à un STAD (art. 323-2 du Code pénal). Conservez les preuves et déposez plainte.',
      authority: 'POLICE',
    },
    {
      id: 'assurance_ddos',
      label: 'Notifier l\'assurance cyber',
      description: 'Les pertes liées à l\'indisponibilité peuvent être couvertes (perte d\'exploitation).',
      trigger: { questionId: 'cyber_insurance', equals: 'true' },
      authority: 'ASSURANCE',
    },
    {
      id: 'anssi_ddos',
      label: 'Notification ANSSI / régulateur',
      description: 'OIV/OSE/NIS2 : signalement obligatoire si impact significatif sur la continuité de service.',
      trigger: { questionId: 'organization_type', equals: ['oiv', 'public'] },
      authority: 'ANSSI',
    },
  ],
  usefulLinks: [
    { label: 'Cybermalveillance — DDoS', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/deni-de-service' },
    { label: 'ANSSI — Guide DDoS', url: 'https://cyber.gouv.fr/publications/comprendre-et-anticiper-les-attaques-ddos' },
  ],
};

// ─────────────────── INCIDENT 5 : COMPROMISSION SYSTÈME ───────────────────

const INCIDENT_SYSTEM: IncidentType = {
  id: 'system_compromise',
  title: 'Compromission d\'un système / serveur',
  shortTitle: 'Compromission système',
  category: 'Compromission',
  icon: 'Server',
  severityDefault: 'majeur',
  symptoms: [
    'Activité réseau anormale sortante depuis un serveur',
    'Processus inconnus ou EDR/AV en alerte',
    'Modifications de fichiers système ou de tâches planifiées',
    'Comptes inconnus ou élévation de privilèges',
    'Logs effacés ou chiffrés',
  ],
  immediateAction:
    "Isolez la machine du réseau (sans l'éteindre brutalement) pour préserver la mémoire. N'ouvrez PAS de session interactive avec un compte privilégié.",
  situationQuestions: SITUATION_QUESTIONS,
  generalQuestions: GENERAL_QUESTIONS,
  specificQuestions: [
    {
      id: 'sys_critical_role',
      label: 'La machine compromise a-t-elle un rôle critique ?',
      type: 'choice',
      options: [
        { value: 'dc', label: 'Contrôleur de domaine (AD)' },
        { value: 'critical_server', label: 'Serveur applicatif critique' },
        { value: 'workstation', label: 'Poste utilisateur' },
        { value: 'unknown', label: 'Indéterminé' },
      ],
      required: true,
    },
    {
      id: 'sys_admin_compromised',
      label: 'Un compte à privilèges (admin local, admin domaine) est-il suspecté compromis ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'sys_lateral',
      label: 'Avez-vous observé des mouvements latéraux ou d\'autres machines impactées ?',
      type: 'yesno',
      required: true,
    },
    {
      id: 'sys_persistence',
      label: 'Des mécanismes de persistance ont-ils été identifiés (services, tâches, registres) ?',
      type: 'yesno',
    },
    {
      id: 'sys_data_access',
      label: 'Des données sensibles sont-elles accessibles depuis cette machine ?',
      type: 'choice',
      options: [
        { value: 'yes_critical', label: 'Oui, données critiques (BDD, secrets, RH...)' },
        { value: 'yes_standard', label: 'Oui, données standard' },
        { value: 'no', label: 'Non' },
        { value: 'unknown', label: 'Inconnu' },
      ],
      required: true,
    },
    {
      id: 'sys_logs_preserved',
      label: 'Les journaux de la machine sont-ils intacts ?',
      type: 'choice',
      options: [
        { value: 'yes', label: 'Oui' },
        { value: 'partial', label: 'Partiellement' },
        { value: 'wiped', label: 'Effacés ou inaccessibles' },
        { value: 'unknown', label: 'Inconnu' },
      ],
    },
  ],
  baseActions: [
    'Isoler la machine compromise sans l\'éteindre brutalement',
    'NE PAS ouvrir de session interactive locale, RDP ou SSH avec un compte privilégié',
    'Préserver la mémoire (snapshot VM ou hibernation Windows)',
    'Identifier les comptes à privilèges utilisés récemment et les désactiver',
    'Réinitialiser les mots de passe / clés / certificats présents sur la machine',
    'Préserver les journaux (pare-feu, EDR, antivirus, AD)',
    'Vérifier les sauvegardes et leur intégrité',
  ],
  resultRules: [
    {
      when: [{ questionId: 'sys_critical_role', equals: 'dc' }],
      level: 'crise',
      reasons: ['Contrôleur de domaine compromis : risque de propagation à tout le SI'],
      priority: 100,
    },
    {
      when: [{ questionId: 'sys_lateral', equals: 'true' }],
      level: 'crise',
      reasons: ['Mouvements latéraux confirmés : compromission étendue'],
      priority: 95,
    },
    {
      when: [{ questionId: 'sys_admin_compromised', equals: 'true' }],
      level: 'majeur',
      reasons: ['Compte à privilèges compromis : risque d\'escalade'],
      priority: 85,
    },
    {
      when: [{ questionId: 'sys_data_access', equals: 'yes_critical' }],
      level: 'majeur',
      reasons: ['Données critiques accessibles depuis la machine compromise'],
      priority: 80,
    },
    {
      when: [{ questionId: 'sys_logs_preserved', equals: 'wiped' }],
      level: 'majeur',
      reasons: ['Logs effacés : posture défensive sérieusement compromise'],
      priority: 75,
    },
    {
      when: [{ questionId: 'sys_critical_role', equals: 'critical_server' }],
      level: 'majeur',
      reasons: ['Serveur critique compromis : impact métier potentiel important'],
      priority: 70,
    },
  ],
  obligations: [
    {
      id: 'cnil_sys',
      label: 'Notification CNIL (RGPD)',
      description: 'Si des données personnelles sont accessibles depuis la machine compromise, déclencher la procédure CNIL sous 72h.',
      trigger: { questionId: 'sys_data_access', equals: ['yes_critical', 'yes_standard'] },
      deadlineHours: 72,
      authority: 'CNIL',
    },
    {
      id: 'plainte_sys',
      label: 'Dépôt de plainte',
      description: 'Atteinte à un STAD. Conservez les preuves (snapshots, logs) et déposez plainte.',
      authority: 'POLICE',
    },
    {
      id: 'assurance_sys',
      label: 'Notifier l\'assurance cyber',
      description: 'Couverture possible pour la réponse à incident et la remédiation.',
      trigger: { questionId: 'cyber_insurance', equals: 'true' },
      authority: 'ASSURANCE',
    },
    {
      id: 'anssi_sys',
      label: 'Notification ANSSI / régulateur',
      description: 'OIV/OSE/NIS2 : signalement obligatoire en cas de compromission significative.',
      trigger: { questionId: 'organization_type', equals: ['oiv', 'public'] },
      authority: 'ANSSI',
    },
  ],
  usefulLinks: [
    { label: 'Cybermalveillance — Intrusion système', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/intrusion-systeme-information' },
    { label: 'ANSSI — Réponse aux incidents', url: 'https://cyber.gouv.fr/publications/cybersecurite-faire-face-la-menace' },
  ],
};

export const INCIDENTS: IncidentType[] = [INCIDENT_MAIL, INCIDENT_RANSOMWARE, INCIDENT_DEFACEMENT, INCIDENT_DDOS, INCIDENT_SYSTEM];

export const SEVERITY_META: Record<SeverityLevel, { label: string; color: string; bg: string; border: string; description: string }> = {
  anomalie: {
    label: 'Anomalie courante',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Évènement isolé, traitement standard suffisant.',
  },
  mineur: {
    label: 'Incident mineur',
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    description: 'Impact limité, traitable en interne avec procédures standards.',
  },
  majeur: {
    label: 'Incident majeur',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    description: 'Impact significatif. Mobilisation de ressources et obligations à activer.',
  },
  crise: {
    label: 'Crise cyber',
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Crise. Activité menacée. Cellule de crise + prestataire externe + autorités.',
  },
};
