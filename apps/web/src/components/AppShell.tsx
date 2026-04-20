import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  Newspaper, 
  AlertTriangle, 
  Settings, 
  Activity, 
  Menu, 
  X, 
  ChevronRight, 
  Swords, 
  Wrench, 
  LayoutDashboard, 
  Home,
  Globe,
  Radio,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTension, getVersion } from '../services/newsService';

const navItems = [
  { to: '/', icon: Home, label: 'Accueil', description: 'Page d\'accueil', end: true },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', description: 'Vue d\'ensemble', end: true },
  { to: '/dashboard/news', icon: Newspaper, label: 'Fil d\'actualités', description: 'Toutes les menaces' },
  { to: '/dashboard/attaques', icon: Swords, label: 'Attaques', description: 'Types d\'attaques' },
  { to: '/dashboard/outils', icon: Wrench, label: 'Outils', description: 'Boîte à outils' },
  { to: '/dashboard/urgence', icon: AlertTriangle, label: 'Urgence', description: 'Réponse incidents' },
  { to: '/dashboard/sources', icon: Globe, label: 'Sources', description: 'Flux OSINT' },
  { to: '/dashboard/parametres', icon: Settings, label: 'Paramètres', description: 'Configuration' },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const { data: tension } = useQuery({
    queryKey: ['tension-sidebar'],
    queryFn: getTension,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: versionInfo } = useQuery({
    queryKey: ['app-version'],
    queryFn: getVersion,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const versionLabel = versionInfo?.version
    ? `V${versionInfo.version.split('.').slice(0, 2).join('.')}`
    : 'V4.0';

  const getTensionColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critique': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'élevé': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'modéré': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-72 md:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl px-6 pb-4">
          {/* Logo - Clickable */}
          <Link to="/" className="flex h-16 shrink-0 items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Guardian News</h1>
                <span className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  {versionLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">Plateforme Cyber</p>
            </div>
          </Link>

          {/* Tension Index Card */}
          {tension && (
            <div className={`rounded-xl border p-4 ${getTensionColor(tension.level)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <span className="font-medium">Niveau Cyber</span>
                </div>
                <span className="text-2xl font-bold">{tension.score}</span>
              </div>
              <p className="mt-1 text-sm opacity-80">{tension.level}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navItems.map(({ to, icon: Icon, label, description, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1">
                      <span className="block">{label}</span>
                      <span className="block text-xs opacity-60">{description}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Stats footer */}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="h-4 w-4 text-green-400 animate-pulse" />
                  <p className="text-xs text-slate-400">Surveillance active</p>
                </div>
                <p className="text-2xl font-bold text-white">11</p>
                <p className="text-xs text-slate-500 mt-1">Sources OSINT surveillées</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>Guardian News</span>
                <span className="font-mono font-semibold text-cyan-400/80">
                  {versionInfo?.version ? `v${versionInfo.version}` : 'v4.0.0'}
                </span>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* ==================== MOBILE HEADER ==================== */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white">Guardian</span>
              <span className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                {versionLabel}
              </span>
            </div>
          </Link>
          
          {/* Mobile Tension Badge */}
          {tension && (
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${getTensionColor(tension.level)}`}>
              <Activity className="h-3 w-3" />
              <span>{tension.score}</span>
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ==================== MOBILE SIDEBAR OVERLAY ==================== */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4">
              <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-white">Guardian News</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl p-4 font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="md:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* ==================== MOBILE BOTTOM NAV ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-500'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
