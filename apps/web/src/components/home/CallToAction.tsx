import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, Shield, Activity, Radar } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-20" data-testid="cta-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900/50 via-slate-900 to-blue-900/50 border border-cyan-500/30 p-8 md:p-12"
        >
          {/* Background effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 mb-6"
            >
              <LayoutDashboard className="w-10 h-10 text-cyan-400" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Explorer le Dashboard Cyber
            </h2>
            
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
              Accédez à une vue avancée des menaces avec radar, timeline et analyse automatisée.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 text-lg"
                data-testid="cta-dashboard-btn"
              >
                Accéder au Dashboard SOC
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Features preview */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <Radar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Radar des menaces</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <Activity className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Timeline temps réel</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Alertes critiques</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
