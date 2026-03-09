import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Shield, Newspaper, AlertTriangle, Settings, Activity, Menu, X, ChevronRight, Swords, Wrench, LayoutDashboard, Home } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTension } from '../services/newsService';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Command center', end: true },
  { to: '/dashboard/news', icon: Newspaper, label: 'News Feed', description: 'All threats' },
  { to: '/dashboard/attaques', icon: Swords, label: 'Attacks', description: 'Attack types' },
  { to: '/dashboard/outils', icon: Wrench, label: 'Tools', description: 'Security toolkit' },
  { to: '/dashboard/urgence', icon: AlertTriangle, label: 'Emergency', description: 'Incident response' },
  { to: '/dashboard/parametres', icon: Settings, label: 'Settings', description: 'Configuration' },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const { data: tension } = useQuery({
    queryKey: ['tension-sidebar'],
    queryFn: getTension,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const getTensionColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critique': return 'text-red-400 bg-red-500/20';
      case 'élevé': return 'text-orange-400 bg-orange-500/20';
      case 'modéré': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-green-400 bg-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:w-72 md:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 bg-cyber-surface px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-primary/20">
              <Shield className="h-6 w-6 text-cyber-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Guardian News</h1>
              <p className="text-xs text-cyber-secondary">Plateforme Cyber</p>
            </div>
          </div>

          {/* Tension Index Card */}
          {tension && (
            <div className={`rounded-xl border border-gray-800 p-4 ${getTensionColor(tension.level)}`}>
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
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map(({ to, icon: Icon, label, description, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-cyber-primary text-white'
                          : 'text-cyber-secondary hover:bg-cyber-elevated hover:text-white'
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
            <div className="mt-auto pt-4 border-t border-gray-800">
              <div className="rounded-xl bg-cyber-elevated p-4">
                <p className="text-xs text-cyber-secondary mb-2">Sources surveillées</p>
                <p className="text-2xl font-bold text-white">10+</p>
                <p className="text-xs text-cyber-secondary mt-1">CERT-FR, CISA, Krebs...</p>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* ==================== MOBILE HEADER ==================== */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-cyber-surface/95 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyber-primary/20">
              <Shield className="h-5 w-5 text-cyber-primary" />
            </div>
            <span className="font-bold text-white">Guardian</span>
          </div>
          
          {/* Mobile Tension Badge */}
          {tension && (
            <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getTensionColor(tension.level)}`}>
              <Activity className="h-3 w-3" />
              <span>{tension.score}</span>
            </div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-cyber-secondary hover:bg-cyber-elevated hover:text-white"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ==================== MOBILE SIDEBAR OVERLAY ==================== */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-cyber-surface md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-cyber-primary" />
                <span className="font-bold text-white">Guardian News</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-cyber-secondary hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl p-4 mb-2 font-medium transition-colors ${
                      isActive
                        ? 'bg-cyber-primary text-white'
                        : 'text-cyber-secondary hover:bg-cyber-elevated hover:text-white'
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-cyber-surface/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? 'text-cyber-primary' : 'text-cyber-secondary'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
