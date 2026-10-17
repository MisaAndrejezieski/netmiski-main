import { BookOpen, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { concepts } from '../simulation/concepts'

interface Props {
  onClose: () => void
}

function renderMarkdown(text: string): string {
  // Very simple markdown: bold, code, headers, lists, tables
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-cyber-bg text-cyber-matrix px-1 rounded text-xs font-mono border border-cyber-border">$1</code>')
    .replace(/^#### (.+)$/gm, '<h4 class="font-bold text-cyber-text mt-3 mb-1 text-sm">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="font-bold text-cyber-matrix mt-4 mb-1 text-base drop-shadow-[0_0_2px_rgba(0,255,65,0.3)]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-cyber-matrix mt-4 mb-2 text-lg drop-shadow-[0_0_2px_rgba(0,255,65,0.3)]">$1</h2>')
    .replace(/^\| (.+) \|$/gm, (_, row) => {
      const cells = row.split(' | ').map((c: string) => `<td class="border border-cyber-border px-2 py-0.5 text-xs text-cyber-text">${c}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>)/gs, '<table class="border-collapse w-full my-2 text-xs">$1</table>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-cyber-text">• $1</li>')
    .replace(/\n\n/g, '</p><p class="mb-2 text-sm text-cyber-text/90">')
}

export default function InfoPanel({ onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const concept = selected ? concepts.find((c) => c.id === selected) : null

  const filtered = concepts.filter(
    (c) =>
      c.title.toLowerCase().includes(filter.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase())),
  )

  return (
    <div className="flex flex-col h-full bg-cyber-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          {concept && (
            <button
              className="text-cyber-muted hover:text-cyber-text mr-1"
              onClick={() => setSelected(null)}
            >
              <ChevronRight size={14} className="rotate-180" />
            </button>
          )}
          <BookOpen size={16} className="text-cyber-matrix" />
          <h2 className="font-semibold text-cyber-text text-sm">
            {concept ? concept.title : 'Concepts'}
          </h2>
        </div>
        <button onClick={onClose} className="text-cyber-muted hover:text-cyber-text transition-colors">
          <X size={16} />
        </button>
      </div>

      {!concept ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-2 border-b border-cyber-border bg-cyber-bg/50">
            <input
              className="w-full bg-cyber-bg border border-cyber-border rounded-md px-2.5 py-1.5 text-sm text-cyber-text outline-none focus:border-cyber-matrix focus:ring-1 focus:ring-cyber-matrix/50 transition-all placeholder:text-cyber-muted/50"
              placeholder="Search concepts..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-cyber-border/50 custom-scrollbar">
            {filtered.map((c) => (
              <button
                key={c.id}
                className="w-full text-left px-4 py-3 hover:bg-cyber-bg transition-colors group"
                onClick={() => setSelected(c.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-cyber-text group-hover:text-cyber-matrix transition-colors">
                      {c.title}
                    </div>
                    <div className="text-xs text-cyber-muted mt-0.5 leading-relaxed opacity-90">{c.summary}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium border ${
                        c.level === 'GCSE'
                          ? 'bg-green-900/20 text-green-400 border-green-500/30'
                          : c.level === 'A Level'
                          ? 'bg-purple-900/20 text-purple-400 border-purple-500/30'
                          : 'bg-blue-900/20 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {c.level}
                    </span>
                    <ChevronRight size={14} className="text-cyber-muted group-hover:text-cyber-matrix transition-colors" />
                  </div>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-cyber-muted text-sm py-8">No matching concepts</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium border ${
                concept.level === 'GCSE'
                  ? 'bg-green-900/20 text-green-400 border-green-500/30'
                  : concept.level === 'A Level'
                  ? 'bg-purple-900/20 text-purple-400 border-purple-500/30'
                  : 'bg-blue-900/20 text-blue-400 border-blue-500/30'
              }`}
            >
              {concept.level}
            </span>
            {concept.tags.map((t) => (
              <span key={t} className="text-xs px-1.5 py-0.5 bg-cyber-bg text-cyber-muted rounded border border-cyber-border">
                {t}
              </span>
            ))}
          </div>
          <div
            className="prose prose-sm max-w-none text-cyber-text leading-relaxed"
            dangerouslySetInnerHTML={{ __html: `<p class="mb-2 text-cyber-text/90">${renderMarkdown(concept.body)}</p>` }}
          />
        </div>
      )}
    </div>
  )
}