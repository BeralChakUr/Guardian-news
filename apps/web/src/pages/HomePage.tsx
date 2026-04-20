import { Link } from 'react-router-dom';
import { Shield, Menu, X, LayoutDashboard, Newspaper, Settings } from 'lucide-react';
import { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import SituationOfTheDay from '../components/home/SituationOfTheDay';
import ThreatLevelCard from '../components/home/ThreatLevelCard';
import DailyAlerts from '../components/home/DailyAlerts';
import AIAnalysisCard from '../components/home/AIAnalysisCard';
import ThreatRadar from '../components/home/ThreatRadar';
import SourcesGrid from '../components/home/SourcesGrid';
import RecentNews from '../components/home/RecentNews';
import CallToAction from '../components/home/CallToAction';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', href: '/', icon: Shield },
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Actualités', href: '/dashboard/news', icon: Newspaper },
    { label: 'Paramètres', href: '/dashboard/parametres', icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Guardian News</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/50">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-slate-950 border-t border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Guardian News</span>
              <p className="text-xs text-slate-500">Plateforme OSINT Cybersécurité</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
            <Link to="/dashboard/news" className="hover:text-cyan-400 transition-colors">Actualités</Link>
            <a href="https://www.cert.ssi.gouv.fr/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">CERT-FR</a>
          </div>
          
          <p className="text-xs text-slate-600">
            © 2024 Guardian News. Données OSINT publiques.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white" data-testid="homepage">
      <Header />
      
      <main className="pt-16">
        <HeroSection />
        <SituationOfTheDay />
        <ThreatLevelCard />
        <DailyAlerts />
        <AIAnalysisCard />
        <ThreatRadar />
        <SourcesGrid />
        <RecentNews />
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  );
}
