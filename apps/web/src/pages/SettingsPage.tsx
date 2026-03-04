import { Moon, Sun, Globe, User, Bell } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode, language, setLanguage, mode, setMode } = useAppStore();

  return (
    <div className="pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-white mb-8">Paramètres</h1>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase text-cyber-secondary mb-4">Apparence</h2>
        <div className="rounded-2xl bg-cyber-surface overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-cyber-primary" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-400" />
              )}
              <span className="text-white">Mode sombre</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                isDarkMode ? 'bg-cyber-primary' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Language */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase text-cyber-secondary mb-4">Langue</h2>
        <div className="rounded-2xl bg-cyber-surface overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-800">
            <Globe className="h-5 w-5 text-cyber-primary" />
            <span className="text-white flex-1">Langue d'affichage</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  language === 'fr'
                    ? 'bg-cyber-primary text-white'
                    : 'bg-cyber-elevated text-cyber-secondary hover:text-white'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-cyber-primary text-white'
                    : 'bg-cyber-elevated text-cyber-secondary hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mode */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold uppercase text-cyber-secondary mb-4">Mode</h2>
        <div className="rounded-2xl bg-cyber-surface overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <User className="h-5 w-5 text-cyber-primary" />
            <span className="text-white flex-1">Niveau de contenu</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('public')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'public'
                    ? 'bg-cyber-primary text-white'
                    : 'bg-cyber-elevated text-cyber-secondary hover:text-white'
                }`}
              >
                Grand public
              </button>
              <button
                onClick={() => setMode('pro')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  mode === 'pro'
                    ? 'bg-orange-500 text-white'
                    : 'bg-cyber-elevated text-cyber-secondary hover:text-white'
                }`}
              >
                Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-sm font-semibold uppercase text-cyber-secondary mb-4">À propos</h2>
        <div className="rounded-2xl bg-cyber-surface overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-white">Guardian News</p>
            <p className="text-sm text-cyber-secondary">Version 2.0.0</p>
          </div>
          <a
            href="#"
            className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-cyber-elevated"
          >
            <span className="text-white">Mentions légales</span>
            <span className="text-cyber-secondary">›</span>
          </a>
          <a
            href="#"
            className="flex items-center justify-between p-4 hover:bg-cyber-elevated"
          >
            <span className="text-white">Politique de confidentialité</span>
            <span className="text-cyber-secondary">›</span>
          </a>
        </div>
      </section>
    </div>
  );
}
