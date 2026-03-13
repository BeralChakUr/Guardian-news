import { motion } from 'framer-motion';
import { 
  Shield, 
  Globe, 
  Building, 
  Lock, 
  Server, 
  Eye, 
  FileSearch, 
  Newspaper, 
  ExternalLink,
  Radio,
  Cpu,
  Search
} from 'lucide-react';

const sources = [
  {
    name: 'CERT-FR',
    description: 'Centre gouvernemental de veille, d\'alerte et de réponse aux attaques informatiques en France.',
    url: 'https://www.cert.ssi.gouv.fr/',
    icon: Shield,
    color: 'text-blue-400',
    category: 'Gouvernement',
  },
  {
    name: 'ANSSI',
    description: 'Agence nationale de la sécurité des systèmes d\'information - France.',
    url: 'https://www.ssi.gouv.fr/',
    icon: Lock,
    color: 'text-blue-400',
    category: 'Gouvernement',
  },
  {
    name: 'CISA',
    description: 'Cybersecurity and Infrastructure Security Agency - États-Unis.',
    url: 'https://www.cisa.gov/',
    icon: Building,
    color: 'text-red-400',
    category: 'Gouvernement',
  },
  {
    name: 'OWASP',
    description: 'Open Web Application Security Project - Standards de sécurité applicative.',
    url: 'https://owasp.org/',
    icon: FileSearch,
    color: 'text-orange-400',
    category: 'Organisation',
  },
  {
    name: 'Microsoft Security',
    description: 'Blog officiel de sécurité Microsoft - Vulnérabilités et mises à jour.',
    url: 'https://www.microsoft.com/security/blog/',
    icon: Server,
    color: 'text-cyan-400',
    category: 'Enterprise',
  },
  {
    name: 'KrebsOnSecurity',
    description: 'Blog indépendant de Brian Krebs - Enquêtes approfondies sur la cybercriminalité.',
    url: 'https://krebsonsecurity.com/',
    icon: Eye,
    color: 'text-green-400',
    category: 'Indépendant',
  },
  {
    name: 'BleepingComputer',
    description: 'Actualités et analyses sur la cybersécurité, malwares et vulnérabilités.',
    url: 'https://www.bleepingcomputer.com/',
    icon: Newspaper,
    color: 'text-purple-400',
    category: 'Média',
  },
  {
    name: 'Dark Reading',
    description: 'Source majeure d\'informations sur la cybersécurité pour les professionnels.',
    url: 'https://www.darkreading.com/',
    icon: Globe,
    color: 'text-pink-400',
    category: 'Média',
  },
  {
    name: 'Malwarebytes Labs',
    description: 'Recherche sur les malwares et menaces par les experts Malwarebytes.',
    url: 'https://blog.malwarebytes.com/',
    icon: Shield,
    color: 'text-yellow-400',
    category: 'Enterprise',
  },
  {
    name: 'Cisco Talos',
    description: 'Groupe de renseignement sur les menaces de Cisco.',
    url: 'https://blog.talosintelligence.com/',
    icon: Cpu,
    color: 'text-teal-400',
    category: 'Enterprise',
  },
  {
    name: 'Google Threat Intelligence',
    description: 'Analyses des menaces par l\'équipe sécurité de Google.',
    url: 'https://blog.google/threat-analysis-group/',
    icon: Search,
    color: 'text-emerald-400',
    category: 'Enterprise',
  },
];

const categories = ['Tous', 'Gouvernement', 'Enterprise', 'Média', 'Indépendant', 'Organisation'];

export default function SourcesPage() {
  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/20">
            <Globe className="h-6 w-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sources OSINT</h1>
        </div>
        <p className="text-slate-400">
          Guardian News analyse automatiquement ces flux RSS pour détecter les menaces émergentes.
        </p>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30"
      >
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-green-400 animate-pulse" />
          <div>
            <p className="text-white font-medium">Surveillance Active</p>
            <p className="text-sm text-slate-400">
              {sources.length} sources monitorées • Actualisation toutes les 30 minutes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sources Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((source, index) => {
          const Icon = source.icon;
          return (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-slate-700/50 ${source.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-400">
                    {source.category}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {source.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {source.description}
                </p>

                {/* Button */}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-colors"
                >
                  Visiter le site
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-3">Comment fonctionne la surveillance ?</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Radio className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Collecte</p>
              <p className="text-xs text-slate-400">Flux RSS analysés toutes les 30 min</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Cpu className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Analyse IA</p>
              <p className="text-xs text-slate-400">Classification automatique des menaces</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Shield className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Alertes</p>
              <p className="text-xs text-slate-400">Notification des menaces critiques</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
