import { useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Copy, Inbox } from 'lucide-react';
import { useMainCouranteStore, ENTRY_TYPE_META } from '../../store/mainCouranteStore';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function ExportPanel() {
  const entries = useMainCouranteStore((s) => s.entries);
  const addEntry = useMainCouranteStore((s) => s.addEntry);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [entries]
  );

  const isEmpty = sorted.length === 0;

  const generateCSV = () => {
    const header = ['Date', 'Heure', 'Auteur', 'Type', 'Description', 'Contexte', 'Source'];
    const rows = sorted.map((e) => {
      const d = new Date(e.timestamp);
      return [
        d.toLocaleDateString('fr-FR'),
        d.toLocaleTimeString('fr-FR'),
        e.author,
        ENTRY_TYPE_META[e.type]?.label ?? e.type,
        e.description,
        e.scope ?? '',
        e.auto ? 'Automatique' : 'Manuel',
      ].map(escapeCsv).join(',');
    });
    return '\uFEFF' + [header.join(','), ...rows].join('\n');
  };

  const generateMarkdown = () => {
    const lines = [
      '# Main courante — Centre Opérationnel',
      `_Exporté le ${new Date().toLocaleString('fr-FR')}_`,
      '',
      `**${sorted.length} entrée${sorted.length > 1 ? 's' : ''}** au total`,
      '',
      '| Date · Heure | Auteur | Type | Description | Contexte | Source |',
      '|---|---|---|---|---|---|',
      ...sorted.map((e) => {
        const d = new Date(e.timestamp).toLocaleString('fr-FR');
        const type = ENTRY_TYPE_META[e.type]?.label ?? e.type;
        const src = e.auto ? 'Auto' : 'Manuel';
        const desc = e.description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const scope = (e.scope ?? '—').replace(/\|/g, '\\|');
        return `| ${d} | ${e.author} | ${type} | ${desc} | ${scope} | ${src} |`;
      }),
      '',
      '---',
      '_Document généré par Guardian News — Centre Opérationnel V4.1_',
    ];
    return lines.join('\n');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCSV = () => {
    if (isEmpty) return;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    downloadFile(generateCSV(), `main-courante_${stamp}.csv`, 'text/csv;charset=utf-8;');
    addEntry({
      author: 'Export',
      type: 'export',
      description: `Export CSV généré (${sorted.length} entrées)`,
      auto: true,
    });
  };

  const handleMD = () => {
    if (isEmpty) return;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    downloadFile(generateMarkdown(), `main-courante_${stamp}.md`, 'text/markdown;charset=utf-8;');
    addEntry({
      author: 'Export',
      type: 'export',
      description: `Export Markdown généré (${sorted.length} entrées)`,
      auto: true,
    });
  };

  const handleCopy = () => {
    if (isEmpty) return;
    navigator.clipboard.writeText(generateMarkdown()).then(
      () => {
        addEntry({
          author: 'Export',
          type: 'export',
          description: `Synthèse copiée dans le presse-papier (${sorted.length} entrées)`,
          auto: true,
        });
        alert('Main courante copiée dans le presse-papier (format Markdown)');
      },
      () => alert('Impossible de copier')
    );
  };

  return (
    <div className="space-y-4" data-testid="export-panel">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300 shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Export de la main courante</h2>
            <p className="text-sm text-slate-300 mt-1">
              Exportez le journal chronologique complet de l'incident dans un format adapté à votre besoin
              (rapport, archivage, transmission à un tiers).
            </p>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
          <Inbox className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">Main courante vide</h3>
          <p className="text-sm text-slate-400">
            Aucune entrée à exporter. Commencez par qualifier un incident ou ajoutez des entrées dans
            l'onglet Chronologie.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* CSV */}
          <button
            onClick={handleCSV}
            className="text-left rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-800/60 p-4 transition-all"
            data-testid="export-csv-btn"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                .csv
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Format CSV</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Tableau exploitable dans Excel, LibreOffice ou Google Sheets. Idéal pour archivage,
              analyses statistiques ou transmission à un assureur.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 text-emerald-300 px-3 py-1.5 text-xs font-bold">
              <Download className="h-3.5 w-3.5" />
              Télécharger ({sorted.length})
            </div>
          </button>

          {/* Markdown */}
          <button
            onClick={handleMD}
            className="text-left rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-800/60 p-4 transition-all"
            data-testid="export-md-btn"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
                <FileText className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                .md
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Format Markdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Document texte structuré, prêt pour rapport, Notion, GitLab, GitHub ou wiki interne.
              Conserve la mise en forme tabulaire.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/15 text-cyan-300 px-3 py-1.5 text-xs font-bold">
              <Download className="h-3.5 w-3.5" />
              Télécharger ({sorted.length})
            </div>
          </button>

          {/* Copy clipboard */}
          <button
            onClick={handleCopy}
            className="text-left rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-purple-500/40 hover:bg-slate-800/60 p-4 transition-all"
            data-testid="export-copy-btn"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="rounded-lg bg-purple-500/15 p-2 text-purple-400">
                <Copy className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Presse-papier
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Copier en Markdown</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Copie immédiate dans le presse-papier. Collez directement dans votre rapport d'incident ou
              email.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/15 text-purple-300 px-3 py-1.5 text-xs font-bold">
              <Copy className="h-3.5 w-3.5" />
              Copier ({sorted.length})
            </div>
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3 text-xs text-slate-400 leading-relaxed">
        💡 <strong>Astuce</strong> — exportez régulièrement votre main courante sur un support sain
        (clé USB, second poste, cloud personnel) pour préserver les preuves même si le SI compromis est
        nettoyé ou réinstallé.
      </div>
    </div>
  );
}
