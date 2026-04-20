import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, CheckCircle, AlertTriangle, Users, Shield, Clock, Tag, HelpCircle, Briefcase, Home, Building2 } from 'lucide-react';
import { getNewsById } from '../services/newsService';

const severityStyles: Record<string, string> = {
  critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  eleve: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  moyen: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  faible: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const severityLabels: Record<string, string> = {
  critique: 'Critique',
  eleve: 'Élevé',
  moyen: 'Moyen',
  faible: 'Faible',
};

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: news, isLoading, isError } = useQuery({
    queryKey: ['news', id],
    queryFn: () => getNewsById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse pb-20">
        <div className="h-8 w-32 rounded bg-cyber-surface mb-6" />
        <div className="h-10 w-3/4 rounded bg-cyber-surface mb-4" />
        <div className="h-6 w-1/2 rounded bg-cyber-surface mb-8" />
        <div className="h-64 rounded-2xl bg-cyber-surface" />
      </div>
    );
  }

  if (isError || !news) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4 text-lg">Article non trouvé</p>
        <Link to="/dashboard/news" className="text-cyber-primary hover:underline">
          Retour aux actualités
        </Link>
      </div>
    );
  }

  // Handle tldr as string or array
  const tldrItems = Array.isArray(news.tldr) 
    ? news.tldr 
    : (news.tldr ? [news.tldr] : []);
  
  // Handle actions as string or array
  const actionItems = Array.isArray(news.actions) 
    ? news.actions 
    : (news.actions ? [news.actions] : []);

  return (
    <div className="pb-20 md:pb-0 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/dashboard/news"
        className="mb-6 inline-flex items-center gap-2 text-cyber-secondary hover:text-white transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Retour aux actualités
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${severityStyles[news.severity] || severityStyles.faible}`}>
            {severityLabels[news.severity] || news.severity}
          </span>
          <span className="px-3 py-1 rounded-full bg-cyber-elevated text-cyber-secondary text-sm">
            {news.threat_type}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          {news.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-cyber-secondary">
          <span className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            {news.source}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(news.published_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* TL;DR Section */}
      {tldrItems.length > 0 && (
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyber-primary/20">
              <AlertTriangle className="h-5 w-5 text-cyber-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white">Résumé</h2>
          </div>
          <ul className="space-y-3">
            {tldrItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-2 h-2 w-2 rounded-full bg-cyber-primary shrink-0" />
                <span className="text-cyber-secondary leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* V4 - Suis-je concerné ? */}
      <section
        className="mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/30 p-6"
        data-testid="am-i-concerned"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Suis-je concerné ?</h2>
        </div>
        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          Identifiez rapidement si cette alerte vous concerne en fonction de votre profil.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: Home,
              label: 'Particulier',
              level: (() => {
                const s = news.severity;
                const t = news.threat_type;
                if (t === 'phishing' || t === 'scam') return 'high';
                if (t === 'data_leak' || s === 'critique') return 'medium';
                return 'low';
              })(),
              hint: (() => {
                const t = news.threat_type;
                if (t === 'phishing') return 'Risque fort : vérifiez vos emails';
                if (t === 'scam') return 'Risque fort : méfiez-vous des appels/SMS';
                if (t === 'data_leak') return 'Vérifiez haveibeenpwned.com';
                if (t === 'ransomware') return 'Sauvegardez vos fichiers';
                return 'Restez vigilant';
              })(),
            },
            {
              icon: Briefcase,
              label: 'PME / TPE',
              level: (() => {
                const s = news.severity;
                const t = news.threat_type;
                if (t === 'ransomware' || t === 'phishing' || t === 'vuln') return 'high';
                if (s === 'critique' || s === 'eleve') return 'medium';
                return 'low';
              })(),
              hint: (() => {
                const t = news.threat_type;
                if (t === 'ransomware') return 'Risque métier élevé — sauvegardes 3-2-1';
                if (t === 'vuln') return 'Vérifiez vos systèmes exposés';
                if (t === 'phishing') return 'Sensibilisez vos équipes';
                if (t === 'data_leak') return 'Vérifiez vos accès & mots de passe';
                return 'Mettez à jour vos systèmes';
              })(),
            },
            {
              icon: Building2,
              label: 'Entreprise / Secteur public',
              level: (() => {
                const s = news.severity;
                const t = news.threat_type;
                if (s === 'critique' || t === 'apt' || t === 'ransomware' || t === 'vuln') return 'high';
                if (s === 'eleve') return 'medium';
                return 'low';
              })(),
              hint: (() => {
                const t = news.threat_type;
                if (t === 'apt') return 'Menace ciblée — alertez votre SOC';
                if (t === 'ransomware') return 'Plan de continuité d\'activité';
                if (t === 'vuln') return 'Patchez vos infrastructures critiques';
                if (t === 'data_leak') return 'Notification RGPD sous 72h si affecté';
                return 'Surveillance renforcée recommandée';
              })(),
            },
          ].map((p) => {
            const Icon = p.icon;
            const styles = p.level === 'high'
              ? { border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-300', dot: 'bg-red-500', badge: 'Concerné' }
              : p.level === 'medium'
              ? { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-300', dot: 'bg-orange-500', badge: 'À surveiller' }
              : { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-300', dot: 'bg-emerald-500', badge: 'Peu concerné' };
            return (
              <div
                key={p.label}
                className={`relative rounded-xl border ${styles.border} ${styles.bg} p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 ${styles.text}`} />
                  <span className="text-sm font-semibold text-white">{p.label}</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                  {styles.badge}
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-snug">{p.hint}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Impact Section */}
      {news.impact && (
        <section className="mb-6 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Users className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Impact</h2>
          </div>
          <p className="text-cyber-secondary leading-relaxed">{news.impact}</p>
        </section>
      )}

      {/* Actions Section */}
      {actionItems.length > 0 && (
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-cyber-surface to-cyber-elevated border border-gray-800 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Actions recommandées</h2>
          </div>
          <ul className="space-y-4">
            {actionItems.map((action, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-400">
                  {i + 1}
                </span>
                <span className="text-cyber-secondary leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Source Link */}
      {news.url && (
        <div className="text-center">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyber-primary to-cyan-500 px-8 py-4 font-semibold text-white hover:shadow-lg hover:shadow-cyber-primary/30 transition-all"
          >
            Voir l'article source
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      )}
    </div>
  );
}
