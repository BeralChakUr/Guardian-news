// Guardian News V4.1 — Centre Opérationnel : playbooks d'endiguement
// Inspiré des fiches CSIRT Grand Est / InterCERT-FR / ANSSI

export type ContainmentSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface PriorityActionGroup {
  priority: number;
  title: string;
  actions: string[];
  impact_warning?: string;
  warning?: string;
  category: string;
}

export interface ContainmentPlaybook {
  incident_type: string;
  title: string;
  severity: ContainmentSeverity;
  objective: string;
  priority_actions: PriorityActionGroup[];
}

// Mapping IDs Qualification → IDs Endiguement
export const QUALIFICATION_TO_CONTAINMENT: Record<string, string> = {
  mail_compromise: 'mail_account_compromise',
  ransomware: 'ransomware',
  defacement: 'website_defacement',
};

// ─────────────────── 1. RANSOMWARE / CHIFFREMENT ───────────────────

const PB_RANSOMWARE: ContainmentPlaybook = {
  incident_type: 'ransomware',
  title: 'Chiffrement ou effacement en cours',
  severity: 'critical',
  objective:
    "Circonscrire l'attaque, limiter son extension, préserver les sauvegardes et donner du temps aux défenseurs.",
  priority_actions: [
    {
      priority: 1,
      title: "Isoler temporairement d'Internet",
      actions: [
        'Désactiver les flux entrants Internet vers les zones internes',
        'Désactiver les flux sortants Internet depuis les zones internes',
        'Désactiver les accès VPN depuis Internet',
        "Vérifier l'isolation par des tests simples",
      ],
      impact_warning:
        'Cette action peut perturber les services essentiels, les télémaintenances, les mises à jour et les accès cloud.',
      category: 'containment',
    },
    {
      priority: 1,
      title: 'Préserver les sauvegardes',
      actions: [
        'Identifier les solutions de sauvegarde',
        'Identifier les serveurs de gestion des sauvegardes',
        'Mettre en pause ou éteindre les serveurs de sauvegarde si nécessaire',
        'Isoler ou éteindre les supports de stockage accessibles depuis le réseau',
      ],
      impact_warning:
        'Ne pas restaurer les sauvegardes avant analyse. Les sauvegardes sont essentielles pour la reprise.',
      category: 'backup',
    },
    {
      priority: 1,
      title: 'Isoler les machines infectées',
      actions: [
        'Mettre en pause les machines virtuelles infectées',
        'Mettre en veille prolongée les machines physiques Windows si possible',
        'Débrancher le câble réseau ou désactiver le Wi-Fi',
        "Éviter autant que possible l'extinction brutale afin de préserver la mémoire",
      ],
      category: 'isolation',
    },
    {
      priority: 2,
      title: 'Préserver un contrôleur de domaine',
      actions: [
        'Identifier les contrôleurs de domaine',
        'Préserver au moins un contrôleur de domaine sain si possible',
        'Limiter les actions risquées sur Active Directory sans expertise',
      ],
      category: 'identity',
    },
    {
      priority: 3,
      title: 'Entraver la propagation',
      actions: [
        'Neutraliser les comptes à privilèges suspectés compromis',
        'Créer si nécessaire un compte administrateur de domaine bris de glace',
        'Réinitialiser les comptes à privilèges avec prudence',
        'Inspecter SYSVOL, GPO, scripts et tâches planifiées',
      ],
      impact_warning:
        'Ces actions peuvent avoir de forts impacts en production. À piloter avec prudence.',
      category: 'propagation',
    },
    {
      priority: 4,
      title: 'Préserver les traces',
      actions: [
        'Exporter les journaux disponibles',
        'Tracer toutes les actions dans la main courante',
        'Préserver les machines et supports utiles aux investigations',
      ],
      category: 'evidence',
    },
  ],
};

// ─────────────────── 2. COMPROMISSION MESSAGERIE ───────────────────

const PB_MAIL: ContainmentPlaybook = {
  incident_type: 'mail_account_compromise',
  title: "Compromission d'un compte de messagerie",
  severity: 'high',
  objective:
    "Reprendre le contrôle du compte compromis, supprimer les accès illégitimes et limiter l'extension de la compromission.",
  priority_actions: [
    {
      priority: 1,
      title: 'Reprendre le contrôle du compte compromis',
      actions: [
        'Bloquer temporairement le compte si nécessaire',
        'Forcer la réinitialisation du mot de passe',
        'Révoquer les sessions actives et les tokens',
        'Forcer le réenregistrement du MFA',
        'Activer le MFA si absent',
      ],
      category: 'account_control',
    },
    {
      priority: 1,
      title: 'Nettoyer les persistances',
      actions: [
        'Supprimer les règles de transfert automatique',
        'Supprimer les règles de suppression ou lecture automatique',
        'Supprimer les délégations illégitimes',
        'Vérifier les applications tierces ou plugins suspects',
        'Supprimer les MFA ajoutés illégitimement',
      ],
      category: 'persistence_cleanup',
    },
    {
      priority: 2,
      title: "Protéger les autres accès de l'utilisateur",
      actions: [
        'Réinitialiser les mots de passe des autres applications',
        'Révoquer les sessions sur les services exposés',
        "Ne pas oublier VPN, accès distants, SharePoint, Teams ou applications métier",
      ],
      category: 'access_control',
    },
    {
      priority: 2,
      title: 'Protéger le poste utilisateur',
      actions: [
        'Vérifier si un infostealer est suspecté',
        'Analyser les alertes antivirus ou EDR',
        'Faire une analyse complète du poste si nécessaire',
        'Réinstaller le poste en cas de doute fort',
      ],
      category: 'endpoint',
    },
    {
      priority: 3,
      title: 'Limiter la propagation',
      actions: [
        'Analyser les mails frauduleux envoyés',
        'Identifier les destinataires internes et externes',
        'Bloquer les URL, pièces jointes ou expéditeurs malveillants',
        'Alerter les personnes ciblées si nécessaire',
      ],
      category: 'propagation',
    },
    {
      priority: 3,
      title: 'Préserver les traces',
      actions: [
        'Exporter les journaux du compte compromis',
        'Augmenter la rétention des journaux si possible',
        'Conserver les IP, horaires, user-agents et événements MFA',
      ],
      category: 'evidence',
    },
  ],
};

// ─────────────────── 3. DÉFACEMENT WEB ───────────────────

const PB_DEFACEMENT: ContainmentPlaybook = {
  incident_type: 'website_defacement',
  title: 'Défacement de site web',
  severity: 'high',
  objective:
    "Figer la situation, préserver l'image de l'organisation, reprendre le contrôle et préserver les traces.",
  priority_actions: [
    {
      priority: 1,
      title: 'Mettre hors-ligne le site web',
      actions: [
        'Mettre le site en mode maintenance si possible',
        'Sinon arrêter le service web',
        "Désactiver les flux entrants Internet vers le serveur hôte",
        "Désactiver les flux sortants depuis le serveur hôte",
        'Maintenir un accès administratif contrôlé',
      ],
      category: 'containment',
    },
    {
      priority: 1,
      title: "Reprendre le contrôle de l'administration",
      actions: [
        'Identifier les interfaces de gestion exposées',
        'Réinitialiser les comptes administratifs',
        'Configurer le MFA',
        'Révoquer les sessions actives et jetons',
        "Supprimer les comptes ou moyens d'accès illégitimes",
      ],
      category: 'admin_control',
    },
    {
      priority: 1,
      title: 'Préserver les traces',
      actions: [
        'Sauvegarder les journaux web',
        'Sauvegarder les journaux système',
        'Préserver les fichiers modifiés',
        'Tracer les actions dans la main courante',
      ],
      category: 'evidence',
    },
    {
      priority: 2,
      title: 'Préserver le contenu du site affecté',
      actions: [
        'Déplacer le contenu affecté dans un dossier INCIDENT',
        "Ne pas écraser les fichiers altérés avant investigation",
        'Préserver la base de données si concernée',
      ],
      category: 'preservation',
    },
    {
      priority: 2,
      title: 'Mettre en ligne une version statique',
      actions: [
        'Créer une page de maintenance ou une version statique',
        'Désactiver les composants dynamiques inutiles',
        'Purger le cache CDN ou reverse-proxy si nécessaire',
      ],
      category: 'business_continuity',
    },
    {
      priority: 3,
      title: 'Communiquer',
      actions: [
        'Préparer une communication publique si nécessaire',
        "Désapprouver l'affichage illégitime",
        'Informer la direction et les équipes concernées',
      ],
      category: 'communication',
    },
    {
      priority: 4,
      title: 'Limiter les impacts liés aux données sensibles',
      actions: [
        'Identifier les données sensibles potentiellement accessibles',
        'Vérifier les accès en lecture, écriture ou suppression',
        'Informer les responsables de données',
        "Déclencher l'analyse CNIL si données personnelles concernées",
      ],
      category: 'data_protection',
    },
  ],
};

// ─────────────────── 4. DDoS ───────────────────

const PB_DDOS: ContainmentPlaybook = {
  incident_type: 'ddos',
  title: 'Déni de service réseau',
  severity: 'high',
  objective:
    "Limiter l'impact d'un déni de service, réduire le trafic malveillant et préserver les traces.",
  priority_actions: [
    {
      priority: 1,
      title: "Déterminer le périmètre et l'ordre des actions",
      actions: [
        'Identifier les services indisponibles ou ralentis',
        'Identifier les composants défaillants',
        'Commencer par les éléments en amont du composant défaillant',
        'Appliquer les actions une par une pour mesurer leur efficacité',
      ],
      category: 'triage',
    },
    {
      priority: 2,
      title: 'Limiter le trafic avec le FAI',
      actions: [
        'Contacter le support technique du FAI',
        'Demander de la visibilité sur le trafic',
        'Bloquer les requêtes selon les discriminants identifiés',
        'Activer le service anti-DDoS du FAI si disponible',
      ],
      category: 'isp',
    },
    {
      priority: 2,
      title: 'Activer les protections externes',
      actions: [
        'Activer un service anti-DDoS externe si disponible',
        "Activer le CDN si l'attaque est applicative",
        'Ajuster les règles selon les sources, user-agents ou signatures observées',
      ],
      category: 'external_protection',
    },
    {
      priority: 2,
      title: 'Agir sur le DNS si concerné',
      actions: [
        'Filtrer les requêtes DNS malformées',
        'Désactiver les fonctions inutiles exposées',
        'Vérifier le rôle récursif et les transferts de zone',
      ],
      category: 'dns',
    },
    {
      priority: 3,
      title: "Agir chez l'hébergeur",
      actions: [
        "Activer le service anti-DDoS de l'hébergeur",
        'Mettre à jour les règles de filtrage',
        'Limiter les services et protocoles exposés',
        'Mettre en place rate limiting ou traffic shaping si possible',
      ],
      category: 'hosting',
    },
    {
      priority: 4,
      title: 'Agir sur les composants tiers',
      actions: [
        'Identifier les services tiers impactés',
        'Contacter les fournisseurs concernés',
        "Vérifier CDN, DNS, services d'identité et composants externes",
      ],
      category: 'third_party',
    },
    {
      priority: 5,
      title: 'Préserver les traces',
      actions: [
        'Exporter les journaux des équipements',
        'Conserver les métriques réseau',
        'Conserver les IP sources, user-agents, ports et protocoles',
        'Tracer les actions dans la main courante',
      ],
      category: 'evidence',
    },
  ],
};

// ─────────────────── 5. COMPROMISSION SYSTÈME ───────────────────

const PB_SYSTEM: ContainmentPlaybook = {
  incident_type: 'system_compromise',
  title: 'Compromission système',
  severity: 'high',
  objective:
    "Limiter l'extension de la compromission, préserver les biens essentiels et préserver les traces.",
  priority_actions: [
    {
      priority: 1,
      title: 'Figer la situation',
      actions: [
        'Mettre en pause la machine virtuelle compromise si possible',
        'Mettre en veille prolongée la machine physique si possible',
        'Déconnecter la machine du réseau si nécessaire',
        "Préférer l'isolation via EDR ou configuration réseau",
        "Éviter l'extinction brutale sauf dernier recours",
      ],
      warning:
        "Éviter d'ouvrir une session interactive locale, RDP ou SSH sur une machine suspectée compromise, surtout avec un compte privilégié.",
      category: 'containment',
    },
    {
      priority: 2,
      title: 'Sécuriser des sauvegardes à jour',
      actions: [
        "Vérifier l'existence de sauvegardes récentes",
        'Identifier les données accessibles depuis la machine compromise',
        "Préserver les sauvegardes utiles à la reprise et à l'investigation",
      ],
      category: 'backup',
    },
    {
      priority: 2,
      title: 'Préserver les traces sur les machines infectées',
      actions: [
        'Prendre un instantané si machine virtuelle',
        "Exporter l'instantané sur un support hors ligne",
        "Préserver les éléments utiles à l'investigation",
      ],
      category: 'evidence',
    },
    {
      priority: 3,
      title: 'Réinitialiser les identifiants suspectés compromis',
      actions: [
        'Désactiver les comptes utilisés récemment sur la machine compromise',
        'Réinitialiser les comptes administrateurs suspectés compromis',
        'Révoquer les sessions associées',
        'Révoquer les certificats, clés SSH, tokens ou clés API présents sur la machine',
      ],
      category: 'identity',
    },
    {
      priority: 3,
      title: 'Préserver les journaux',
      actions: [
        'Identifier les journaux pare-feu, VPN, proxy, EDR, antivirus',
        'Exporter les journaux historiques',
        'Augmenter la rétention si possible',
        "Préserver les journaux d'authentification",
      ],
      category: 'logs',
    },
  ],
};

export const CONTAINMENT_PLAYBOOKS: ContainmentPlaybook[] = [
  PB_RANSOMWARE,
  PB_MAIL,
  PB_DEFACEMENT,
  PB_DDOS,
  PB_SYSTEM,
];

export const CONTAINMENT_BY_ID: Record<string, ContainmentPlaybook> = Object.fromEntries(
  CONTAINMENT_PLAYBOOKS.map((p) => [p.incident_type, p])
);

// Métadonnées des catégories d'actions (pour l'UI)
export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  containment: { label: 'Endiguement', color: 'cyan' },
  backup: { label: 'Sauvegardes', color: 'blue' },
  isolation: { label: 'Isolation', color: 'orange' },
  identity: { label: 'Identité / AD', color: 'purple' },
  propagation: { label: 'Propagation', color: 'red' },
  evidence: { label: 'Preuves', color: 'amber' },
  account_control: { label: 'Contrôle compte', color: 'cyan' },
  persistence_cleanup: { label: 'Nettoyage', color: 'pink' },
  access_control: { label: 'Accès', color: 'blue' },
  endpoint: { label: 'Poste utilisateur', color: 'orange' },
  admin_control: { label: 'Administration', color: 'purple' },
  preservation: { label: 'Préservation', color: 'amber' },
  business_continuity: { label: 'Continuité', color: 'green' },
  communication: { label: 'Communication', color: 'pink' },
  data_protection: { label: 'Protection données', color: 'red' },
  triage: { label: 'Triage', color: 'cyan' },
  isp: { label: 'FAI', color: 'blue' },
  external_protection: { label: 'Protection externe', color: 'green' },
  dns: { label: 'DNS', color: 'purple' },
  hosting: { label: 'Hébergement', color: 'orange' },
  third_party: { label: 'Tiers', color: 'amber' },
  logs: { label: 'Journaux', color: 'amber' },
};

export const SEVERITY_LABEL: Record<ContainmentSeverity, string> = {
  critical: 'Critique',
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible',
};
