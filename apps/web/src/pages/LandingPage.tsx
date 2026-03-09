import { Link } from 'react-router-dom';
import {
  Shield,
  Zap,
  Target,
  AlertTriangle,
  Newspaper,
  Wrench,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  ChevronRight,
  Activity,
  Globe,
  Database,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getTension, getNews } from '../services/newsService';

// Animated background component
function CyberBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(88,166,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(88,166,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute top-20 left-[10%] w-2 h-2 bg-cyber-primary/40 rounded-full animate-pulse" />
      <div className="absolute top-40 right-[15%] w-3 h-3 bg-cyan-500/30 rounded-full animate-pulse delay-300" />
      <div className="absolute top-60 left-[25%] w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-40 right-[30%] w-2 h-2 bg-cyber-primary/30 rounded-full animate-pulse delay-700" />
      <div className="absolute bottom-20 left-[40%] w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse delay-1000" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
    </div>
  );
}

function StatBlock({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-cyber-surface/50 border border-gray-800 backdrop-blur-sm hover:border-cyber-primary/50 transition-all group">
      <Icon className="h-6 w-6 mx-auto mb-3 text-cyber-primary group-hover:scale-110 transition-transform" />
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-cyber-secondary">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-cyber-primary/50 transition-all duration-300">
      <div className={`inline-flex p-3 rounded-xl ${color} mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-cyber-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ThreatLevelIndicator({ level, score }: { level: string; score: number }) {
  const getColor = () => {
    if (score >= 70) return { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/50' };
    if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/50' };
    return { bg: 'bg-green-500', text: 'text-green-400', glow: 'shadow-green-500/50' };
  };
  const colors = getColor();

  return (
    <div className="flex items-center gap-4">
      <div className={`relative w-4 h-4 rounded-full ${colors.bg} animate-pulse shadow-lg ${colors.glow}`}>
        <div className={`absolute inset-0 rounded-full ${colors.bg} animate-ping opacity-75`} />
      </div>
      <div>
        <span className={`text-lg font-bold ${colors.text}`}>{level}</span>
        <span className="text-cyber-secondary ml-2">({score}/100)</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { data: tension } = useQuery({
    queryKey: ['tension-landing'],
    queryFn: getTension,
    staleTime: 5 * 60 * 1000,
  });

  const { data: newsData } = useQuery({
    queryKey: ['news-landing'],
    queryFn: () => getNews(1, 5, {}),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-cyber-bg text-white">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <CyberBackground />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 mb-8">
            <Radio className="h-4 w-4 text-cyber-primary animate-pulse" />
            <span className="text-sm text-cyber-primary font-medium">Surveillance des menaces en temps réel</span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyber-primary/20 to-cyan-500/20 border border-cyber-primary/30">
              <Shield className="h-12 w-12 text-cyber-primary" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-cyber-primary to-cyan-400 bg-clip-text text-transparent">
            Guardian News
          </h1>
          
          <p className="text-xl md:text-2xl text-cyber-primary font-medium mb-6">
            Plateforme de Veille et Intelligence Cybersécurité
          </p>
          
          <p className="text-lg text-cyber-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Surveillez les menaces, vulnérabilités et campagnes d'attaques en temps réel 
            grâce à un tableau de bord centralisé propulsé par l'intelligence artificielle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-primary to-cyan-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyber-primary/30 transition-all"
            >
              Voir les alertes cyber
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard/attaques"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-white font-semibold text-lg hover:border-cyber-primary hover:bg-cyber-primary/10 transition-all"
            >
              Explorer les types d'attaques
            </Link>
          </div>

          {tension && (
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-cyber-surface/80 border border-gray-800 backdrop-blur-sm">
              <span className="text-sm text-cyber-secondary">Niveau de menace actuel :</span>
              <ThreatLevelIndicator level={tension.level} score={tension.score} />
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-6 w-6 text-cyber-secondary rotate-90" />
        </div>
      </section>

      {/* ==================== POURQUOI CETTE PLATEFORME ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi cette plateforme ?
            </h2>
            <p className="text-cyber-secondary max-w-2xl mx-auto">
              Gardez une longueur d'avance sur les cybermenaces grâce à l'intelligence en temps réel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Target}
              title="Intelligence Cyber"
              description="Surveillance centralisée des alertes de sécurité provenant de sources fiables : CERT-FR, CISA, BleepingComputer, DarkReading et KrebsOnSecurity."
              color="bg-blue-500/20 text-blue-400"
            />
            <FeatureCard
              icon={Zap}
              title="Analyse des Menaces"
              description="Comprenez rapidement les vulnérabilités, campagnes d'attaques et incidents de sécurité grâce à une intelligence catégorisée et filtrée."
              color="bg-orange-500/20 text-orange-400"
            />
            <FeatureCard
              icon={Shield}
              title="Réponse Rapide"
              description="Accédez au contexte des menaces et aux informations de sécurité pour améliorer votre réponse aux incidents et votre prise de décision."
              color="bg-green-500/20 text-green-400"
            />
          </div>
        </div>
      </section>

      {/* ==================== FONCTIONNALITÉS ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fonctionnalités de la Plateforme
            </h2>
            <p className="text-cyber-secondary max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour surveiller et comprendre le paysage des cybermenaces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-cyber-primary/50 transition-all group">
              <Newspaper className="h-8 w-8 text-cyber-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Fil d'Actualités Cyber</h3>
              <p className="text-sm text-cyber-secondary">Actualités cybersécurité en temps réel, divulgations de vulnérabilités et intelligence sur les menaces.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-orange-500/50 transition-all group">
              <AlertTriangle className="h-8 w-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Types d'Attaques</h3>
              <p className="text-sm text-cyber-secondary">Descriptions pédagogiques des techniques d'attaque : ransomware, phishing, malware, fuites de données.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-green-500/50 transition-all group">
              <Wrench className="h-8 w-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Outils de Sécurité</h3>
              <p className="text-sm text-cyber-secondary">Commandes utiles, outils et ressources cybersécurité pour les analystes et professionnels IT.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-red-500/50 transition-all group">
              <BookOpen className="h-8 w-8 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Procédures d'Urgence</h3>
              <p className="text-sm text-cyber-secondary">Guides rapides expliquant quoi faire lors d'incidents : ransomware, comptes compromis, DDoS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INDICATEUR DE NIVEAU CYBER ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Indicateur de Niveau de Menace
            </h2>
            <p className="text-cyber-secondary">
              Évaluation en temps réel de l'intensité des menaces globales à travers les sources surveillées
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-green-500 mx-auto mb-4 shadow-lg shadow-green-500/50" />
              <h3 className="text-lg font-bold text-green-400 mb-2">Faible</h3>
              <p className="text-sm text-cyber-secondary">Activité normale, surveillance standard recommandée</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-orange-500 mx-auto mb-4 shadow-lg shadow-orange-500/50" />
              <h3 className="text-lg font-bold text-orange-400 mb-2">Modéré</h3>
              <p className="text-sm text-cyber-secondary">Activité élevée, vigilance accrue requise</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-4 animate-pulse shadow-lg shadow-red-500/50" />
              <h3 className="text-lg font-bold text-red-400 mb-2">Critique</h3>
              <p className="text-sm text-cyber-secondary">Haute activité de menaces, attention immédiate requise</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== POUR QUI ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pour qui est cette plateforme ?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-cyber-primary/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-cyber-primary/20 flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-cyber-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Organisations</h3>
              <p className="text-cyber-secondary">Surveillez les risques cybersécurité affectant votre infrastructure et restez en conformité.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-orange-500/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Professionnels IT & Sécurité</h3>
              <p className="text-cyber-secondary">Suivez les vulnérabilités et campagnes de menaces actives affectant vos systèmes.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Étudiants & Apprenants</h3>
              <p className="text-cyber-secondary">Comprenez les cybermenaces grâce à des exemples concrets et des analyses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATISTIQUES ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Statistiques de la Plateforme
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBlock value="10+" label="Sources surveillées" icon={Globe} />
            <StatBlock value={String(newsData?.total || '100+')} label="Menaces analysées" icon={Database} />
            <StatBlock value="8" label="Catégories d'attaques" icon={Target} />
            <StatBlock value="24/7" label="Mises à jour en temps réel" icon={Activity} />
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-primary/10 via-transparent to-cyan-500/10" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-full bg-cyber-primary/20 mb-6">
            <Shield className="h-10 w-10 text-cyber-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Commencez à Surveiller les Cybermenaces
          </h2>
          <p className="text-lg text-cyber-secondary mb-10 max-w-2xl mx-auto">
            Accédez à la plateforme Guardian News et restez informé sur les risques de cybersécurité émergents. 
            Aucune inscription requise.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-primary to-cyan-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyber-primary/30 transition-all"
            >
              Ouvrir le Tableau de Bord
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard/news"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-white font-semibold text-lg hover:border-cyber-primary hover:bg-cyber-primary/10 transition-all"
            >
              Voir les Dernières Actualités
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-cyber-primary" />
              <span className="font-bold text-white">Guardian News</span>
              <span className="text-cyber-secondary">v2.0</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-cyber-secondary">
              <span>Propulsé par l'intelligence des menaces en temps réel</span>
              <span>•</span>
              <span>10+ sources fiables</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
