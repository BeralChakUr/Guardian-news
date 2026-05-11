import { Phone, Globe, Mail, ExternalLink, ShieldAlert, Building2, Briefcase, Scale } from 'lucide-react';

interface ContactCard {
  id: string;
  name: string;
  role: string;
  icon: typeof Phone;
  color: 'cyan' | 'red' | 'orange' | 'purple' | 'emerald' | 'blue';
  phone?: string;
  email?: string;
  url?: string;
  description: string;
  availability?: string;
}

const CONTACTS: ContactCard[] = [
  {
    id: 'cybermalveillance',
    name: 'Cybermalveillance.gouv.fr',
    role: 'Assistance victimes (TPE/PME/Particuliers)',
    icon: ShieldAlert,
    color: 'cyan',
    url: 'https://www.cybermalveillance.gouv.fr/diagnostic',
    description:
      "Diagnostic en ligne gratuit, mise en relation avec un prestataire de proximité référencé, conseils opérationnels.",
    availability: 'Plateforme 24/7',
  },
  {
    id: 'cert-fr',
    name: 'CERT-FR (ANSSI)',
    role: "Réponse incident — État, OIV, OSE, NIS2",
    icon: Building2,
    color: 'purple',
    phone: '+33 (0)1 71 75 84 50',
    email: 'cert-fr.cossi@ssi.gouv.fr',
    url: 'https://www.cert.ssi.gouv.fr/contact/',
    description:
      "Centre gouvernemental de veille, d'alerte et de réponse aux attaques informatiques. Couvre administrations, OIV, OSE.",
    availability: 'Astreinte 24/7',
  },
  {
    id: 'csirt-regional',
    name: 'CSIRT régional / sectoriel',
    role: 'TPE/PME/ETI/Collectivités',
    icon: Briefcase,
    color: 'blue',
    url: 'https://www.cert.ssi.gouv.fr/csirt/csirt-regionaux/',
    description:
      "Centres CSIRT déployés en région (Grand Est, AURA, Île-de-France, etc.) — assistance gratuite pour les structures éligibles. Trouvez votre CSIRT.",
    availability: 'Heures ouvrables',
  },
  {
    id: 'cnil',
    name: 'CNIL',
    role: 'Autorité de protection des données',
    icon: Scale,
    color: 'red',
    phone: '+33 (0)1 53 73 22 22',
    url: 'https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles',
    description:
      "Notification obligatoire en cas de violation de données personnelles (RGPD Art. 33). Délai légal de 72 heures.",
    availability: 'Téléservice en ligne 24/7',
  },
  {
    id: 'police',
    name: 'Police / Gendarmerie',
    role: 'Dépôt de plainte cybercriminalité',
    icon: Phone,
    color: 'red',
    phone: '17 (urgence) — 0 805 805 817 (Info Escroqueries)',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F1435',
    description:
      "Dépôt de plainte en commissariat ou à la gendarmerie. Demandez un récépissé. Préservez les preuves au préalable.",
  },
  {
    id: 'pre-plainte',
    name: 'Pré-plainte en ligne',
    role: 'Démarche dématérialisée',
    icon: Globe,
    color: 'orange',
    url: 'https://www.pre-plainte-en-ligne.gouv.fr/',
    description:
      "Effectuez une pré-plainte en ligne (atteinte aux biens dont auteur inconnu) puis prenez rendez-vous pour la finaliser.",
  },
  {
    id: 'thesee',
    name: 'THESEE (en ligne)',
    role: 'Plainte cybercriminalité grand public',
    icon: Globe,
    color: 'orange',
    url: 'https://www.service-public.fr/particuliers/vosdroits/R56288',
    description:
      "Plateforme en ligne pour porter plainte directement en cas d'arnaque ou de cyber-escroquerie (phishing, fraude...).",
  },
  {
    id: 'assurance',
    name: 'Assurance cyber',
    role: 'Notification sinistre',
    icon: Briefcase,
    color: 'emerald',
    description:
      "Contactez sans délai votre assureur via la ligne dédiée du contrat. Les délais contractuels sont souvent courts (24-48h).",
  },
  {
    id: 'orange-cyberdefense',
    name: 'Prestataires PRIS',
    role: 'Prestataires Réponse aux Incidents (qualifiés ANSSI)',
    icon: ShieldAlert,
    color: 'purple',
    url: 'https://cyber.gouv.fr/produits-services-qualifies?filter=PRIS',
    description:
      "Liste des prestataires qualifiés ANSSI pour la réponse aux incidents. Mandatables directement ou via votre assureur.",
  },
  {
    id: 'inhesi-info-escroquerie',
    name: 'Info Escroqueries',
    role: 'Numéro public escroqueries',
    icon: Phone,
    color: 'blue',
    phone: '0 805 805 817',
    description: 'Service gratuit du Ministère de l\'Intérieur — conseils, orientation, prise de plainte par téléphone.',
    availability: 'Lun-Ven 9h-18h30',
  },
];

const COLOR_STYLES: Record<ContactCard['color'], { bg: string; text: string; border: string }> = {
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-300', border: 'border-red-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-300', border: 'border-orange-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-300', border: 'border-blue-500/30' },
};

export default function AssistanceTab() {
  return (
    <div className="space-y-4" data-testid="assistance-tab">
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">Assistance & contacts utiles</h2>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Annuaire opérationnel des autorités et prestataires à contacter en cas d'incident cyber.
              Vérifiez systématiquement la disponibilité et les délais contractuels.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CONTACTS.map((c) => {
          const Icon = c.icon;
          const sty = COLOR_STYLES[c.color];
          return (
            <div
              key={c.id}
              className={`rounded-2xl border ${sty.border} ${sty.bg} backdrop-blur-sm p-4`}
              data-testid={`contact-${c.id}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`rounded-lg ${sty.bg} ${sty.text} p-2 shrink-0 border ${sty.border}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white leading-snug">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{c.role}</p>
                </div>
                {c.availability && (
                  <span className="text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 shrink-0 font-bold">
                    {c.availability}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">{c.description}</p>

              <div className="space-y-1.5">
                {c.phone && (
                  <a
                    href={`tel:${c.phone.replace(/[^+\d]/g, '')}`}
                    className="flex items-center gap-2 text-sm text-white hover:text-cyan-300 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-mono">{c.phone}</span>
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-sm text-white hover:text-cyan-300 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-mono break-all">{c.email}</span>
                  </a>
                )}
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded-lg ${sty.bg} ${sty.text} border ${sty.border} px-2.5 py-1 text-xs font-bold mt-1.5 hover:opacity-80 transition-opacity`}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Site officiel
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3 text-xs text-slate-400 leading-relaxed">
        💡 <strong>Bon réflexe</strong> — préparez en amont (avant tout incident) un mémo papier des
        contacts critiques (RSSI, hotline assurance, CSIRT, prestataire PRIS) accessible même si vos
        systèmes informatiques sont indisponibles.
      </div>
    </div>
  );
}
