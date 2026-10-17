import { useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  BookOpen, Cable, Wifi, Trash2, HelpCircle,
  ChevronRight, ChevronLeft, Save, LayoutGrid, Check, X as XIcon,
  Upload, Layers, GraduationCap,
} from 'lucide-react'

import { useNetworkStore } from './store'
import type { Level } from './types'
import DeviceNode from './nodes/DeviceNode'
import DeletableEdge from './edges/DeletableEdge'
import DevicePalette from './components/DevicePalette'
import ConfigPanel from './components/ConfigPanel'
import Terminal from './components/Terminal'
import Browser from './components/Browser'
import InfoPanel from './components/InfoPanel'
import { PRESETS } from './simulation/presets'
import type { DeviceType, NetNode } from './types'

const nodeTypes = { device: DeviceNode }
const edgeTypes = { default: DeletableEdge }

// ─── Canvas (inside ReactFlowProvider so useReactFlow() works) ───────────────

function NetworkCanvas() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addDevice, selectNode, saveToStorage,
    setPanel,
  } = useNetworkStore()

  const { screenToFlowPosition } = useReactFlow()

  // Auto-save 1.5 s after last change
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToStorage(), 1500)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [nodes, edges, saveToStorage])

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/networx-device') as DeviceType
    if (!type) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addDevice(type, position)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handlePaneClick() {
    selectNode(null)
    setPanel(null)
  }

  function handleNodeClick(_: React.MouseEvent, node: NetNode) {
    selectNode(node.id)
    setPanel('config')
  }

  return (
    <div className="flex-1 relative" onDrop={handleDrop} onDragOver={handleDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        className="bg-cyber-bg"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#1e3a2b" />
        <Controls className="bg-cyber-panel border-cyber-border fill-cyber-text" />
        <MiniMap
          nodeColor={(n) => {
            const node = n as NetNode
            const dt = node.data?.deviceType
            if (dt === 'firewall') return '#b026ff'
            if (dt === 'router') return '#ff007f'
            if (dt === 'switch') return '#facc15'
            if (dt === 'cloud') return '#00f0ff'
            if (dt === 'server') return '#4ade80'
            return '#00FF41' // Verde Matrix padrão
          }}
          maskColor="rgba(5, 5, 5, 0.7)"
          style={{ backgroundColor: '#111111', border: '1px solid #222222' }}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-center text-cyber-muted max-w-sm">
            <div className="text-5xl mb-4 opacity-50">🖧</div>
            <p className="text-lg font-mono font-medium text-cyber-matrix mb-2">Build your network</p>
            <p className="text-sm leading-relaxed">
              Drag a device from the left panel onto the canvas, or click to add it at the centre.
              Then drag between the grey port handles to connect devices.
            </p>
            <p className="text-sm mt-3 text-cyber-neon font-medium">
              Or load a preset scenario from the toolbar ↑
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Preset picker ────────────────────────────────────────────────────────────

function PresetPicker() {
  const { loadPreset, saveToStorage } = useNetworkStore()
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(presetId: string) {
    if (confirmId === presetId) {
      const preset = PRESETS.find((p) => p.id === presetId)
      if (preset) { loadPreset(preset); saveToStorage() }
      setOpen(false)
      setConfirmId(null)
    } else {
      setConfirmId(presetId)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          open ? 'bg-cyber-bg text-cyber-matrix' : 'text-cyber-text hover:bg-cyber-bg'
        }`}
        onClick={() => { setOpen((v) => !v); setConfirmId(null) }}
      >
        <LayoutGrid size={14} />
        Presets
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-cyber-panel border border-cyber-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-cyber-border bg-cyber-bg/50">
            <p className="text-xs font-semibold text-cyber-muted uppercase tracking-wide">Load scenario</p>
            <p className="text-xs text-cyber-muted opacity-70">Replaces current canvas</p>
          </div>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`w-full text-left px-3 py-2.5 hover:bg-cyber-bg transition-colors border-b border-cyber-border/50 last:border-0 ${
                confirmId === p.id ? 'bg-orange-900/20' : ''
              }`}
              onClick={() => handleSelect(p.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-cyber-text">{p.name}</span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyber-bg text-cyber-muted uppercase tracking-wide flex-shrink-0 border border-cyber-border/50">
                      {p.level}
                    </span>
                  </div>
                  <div className="text-xs text-cyber-muted leading-tight mt-0.5">{p.description}</div>
                </div>
                {confirmId === p.id ? (
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-orange-500" />
                    <span className="text-xs text-orange-400 whitespace-nowrap">Click again</span>
                  </div>
                ) : (
                  <ChevronRight size={14} className="text-cyber-muted flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Save / Import buttons ────────────────────────────────────────────────────

function SaveButton() {
  const { clearCanvas, loadPreset, nodes, edges, level } = useNetworkStore()
  const [flash, setFlash] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    const json = JSON.stringify({ nodes, edges, level }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'netmiski-network.json'
    a.click()
    URL.revokeObjectURL(url)
    setFlash(true)
    setTimeout(() => setFlash(false), 2000)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.nodes && data.edges) {
          loadPreset({ id: 'imported', name: 'Imported', description: '', level: data.level ?? 'ks3', nodes: data.nodes, edges: data.edges })
        }
      } catch {
        alert('Invalid network file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-1">
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          flash ? 'bg-green-900/30 text-green-400' : 'text-cyber-text hover:bg-cyber-bg'
        }`}
        onClick={handleSave}
        title="Save network as netmiski-network.json"
      >
        {flash ? <Check size={14} /> : <Save size={14} />}
        {flash ? 'Saved' : 'Save'}
      </button>
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-cyber-text hover:bg-cyber-bg transition-colors"
        onClick={() => importRef.current?.click()}
        title="Import network from JSON file"
      >
        <Upload size={14} /> Import
      </button>
      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      {nodes.length > 0 && (
        <button
          className="p-1.5 rounded-md text-cyber-muted hover:text-red-400 hover:bg-red-900/20 transition-colors"
          onClick={() => {
            if (window.confirm('Clear the canvas? This cannot be undone.')) clearCanvas()
          }}
          title="Clear canvas"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<Level, string> = { ks3: 'KS3', ks4: 'KS4', ks5: 'KS5' }
const LEVELS: Level[] = ['ks3', 'ks4', 'ks5']

interface ToolbarProps {
  connectionType: 'wired' | 'wireless'
  setConnectionType: (t: 'wired' | 'wireless') => void
  onDeleteSelected: () => void
  onShowInfo: () => void
  selectedNodeId: string | null
  infoOpen: boolean
  showLayers: boolean
  toggleLayers: () => void
  level: Level
  setLevel: (l: Level) => void
}

function Toolbar({ connectionType, setConnectionType, onDeleteSelected, onShowInfo, selectedNodeId, infoOpen, showLayers, toggleLayers, level, setLevel }: ToolbarProps) {
  return (
    <header className="flex items-center gap-2 px-4 py-2 bg-cyber-panel border-b border-cyber-border z-10 flex-shrink-0 shadow-lg">
      <span className="font-mono font-bold text-lg tracking-tight text-cyber-matrix mr-1 drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]">NetMiski</span>

      <div className="h-5 w-px bg-cyber-border mx-1" />

      <PresetPicker />
      <SaveButton />

      <div className="h-5 w-px bg-cyber-border mx-1" />

      {/* Key stage selector */}
      <div className="flex items-center gap-1 bg-cyber-bg rounded-lg p-0.5 border border-cyber-border/50" title="Curriculum level — controls which devices and features are available">
        <GraduationCap size={13} className="ml-1.5 text-cyber-muted flex-shrink-0" />
        {LEVELS.map((l) => (
          <button
            key={l}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              level === l ? 'bg-cyber-panel text-cyber-matrix shadow-sm border border-cyber-border/50' : 'text-cyber-muted hover:text-cyber-text'
            }`}
            onClick={() => setLevel(l)}
          >
            {LEVEL_LABELS[l]}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-cyber-border mx-1" />

      {/* Connection type toggle */}
      <div className="flex items-center gap-1 bg-cyber-bg rounded-lg p-0.5 border border-cyber-border/50">
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            connectionType === 'wired' ? 'bg-cyber-panel text-cyber-text shadow-sm border border-cyber-border/50' : 'text-cyber-muted hover:text-cyber-text'
          }`}
          onClick={() => setConnectionType('wired')}
        >
          <Cable size={13} /> Ethernet
        </button>
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
            connectionType === 'wireless' ? 'bg-cyber-panel text-cyber-matrix shadow-sm border border-cyber-border/50' : 'text-cyber-muted hover:text-cyber-text'
          }`}
          onClick={() => setConnectionType('wireless')}
        >
          <Wifi size={13} /> Wireless
        </button>
      </div>

      {selectedNodeId && (
        <>
          <div className="h-5 w-px bg-cyber-border mx-1" />
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            onClick={onDeleteSelected}
            title="Delete selected (or press Delete key)"
          >
            <Trash2 size={13} /> Delete
          </button>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        {level !== 'ks3' && (
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              showLayers ? 'bg-amber-900/30 text-amber-400 ring-1 ring-amber-500/50' : 'text-cyber-text hover:bg-cyber-bg'
            }`}
            onClick={toggleLayers}
            title="Show TCP/IP layer for each device"
          >
            <Layers size={14} /> Layers
          </button>
        )}
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            infoOpen ? 'bg-cyan-900/30 text-cyan-400 ring-1 ring-cyan-500/50' : 'text-cyber-text hover:bg-cyber-bg'
          }`}
          onClick={onShowInfo}
        >
          <BookOpen size={14} /> Concepts
        </button>
        <a
          href="https://github.com/milesberry/networx" // Pode trocar para o seu repositório do NetMiski
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-muted hover:text-cyber-text transition-colors p-1"
        >
          <HelpCircle size={16} />
        </a>
      </div>
    </header>
  )
}

// ─── Right panel ──────────────────────────────────────────────────────────────

function SidePanel() {
  const { nodes, selectedNodeId, activePanel, setPanel } = useNetworkStore()
  const node = nodes.find((n) => n.id === selectedNodeId)
  const hasTerminal = node && ['pc', 'laptop', 'server', 'dns', 'web'].includes(node.data.deviceType)
  const hasBrowser  = node && ['pc', 'laptop', 'server'].includes(node.data.deviceType)

  if (!activePanel) return null

  function onClose() { setPanel(null) }

  return (
    <aside className="w-80 border-l border-cyber-border flex flex-col bg-cyber-panel flex-shrink-0 overflow-hidden">
      {activePanel !== 'info' && selectedNodeId && (
        <div className="flex border-b border-cyber-border bg-cyber-bg flex-shrink-0">
          <button
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activePanel === 'config'
                ? 'bg-cyber-panel text-cyber-matrix border-b-2 border-cyber-matrix'
                : 'text-cyber-muted hover:text-cyber-text'
            }`}
            onClick={() => setPanel('config')}
          >
            Configure
          </button>
          {hasTerminal && (
            <button
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activePanel === 'terminal'
                  ? 'bg-black text-cyber-matrix border-b-2 border-cyber-matrix'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
              onClick={() => setPanel('terminal')}
            >
              Terminal
            </button>
          )}
          {hasBrowser && (
            <button
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                activePanel === 'browser'
                  ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-cyber-muted hover:text-cyber-text'
              }`}
              onClick={() => setPanel('browser')}
            >
              Browser
            </button>
          )}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {activePanel === 'config'   && selectedNodeId && <ConfigPanel nodeId={selectedNodeId} onClose={onClose} />}
        {activePanel === 'terminal' && selectedNodeId && <Terminal    nodeId={selectedNodeId} onClose={onClose} />}
        {activePanel === 'browser'  && selectedNodeId && <Browser     nodeId={selectedNodeId} />}
        {activePanel === 'info'     && <InfoPanel onClose={onClose} />}
      </div>
    </aside>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function AppInner() {
  const {
    addDevice, selectNode, deleteSelected,
    connectionType, setConnectionType,
    selectedNodeId, activePanel, setPanel,
    showLayers, toggleLayers,
    level, setLevel,
  } = useNetworkStore()

  const [infoOpen, setInfoOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)

  function handleAddDevice(type: DeviceType) {
    addDevice(type, { x: 180 + Math.random() * 200, y: 130 + Math.random() * 200 })
  }

  function handleShowInfo() {
    const next = !infoOpen
    setInfoOpen(next)
    selectNode(null)
    setPanel(next ? 'info' : null)
  }

  return (
    <div className="app-shell flex flex-col h-screen overflow-hidden bg-cyber-bg text-cyber-text">
      <Toolbar
        connectionType={connectionType}
        setConnectionType={setConnectionType}
        onDeleteSelected={deleteSelected}
        onShowInfo={handleShowInfo}
        selectedNodeId={selectedNodeId}
        infoOpen={infoOpen}
        showLayers={showLayers}
        toggleLayers={toggleLayers}
        level={level}
        setLevel={setLevel}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Palette */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-200"
          style={{ width: paletteOpen ? 208 : 0 }}
        >
          {paletteOpen && <DevicePalette onAddDevice={handleAddDevice} level={level} />}
        </div>

        <button
          className="absolute z-20 bg-cyber-panel border border-cyber-border rounded-r-md p-1 shadow-sm hover:bg-cyber-bg transition-all duration-200 top-1/2 -translate-y-1/2"
          style={{ left: paletteOpen ? 208 : 0 }}
          onClick={() => setPaletteOpen((v) => !v)}
        >
          {paletteOpen
            ? <ChevronLeft size={14} className="text-cyber-muted" />
            : <ChevronRight size={14} className="text-cyber-muted" />}
        </button>

        <NetworkCanvas />

        {activePanel && <SidePanel />}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppInner />
    </ReactFlowProvider>
  )
}