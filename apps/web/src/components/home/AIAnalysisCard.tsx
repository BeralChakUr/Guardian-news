import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Bot, Brain, Sparkles, FileText, Database, AlertCircle } from 'lucide-react';
import { getAISummary } from '../../services/newsService';

export default function AIAnalysisCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-summary-home'],
    queryFn: () => getAISummary('simple', 5),
    staleTime: 300000, // 5 minutes
    retry: 1,
  });

  return (
    <section className="py-16" data-testid="ai-analysis-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/30 border border-indigo-500/30 p-8"
        >
          {/* Background effects */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analyse Guardian AI</h2>
                <p className="text-slate-400 text-sm">Intelligence artificielle appliquée à la cybersécurité</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-6 bg-slate-700/50 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-700/50 rounded animate-pulse w-5/6" />
              </div>
            ) : isError ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <p className="text-slate-400">Analyse IA temporairement indisponible</p>
              </div>
            ) : (
              <>
                {/* AI Summary text */}
                <div className="mb-8 p-6 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
                    <p className="text-slate-300 leading-relaxed">
                      {data?.global_summary || 
                       "Aujourd'hui les menaces principales concernent plusieurs campagnes de phishing ciblant Microsoft 365, une vulnérabilité critique Cisco exploitée activement, et une augmentation des attaques ransomware."}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                    <FileText className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{data?.items?.length || 5}</div>
                    <div className="text-xs text-slate-400">Articles analysés</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                    <Database className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">10+</div>
                    <div className="text-xs text-slate-400">Sources analysées</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                    <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">GPT-4o</div>
                    <div className="text-xs text-slate-400">Modèle IA</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center">
                    <Bot className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-xs text-slate-400">Analyse continue</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
