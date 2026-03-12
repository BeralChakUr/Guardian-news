import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Radio } from 'lucide-react';

function AnimatedRadar() {
  return (
    <div className="relative w-80 h-80 lg:w-96 lg:h-96">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute inset-8 rounded-full border border-cyan-400/40"
        animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      
      {/* Inner ring */}
      <motion.div
        className="absolute inset-16 rounded-full border border-cyan-300/50"
        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      />
      
      {/* Center glow */}
      <div className="absolute inset-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-xl" />
      
      {/* Radar sweep */}
      <motion.div
        className="absolute inset-0 origin-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400/80 to-transparent origin-left" />
      </motion.div>
      
      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-16 h-16 text-cyan-400" />
        </motion.div>
      </div>
      
      {/* Threat dots */}
      <motion.div
        className="absolute top-8 right-16 w-3 h-3 bg-red-500 rounded-full"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-12 w-2 h-2 bg-orange-500 rounded-full"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
      />
      <motion.div
        className="absolute top-24 left-8 w-2 h-2 bg-yellow-500 rounded-full"
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
      />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-medium">Surveillance en temps réel</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Veille cybersécurité{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                en temps réel
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
              Guardian News analyse les alertes provenant des principales agences de 
              cybersécurité mondiales et les transforme en informations claires et exploitables.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard/news"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                data-testid="hero-cta-threats"
              >
                Voir les menaces actuelles
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800/50 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-700/50 hover:border-cyan-500/50 transition-all"
                data-testid="hero-cta-dashboard"
              >
                Explorer le dashboard cyber
              </Link>
            </div>
          </motion.div>
          
          {/* Right - Animated Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <AnimatedRadar />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
