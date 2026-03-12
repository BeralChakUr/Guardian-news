import { motion } from 'framer-motion';
import { Globe, Shield, Building, Lock, Server, Eye, FileSearch, Newspaper } from 'lucide-react';

const sources = [
  { name: 'CERT-FR', icon: Shield, description: 'France - Gouv', color: 'text-blue-400' },
  { name: 'ANSSI', icon: Lock, description: 'France - Gouv', color: 'text-blue-400' },
  { name: 'CISA', icon: Building, description: 'USA - Gouv', color: 'text-red-400' },
  { name: 'OWASP', icon: FileSearch, description: 'International', color: 'text-orange-400' },
  { name: 'Microsoft Security', icon: Server, description: 'Enterprise', color: 'text-cyan-400' },
  { name: 'KrebsOnSecurity', icon: Eye, description: 'Indépendant', color: 'text-green-400' },
  { name: 'BleepingComputer', icon: Newspaper, description: 'Média', color: 'text-purple-400' },
  { name: 'Dark Reading', icon: Globe, description: 'Média', color: 'text-pink-400' },
  { name: 'Malwarebytes', icon: Shield, description: 'Enterprise', color: 'text-yellow-400' },
];

export default function SourcesGrid() {
  return (
    <section className="py-16" data-testid="sources-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
            <Globe className="w-7 h-7 text-cyan-400" />
            Sources OSINT Surveillées
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Guardian News analyse automatiquement ces flux pour détecter les menaces émergentes.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {sources.map((source, index) => {
            const Icon = source.icon;
            return (
              <motion.div
                key={source.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 text-center cursor-default"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${source.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="text-sm font-semibold text-white mb-1">{source.name}</h3>
                  <span className="text-xs text-slate-500">{source.description}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-slate-400">Actualisation toutes les 30 minutes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
