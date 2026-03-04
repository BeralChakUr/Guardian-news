import { Outlet, NavLink } from 'react-router-dom';
import { Shield, Newspaper, AlertTriangle, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Newspaper, label: 'Actus' },
  { to: '/urgence', icon: AlertTriangle, label: 'Urgence' },
  { to: '/parametres', icon: Settings, label: 'Paramètres' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-cyber-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-cyber-surface/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-primary/20">
                <Shield className="h-6 w-6 text-cyber-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Guardian News</h1>
                <p className="text-xs text-cyber-secondary">Veille Cybersécurité</p>
              </div>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyber-primary text-white'
                        : 'text-cyber-secondary hover:bg-cyber-elevated hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-cyber-surface md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 ${
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
