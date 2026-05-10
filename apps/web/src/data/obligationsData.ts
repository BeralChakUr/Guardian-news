// Guardian News V4.1 — Centre Opérationnel : obligations légales et réglementaires
// Source : fiches CSIRT Grand Est + RGPD (CNIL) + LPM/NIS2 (ANSSI)

export type ObligationCategory = 'legal' | 'regulatory' | 'insurance';
export type ObligationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Obligation {
  id: string;
  title: string;
  category: ObligationCategory;
  /** Délai légal en heures (ex: 72 pour la CNIL) */
  deadlineHours?: number;
  /** Conditions qui déclenchent l'obligation (au moins UNE doit matcher) */
  trigger_conditions: string[];
  description: string;
  actions: string[];
  ui_priority: ObligationPriority;
  /** Référence aux articles / sources légales */
  legal_reference?: string;
  /** Lien externe (déclaration en ligne) */
  external_link?: { label: string; url: string };
}

export const OBLIGATIONS: Obligation[] = [
  {
    id: 'complaint',
    title: 'Dépôt de plainte',
    category: 'legal',
    trigger_conditions: [
      'incident_confirmed',
      'ransomware',
      'fraud',
      'data_theft',
      'defacement',
      'account_compromise',
      'system_compromise',
      'ddos',
    ],
    description:
      "Déposer plainte permet de déclencher une enquête et de dégager la responsabilité de l'organisation en cas de propagation de l'attaque à d'autres victimes.",
    actions: [
      'Préserver les preuves (logs, captures, fichiers de rançon)',
      "Conserver la chronologie des faits (utiliser la main courante)",
      "Rassembler les captures d'écran et journaux utiles",
      'Contacter police ou gendarmerie (commissariat le plus proche)',
      'Demander un récépissé de dépôt de plainte',
    ],
    ui_priority: 'high',
    legal_reference: "Art. 323-1 et suivants du Code pénal (atteinte à un STAD)",
    external_link: {
      label: 'Service-Public — Dépôt de plainte',
      url: 'https://www.service-public.fr/particuliers/vosdroits/F1435',
    },
  },
  {
    id: 'cnil',
    title: 'Notification CNIL (RGPD)',
    category: 'regulatory',
    deadlineHours: 72,
    trigger_conditions: [
      'personal_data_impacted',
      'health_data_impacted',
      'customer_data_impacted',
      'data_exfiltration_suspected',
      'mailbox_contains_personal_data',
    ],
    description:
      "Les incidents affectant des données personnelles doivent faire l'objet d'une déclaration à la CNIL dans un délai de 72 heures. En cas de doute, une pré-déclaration peut être réalisée.",
    actions: [
      'Identifier les catégories de données personnelles concernées',
      'Déterminer si une exfiltration est confirmée ou suspectée',
      'Évaluer les risques pour les personnes concernées',
      'Préparer une pré-déclaration si le doute persiste',
      'Documenter les mesures techniques et organisationnelles prises',
      "Informer les personnes concernées si risque élevé pour leurs droits",
    ],
    ui_priority: 'critical',
    legal_reference: "RGPD Art. 33 et 34",
    external_link: {
      label: 'CNIL — Notifier une violation de données',
      url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles',
    },
  },
  {
    id: 'insurance',
    title: 'Notification assurance cyber',
    category: 'insurance',
    trigger_conditions: ['cyber_insurance_yes'],
    description:
      "Notifier votre assurance cyber permet de déclencher la prise en compte de la couverture et d'identifier les prestataires que l'assureur pourra recommander ou mandater. Les délais contractuels sont souvent courts.",
    actions: [
      "Contacter l'assureur cyber sans délai (ligne dédiée)",
      'Demander les modalités de prise en charge',
      'Identifier les prestataires agréés ou recommandés',
      'Conserver les références de dossier (numéro de sinistre)',
      'Respecter le formalisme contractuel (déclaration écrite)',
    ],
    ui_priority: 'high',
  },
  {
    id: 'anssi',
    title: 'Notification ANSSI / régulateur',
    category: 'regulatory',
    deadlineHours: 72,
    trigger_conditions: [
      'oiv',
      'ose',
      'administration',
      'classified_information',
      'specific_regulation',
      'nis2_scope',
    ],
    description:
      "Les administrations, opérateurs d'importance vitale (OIV), opérateurs de services essentiels (OSE) et entités dans le scope NIS2 ont des obligations de déclaration auprès de l'ANSSI.",
    actions: [
      "Vérifier le statut réglementaire de l'organisation (OIV / OSE / NIS2)",
      'Consulter le service juridique ou DPO',
      'Préparer les éléments techniques de l\'incident (date, vecteur, impact)',
      "Contacter l'ANSSI via le portail ou la ligne d'astreinte si applicable",
      'Documenter la décision de notifier ou non (traçabilité)',
    ],
    ui_priority: 'critical',
    legal_reference: 'LPM 2013 (OIV), Directive NIS2 (transposée FR)',
    external_link: {
      label: 'ANSSI — Signaler un incident',
      url: 'https://cyber.gouv.fr/notifications-reglementaires',
    },
  },
  {
    id: 'sector_authorities',
    title: 'Autorités sectorielles',
    category: 'regulatory',
    trigger_conditions: [
      'finance_sector',
      'health_sector',
      'regulated_sector',
      'other_specific_regulation',
    ],
    description:
      "Une organisation dans un secteur réglementé (finance, santé, énergie...) peut être soumise à des obligations de déclaration spécifiques (ACPR, ARS/CERT-Santé, CRE, etc.).",
    actions: [
      'Identifier le secteur réglementé applicable',
      'Consulter le service juridique',
      'Identifier l\'autorité compétente (ACPR, ARS, CRE, AMF...)',
      'Documenter la décision de notifier (cellule de gestion de crise)',
      'Respecter les délais sectoriels propres',
    ],
    ui_priority: 'high',
  },
];

// ─────────── Mapping réponses Qualification → trigger_conditions ───────────

import type { IncidentType } from './incidentQualificationData';

interface QualificationContext {
  /** ID de l'incident Qualification sélectionné (mail_compromise / ransomware / defacement / ddos / system_compromise) */
  incidentId?: string | null;
  /** Sévérité finale évaluée */
  severity?: 'anomalie' | 'mineur' | 'majeur' | 'crise' | null;
  /** Réponses brutes du questionnaire */
  answers: Record<string, string | string[]>;
}

/**
 * Calcule l'ensemble des trigger_conditions actives à partir
 * de l'état courant de la Qualification.
 */
export function computeActiveConditions(ctx: QualificationContext): Set<string> {
  const conds = new Set<string>();
  const a = ctx.answers ?? {};

  // Toujours déclenché si un incident est sélectionné
  if (ctx.incidentId) {
    conds.add('incident_confirmed');
  }

  // Mapping incident → condition
  switch (ctx.incidentId) {
    case 'ransomware':
      conds.add('ransomware');
      break;
    case 'mail_compromise':
      conds.add('account_compromise');
      // Si fraude au paiement détectée
      if (a.mail_payment_fraud === 'true') conds.add('fraud');
      break;
    case 'defacement':
      conds.add('defacement');
      // Si données utilisateurs exposées
      if (a.def_data_exposed === 'true') conds.add('data_theft');
      break;
    case 'ddos':
      conds.add('ddos');
      break;
    case 'system_compromise':
      conds.add('system_compromise');
      break;
  }

  // Sévérité
  if (ctx.severity === 'majeur') conds.add('incident_major');
  if (ctx.severity === 'crise') conds.add('cyber_crisis');

  // Données personnelles
  const personal = a.personal_data;
  if (personal === 'yes_basic' || personal === 'yes_sensitive') {
    conds.add('personal_data_impacted');
    conds.add('customer_data_impacted');
  }
  if (personal === 'yes_sensitive') {
    conds.add('health_data_impacted');
  }

  // Cas spécifique : compromission messagerie + données perso
  if (ctx.incidentId === 'mail_compromise' && (personal === 'yes_basic' || personal === 'yes_sensitive')) {
    conds.add('mailbox_contains_personal_data');
  }

  // Exfiltration suspectée :
  // - rançongiciel avec double extorsion
  // - défacement avec base de données exposée
  if (a.ransom_data_leak === 'true') conds.add('data_exfiltration_suspected');
  if (a.def_data_exposed === 'true') conds.add('data_exfiltration_suspected');

  // Assurance cyber
  if (a.cyber_insurance === 'true') conds.add('cyber_insurance_yes');

  // Type d'organisation
  switch (a.organization_type) {
    case 'oiv':
      conds.add('oiv');
      conds.add('ose');
      conds.add('nis2_scope');
      conds.add('regulated_sector');
      break;
    case 'public':
      conds.add('administration');
      break;
    case 'mid':
      // Les ETI peuvent rentrer dans le scope NIS2 selon le secteur
      conds.add('nis2_scope');
      break;
  }

  return conds;
}

/**
 * Calcule la sévérité finale comme dans QualificationWizard.evaluate()
 * Évite la duplication de logique : ré-utilise les rules de l'incident.
 */
export function evaluateSeverityFromAnswers(
  incident: IncidentType,
  answers: Record<string, string | string[]>
): 'anomalie' | 'mineur' | 'majeur' | 'crise' {
  const SEVERITY_ORDER: ('anomalie' | 'mineur' | 'majeur' | 'crise')[] = [
    'anomalie',
    'mineur',
    'majeur',
    'crise',
  ];
  let level: 'anomalie' | 'mineur' | 'majeur' | 'crise' = incident.severityDefault;
  let bestPriority = -1;

  for (const rule of incident.resultRules) {
    const allMatch = rule.when.every((c) => {
      const val = answers[c.questionId];
      const expected = Array.isArray(c.equals) ? c.equals : [c.equals];
      if (Array.isArray(val)) return val.some((x) => expected.includes(String(x)));
      return expected.includes(String(val ?? ''));
    });
    if (!allMatch) continue;
    if (
      rule.priority > bestPriority ||
      (rule.priority === bestPriority &&
        SEVERITY_ORDER.indexOf(rule.level) > SEVERITY_ORDER.indexOf(level))
    ) {
      bestPriority = rule.priority;
      level = rule.level;
    }
  }

  return level;
}

export const PRIORITY_STYLE: Record<
  ObligationPriority,
  { color: string; bg: string; border: string; label: string }
> = {
  critical: {
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
    label: 'Critique',
  },
  high: {
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    label: 'Élevée',
  },
  medium: {
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/40',
    label: 'Moyenne',
  },
  low: {
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    label: 'Faible',
  },
};

export const CATEGORY_LABEL: Record<ObligationCategory, string> = {
  legal: 'Pénal',
  regulatory: 'Réglementaire',
  insurance: 'Assurance',
};
