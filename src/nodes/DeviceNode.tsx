import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Cloud,
  Globe,
  HardDrive,
  Home,
  Laptop,
  Monitor,
  Router,
  Server,
  Settings,
  Shield,
  Terminal as TermIcon,
  Wifi,
  Zap,
} from 'lucide-react'
import { useNetworkStore } from '../store'
import type { NetNode } from '../types'

// Cores no estilo Cyberpunk / Neon
const DEVICE_CONFIG = {
  pc:       { icon: Monitor,   color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.08)', label: 'PC' },         // Ciano Neon
  laptop:   { icon: Laptop,    color: '#f472b6', bg: 'rgba(244, 114, 182, 0.08)', label: 'Laptop' },     // Rosa Pastel
  server:   { icon: Server,    color: '#4ade80', bg: 'rgba(74, 222, 128, 0.08)', label: 'Server' },      // Verde Matrix
  router:   { icon: Router,    color: '#ff007f', bg: 'rgba(255, 0, 127, 0.08)', label: 'Router' },       // Rosa Choque
  switch:   { icon: HardDrive, color: '#facc15', bg: 'rgba(250, 204, 21, 0.08)', label: 'Switch' },      // Amarelo Neon
  hub:      { icon: Zap,       color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', label: 'Hub' },        // Cinza
  wap:      { icon: Wifi,      color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.08)', label: 'Access Point' },// Turquesa
  firewall: { icon: Shield,    color: '#b026ff', bg: 'rgba(176, 38, 255, 0.08)', label: 'Firewall' },    // Roxo Neon
  gateway:  { icon: Home,      color: '#818cf8', bg: 'rgba(129, 140, 248, 0.08)', label: 'Home Gateway' },// Azul Índigo
  dns:      { icon: Globe,     color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', label: 'DNS' },         // Azul Céu
  web:      { icon: Globe,     color: '#a3e635', bg: 'rgba(163, 230, 53, 0.08)', label: 'Web Server' },  // Verde Limão
  cloud:    { icon: Cloud,     color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.05)', label: 'Internet' },     // Ciano
} as const

export type DeviceType = keyof typeof DEVICE_CONFIG

const HANDLE_STYLE = {
  width: 8,
  height: 8,
  background: '#050505', // Fundo escuro
  border: '2px solid #00FF41', // Borda Verde Matrix
}

const LAYER_INFO: Record<string, { label: string; color: string; bg: string }> = {
  pc:       { label: 'L4 Application', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
  laptop:   { label: 'L4 Application', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
  server:   { label: 'L4 Application', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
  dns:      { label: 'L4 Application', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
  web:      { label: 'L4 Application', color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
  router:   { label: 'L2 Internet',    color: '#ff007f', bg: 'rgba(255, 0, 127, 0.15)' },
  firewall: { label: 'L2–L3',          color: '#b026ff', bg: 'rgba(176, 38, 255, 0.15)' },
  gateway:  { label: 'L1–L2',          color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  wap:      { label: 'L1 Link',        color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' },
  switch:   { label: 'L1 Link',        color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)' },
  hub:      { label: 'L1 Link',        color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  cloud:    { label: 'L2 Internet',    color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.15)' },
}

export default function DeviceNode({ id, data, selected }: NodeProps<NetNode>) {
  const { setPanel, selectNode, showLayers, level } = useNetworkStore()
  const cfg = DEVICE_CONFIG[data.deviceType] ?? DEVICE_CONFIG.pc
  const Icon = cfg.icon
  const hasTerminal = ['pc', 'laptop', 'server', 'dns', 'web'].includes(data.deviceType)
  const isCloud = data.deviceType === 'cloud'

  function openConfig() {
    selectNode(id)
    setPanel('config')
  }

  function openTerminal() {
    selectNode(id)
    setPanel('terminal')
  }

  return (
    <div className="relative flex flex-col items-center" style={{ minWidth: isCloud ? 110 : 90 }}>
      {/* Handles – all 4 sides */}
      <Handle type="target" position={Position.Top}    id="t"  style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Top}    id="st" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Left}   id="l"  style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Left}   id="sl" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Right}  id="r"  style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right}  id="sr" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} id="b"  style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Bottom} id="sb" style={HANDLE_STYLE} />

      {/* Device body */}
      <div
        className="rounded-xl shadow-lg flex flex-col items-center px-3 py-2 gap-1 cursor-pointer transition-all duration-200 backdrop-blur-sm"
        style={{
          background: isCloud
            ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 240, 255, 0.02) 100%)'
            : cfg.bg,
          border: selected
            ? `2px solid ${cfg.color}`
            : isCloud ? '2px dashed rgba(0, 240, 255, 0.5)' : `2px solid ${cfg.color}44`, // Borda sutil
          boxShadow: selected ? `0 0 15px ${cfg.color}66` : '0 4px 6px rgba(0,0,0,0.3)',
          opacity: data.isOn ? 1 : 0.4,
        }}
        onClick={openConfig}
      >
        {/* Power / status indicator */}
        {!isCloud && (
          <div className="absolute top-1 right-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ 
                background: data.isOn ? '#00FF41' : '#ef4444',
                boxShadow: data.isOn ? '0 0 5px #00FF41' : '0 0 5px #ef4444'
              }}
              title={data.isOn ? 'Online' : 'Offline'}
            />
          </div>
        )}

        <Icon size={isCloud ? 36 : 32} color={cfg.color} strokeWidth={1.5} />

        <span
          className="text-xs font-semibold text-center leading-tight tracking-wide"
          style={{ color: cfg.color, maxWidth: 90 }}
        >
          {data.label}
        </span>

        {isCloud ? (
          <span className="text-xs text-cyber-matrix font-mono opacity-80">WAN / ISP</span>
        ) : level === 'ks5' && (data.deviceType === 'router' || data.deviceType === 'gateway') && data.wanIp ? (
          <>
            <span className="text-[10px] text-cyber-matrix font-mono">LAN: {data.ip}</span>
            <span className="text-[10px] text-orange-400 font-mono">WAN: {data.wanIp}</span>
          </>
        ) : (
          data.ip && <span className="text-[10px] text-cyber-matrix font-mono">{data.ip}</span>
        )}

        {/* TCP/IP layer badge */}
        {showLayers && (() => {
          const l = LAYER_INFO[data.deviceType]
          return l ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none mt-1"
              style={{ background: l.bg, color: l.color, border: `1px solid ${l.color}44` }}>
              {l.label}
            </span>
          ) : null
        })()}

        {/* Action buttons */}
        {!isCloud && (
          <div className="flex gap-2 mt-1">
            <button
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Configure"
              onClick={(e) => { e.stopPropagation(); openConfig() }}
            >
              <Settings size={14} color={cfg.color} />
            </button>
            {hasTerminal && (
              <button
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Terminal"
                onClick={(e) => { e.stopPropagation(); openTerminal() }}
              >
                <TermIcon size={14} color={cfg.color} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}