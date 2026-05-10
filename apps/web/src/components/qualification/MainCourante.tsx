import { useState } from 'react';
import { Plus, Trash2, Copy, Download, AlertTriangle, Bot, User, Clock } from 'lucide-react';
import { useMainCouranteStore } from '../../store/mainCouranteStore';

export default function MainCourante() {
  const { entries, addEntry, removeEntry, clear } = useMainCouranteStore();
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addEntry({
      author: author.trim() || 'Utilisateur',
      description: description.trim(),
      scope: scope.trim() || undefined,
      auto: false,
    });
    setDescription('');
    setScope('');
    setShowForm(false);
  };

  const formatExport = () =>
    [
      '# Main courante — Guardian News',
      `# Export du ${new Date().toLocaleString('fr-FR')}`,
      `# Nombre d'entrées : ${entries.length}`,
      '',
      ...entries.map((e) =>
        [
          `[${new Date(e.timestamp).toLocaleString('fr-FR')}]`,
          `Auteur: ${e.author}`,
          `Action: ${e.description}`,
          e.scope ? `Périmètre: ${e.scope}` : '',
          e.auto ? '(entrée automatique)' : '',
          '---',
        ]
          .filter(Boolean)
          .join('\n')
      ),
    ].join('\n');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatExport());
      alert('Main courante copiée dans le presse-papier');
    } catch {
      alert('Impossible de copier dans le presse-papier');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formatExport()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main-courante-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5"
      data-testid="main-courante"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-bold text-white">Main courante</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Journal chronologique de l’incident
            {entries.length > 0 && ` · ${entries.length} entrées`}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-2.5 py-1.5 text-xs font-semibold text-slate-900 transition-colors"
            data-testid="main-courante-add-btn"
          >
            <Plus className="h-3 w-3" />
            Ajouter
          </button>
          {entries.length > 0 && (
            <>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                data-testid="main-courante-copy-btn"
              >
                <Copy className="h-3 w-3" />
                Copier
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="h-3 w-3" />
                Export
              </button>
              <button
                onClick={() => {
                  if (confirm('Vider la main courante ?')) clear();
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-red-700/50 hover:border-red-500/70 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Vider
              </button>
            </>
          )}
        </div>
      </div>

      {/* Avertissement */}
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-200 leading-snug">
          Ne stockez pas cette main courante sur un système potentiellement compromis. Préférez un
          appareil sain ou un export imprimé pour les preuves.
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 rounded-xl border border-slate-700 bg-slate-800/50 p-3 space-y-2">
          <input
            type="text"
            placeholder="Auteur (ex: Prénom Nom)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <textarea
            required
            placeholder="Description de l'action ou de l'événement *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
          />
          <input
            type="text"
            placeholder="Machines / comptes concernés (optionnel)"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-900"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Aucune entrée. Cliquez sur “Ajouter” pour consigner une action.
        </div>
      ) : (
        <ul className="space-y-2" data-testid="main-courante-list">
          {[...entries].reverse().map((entry) => (
            <li
              key={entry.id}
              className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 group"
            >
              <div className="flex items-start gap-2">
                <div className={`rounded-md p-1.5 shrink-0 ${entry.auto ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-700/40 text-slate-400'}`}>
                  {entry.auto ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
                    <span>·</span>
                    <span className="text-slate-300 font-medium">{entry.author}</span>
                    {entry.auto && (
                      <span className="rounded-full bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Auto
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white break-words">{entry.description}</p>
                  {entry.scope && (
                    <p className="text-xs text-slate-400 mt-1 break-words">Périmètre : {entry.scope}</p>
                  )}
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
