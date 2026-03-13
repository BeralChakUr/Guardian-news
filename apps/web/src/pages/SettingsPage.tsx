import { motion } from 'framer-motion';
import { Globe, User, Info, Shield, ExternalLink } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function SettingsPage() {
  const { language, setLanguage, mode, setMode } = useAppStore();

  return (
    <div className="pb-20 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <p className="text-slate-400 mt-1">Configurez votre expérience Guardian News</p>
      </motion.div>

      {/* Language */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">Langue</h2>
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Globe className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white flex-1">Langue d'affichage</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  language === 'fr'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Mode */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">Mode d'affichage</h2>
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <User className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-white flex-1">Niveau de contenu</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('public')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  mode === 'public'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Grand public
              </button>
              <button
                onClick={() => setMode('pro')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  mode === 'pro'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Professionnel
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 ml-2">
          Le mode professionnel affiche plus de détails techniques dans les analyses.
        </p>
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">À propos</h2>
        <div className="rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-medium">Guardian News</p>
                <p className="text-sm text-slate-500">Version 2.0.0</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <Info className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-white">Plateforme OSINT</p>
                <p className="text-sm text-slate-500">Intelligence cybersécurité en temps réel</p>
              </div>
            </div>
          </div>
          <a
            href="https://www.cert.ssi.gouv.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors group"
          >
            <span className="text-white">Sources de données</span>
            <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </a>
        </div>
      </motion.section>

      {/* Theme Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 rounded-xl bg-slate-800/20 border border-slate-700/30"
      >
        <p className="text-xs text-slate-500 text-center">
          🌙 Guardian News utilise un thème sombre optimisé pour les environnements SOC et la surveillance continue.
        </p>
      </motion.div>
    </div>
  );
}
