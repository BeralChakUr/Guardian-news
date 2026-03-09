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
  Lock,
  Eye,
  TrendingUp,
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
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(88,166,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(88,166,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Animated nodes */}
      <div className="absolute top-20 left-[10%] w-2 h-2 bg-cyber-primary/40 rounded-full animate-pulse" />
      <div className="absolute top-40 right-[15%] w-3 h-3 bg-cyan-500/30 rounded-full animate-pulse delay-300" />
      <div className="absolute top-60 left-[25%] w-2 h-2 bg-blue-400/40 rounded-full animate-pulse delay-500" />
      <div className="absolute bottom-40 right-[30%] w-2 h-2 bg-cyber-primary/30 rounded-full animate-pulse delay-700" />
      <div className="absolute bottom-20 left-[40%] w-3 h-3 bg-cyan-400/20 rounded-full animate-pulse delay-1000" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
    </div>
  );
}

// Stats component
function StatBlock({ value, label, icon: Icon }: { value: string; label: string; icon: any }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-cyber-surface/50 border border-gray-800 backdrop-blur-sm hover:border-cyber-primary/50 transition-all group">
      <Icon className="h-6 w-6 mx-auto mb-3 text-cyber-primary group-hover:scale-110 transition-transform" />
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-cyber-secondary">{label}</div>
    </div>
  );
}

// Feature card
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

// Threat level indicator
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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-primary/10 border border-cyber-primary/30 mb-8">
            <Radio className="h-4 w-4 text-cyber-primary animate-pulse" />
            <span className="text-sm text-cyber-primary font-medium">Live Threat Monitoring</span>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyber-primary/20 to-cyan-500/20 border border-cyber-primary/30">
              <Shield className="h-12 w-12 text-cyber-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-cyber-primary to-cyan-400 bg-clip-text text-transparent">
            Guardian News
          </h1>
          
          <p className="text-xl md:text-2xl text-cyber-primary font-medium mb-6">
            Cyber Threat Intelligence & Security Monitoring Platform
          </p>
          
          <p className="text-lg text-cyber-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Monitor cybersecurity threats, vulnerabilities and attack campaigns in real time 
            through a centralized intelligence dashboard powered by AI analysis.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-primary to-cyan-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyber-primary/30 transition-all"
            >
              View Cyber Threat Feed
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard/attaques"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-white font-semibold text-lg hover:border-cyber-primary hover:bg-cyber-primary/10 transition-all"
            >
              Explore Attack Intelligence
            </Link>
          </div>

          {/* Live threat level */}
          {tension && (
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-cyber-surface/80 border border-gray-800 backdrop-blur-sm">
              <span className="text-sm text-cyber-secondary">Current Threat Level:</span>
              <ThreatLevelIndicator level={tension.level} score={tension.score} />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-6 w-6 text-cyber-secondary rotate-90" />
        </div>
      </section>

      {/* ==================== WHY THIS PLATFORM ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why This Platform?
            </h2>
            <p className="text-cyber-secondary max-w-2xl mx-auto">
              Stay ahead of cyber threats with real-time intelligence and actionable insights
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Eye}
              title="Cyber Threat Intelligence"
              description="Centralized monitoring of cybersecurity alerts from trusted sources such as CERT-FR, CISA, BleepingComputer, DarkReading and KrebsOnSecurity."
              color="bg-blue-500/20 text-blue-400"
            />
            <FeatureCard
              icon={Target}
              title="Threat Analysis"
              description="Understand vulnerabilities, attack campaigns and security incidents quickly with categorized and filtered intelligence."
              color="bg-orange-500/20 text-orange-400"
            />
            <FeatureCard
              icon={Zap}
              title="Faster Incident Response"
              description="Access threat context and security insights to improve incident response and decision making."
              color="bg-green-500/20 text-green-400"
            />
          </div>
        </div>
      </section>

      {/* ==================== PLATFORM FEATURES ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Features
            </h2>
            <p className="text-cyber-secondary max-w-2xl mx-auto">
              Everything you need to monitor and understand the cyber threat landscape
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-cyber-primary/50 transition-all group">
              <Newspaper className="h-8 w-8 text-cyber-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Cyber News Feed</h3>
              <p className="text-sm text-cyber-secondary">Real-time cybersecurity news, vulnerability disclosures and threat intelligence.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-orange-500/50 transition-all group">
              <AlertTriangle className="h-8 w-8 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Attack Types</h3>
              <p className="text-sm text-cyber-secondary">Educational descriptions of attack techniques: ransomware, phishing, malware, data breaches.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-green-500/50 transition-all group">
              <Wrench className="h-8 w-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Security Tools</h3>
              <p className="text-sm text-cyber-secondary">Useful commands, tools and cybersecurity resources for analysts and IT professionals.</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 hover:border-red-500/50 transition-all group">
              <BookOpen className="h-8 w-8 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-2">Emergency Procedures</h3>
              <p className="text-sm text-cyber-secondary">Quick guides explaining what to do during incidents: ransomware, compromised accounts, DDoS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CYBER THREAT LEVEL ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cyber Threat Level Indicator
            </h2>
            <p className="text-cyber-secondary">
              Real-time assessment of global threat intensity across monitored sources
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-green-500 mx-auto mb-4 shadow-lg shadow-green-500/50" />
              <h3 className="text-lg font-bold text-green-400 mb-2">Low</h3>
              <p className="text-sm text-cyber-secondary">Normal activity, standard monitoring recommended</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-orange-500 mx-auto mb-4 shadow-lg shadow-orange-500/50" />
              <h3 className="text-lg font-bold text-orange-400 mb-2">Medium</h3>
              <p className="text-sm text-cyber-secondary">Elevated activity, increased vigilance required</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
              <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-4 animate-pulse shadow-lg shadow-red-500/50" />
              <h3 className="text-lg font-bold text-red-400 mb-2">Critical</h3>
              <p className="text-sm text-cyber-secondary">High threat activity, immediate attention needed</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== WHO IS THIS FOR ==================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Who Is This Platform For?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-cyber-primary/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-cyber-primary/20 flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-8 w-8 text-cyber-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Organizations</h3>
              <p className="text-cyber-secondary">Monitor cybersecurity risks affecting your infrastructure and stay compliant.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-orange-500/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">IT & Security Pros</h3>
              <p className="text-cyber-secondary">Track vulnerabilities and active threat campaigns affecting your systems.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-cyber-surface border border-gray-800 hover:border-green-500/50 transition-all">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Students & Learners</h3>
              <p className="text-cyber-secondary">Understand cybersecurity threats using real-world examples and analysis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== QUICK STATS ==================== */}
      <section className="py-24 px-4 bg-cyber-surface/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Statistics
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatBlock value="10+" label="Threat Sources Monitored" icon={Globe} />
            <StatBlock value={String(newsData?.total || '100+')} label="Threats Analyzed" icon={Database} />
            <StatBlock value="8" label="Attack Categories" icon={Target} />
            <StatBlock value="24/7" label="Real-time Updates" icon={Activity} />
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
            Start Monitoring Cyber Threats
          </h2>
          <p className="text-lg text-cyber-secondary mb-10 max-w-2xl mx-auto">
            Access the Guardian News platform and stay informed about emerging cybersecurity risks. 
            No registration required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-primary to-cyan-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyber-primary/30 transition-all"
            >
              Open Threat Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-gray-700 text-white font-semibold text-lg hover:border-cyber-primary hover:bg-cyber-primary/10 transition-all"
            >
              View Latest Cyber News
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
              <span>Powered by real-time threat intelligence</span>
              <span>•</span>
              <span>10+ trusted sources</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
