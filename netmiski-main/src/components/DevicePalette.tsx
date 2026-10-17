import { Cloud, Globe, HardDrive, Home, Laptop, Monitor, Router, Server, Shield, Wifi, Zap } from 'lucide-react'
import type { DeviceType, Level } from '../types'

interface DeviceDef {
  type: DeviceType
  label: string
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
  color: string
  bg: string
  description: string
  minLevel: Level
}

// minLevel = the lowest level at which this device is available
const DEVICES: DeviceDef[] = [
  { type: 'pc',       label: 'PC',           icon: Monitor,   color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', description: 'Workstation with terminal',  minLevel: 'ks3' },
  { type: 'laptop',   label: 'Laptop',       icon: Laptop,    color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', description: 'Portable workstation',       minLevel: 'ks3' },
  { type: 'server',   label: 'Server',       icon: Server,    color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', description: 'General-purpose server',     minLevel: 'ks3' },
  { type: 'router',   label: 'Router',       icon: Router,    color: '#ff007f', bg: 'rgba(255, 0, 127, 0.1)', description: 'Routes between networks',    minLevel: 'ks3' },
  { type: 'switch',   label: 'Switch',       icon: HardDrive, color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', description: 'Connects LAN devices',       minLevel: 'ks3' },
  { type: 'wap',      label: 'Access Point', icon: Wifi,      color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.1)', description: 'Wireless access point',      minLevel: 'ks3' },
  { type: 'firewall', label: 'Firewall',     icon: Shield,    color: '#b026ff', bg: 'rgba(176, 38, 255, 0.1)', description: 'Filters network traffic',    minLevel: 'ks4' },
  { type: 'gateway',  label: 'Home Gateway', icon: Home,      color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)', description: 'Router + switch + Wi-Fi + firewall', minLevel: 'ks4' },
  { type: 'dns',      label: 'DNS Server',   icon: Globe,     color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', description: 'Resolves domain names',      minLevel: 'ks4' },
  { type: 'web',      label: 'Web Server',   icon: Globe,     color: '#a3e635', bg: 'rgba(163, 230, 53, 0.1)', description: 'Serves HTTP pages',          minLevel: 'ks4' },
  { type: 'cloud',    label: 'Internet',     icon: Cloud,     color: '#00f0ff', bg: 'rgba(0, 240, 255, 0.1)', description: 'WAN / ISP cloud',            minLevel: 'ks4' },
  { type: 'hub',      label: 'Hub',          icon: Zap,       color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', description: 'Broadcasts to all ports',    minLevel: 'ks5' },
]

const LEVEL_ORDER: Record<Level, number> = { ks3: 3, ks4: 4, ks5: 5 }

interface Props {
  onAddDevice: (type: DeviceType) => void
  level: Level
}

export default function DevicePalette({ onAddDevice, level }: Props) {
  const visible = DEVICES.filter((d) => LEVEL_ORDER[d.minLevel] <= LEVEL_ORDER[level])

  function handleDragStart(e: React.DragEvent, type: DeviceType) {
    e.dataTransfer.setData('application/networx-device', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <aside className="w-52 bg-cyber-panel border-r border-cyber-border flex flex-col h-full overflow-y-auto select-none custom-scrollbar">
      <div className="px-3 py-3 border-b border-cyber-border">
        <h2 className="text-xs font-bold text-cyber-muted uppercase tracking-wider">Devices</h2>
        <p className="text-xs text-cyber-muted/70 mt-0.5">Drag onto canvas, or click to add</p>
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        {visible.map((dev) => {
          const Icon = dev.icon
          return (
            <div
              key={dev.type}
              className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-cyber-bg border border-transparent hover:border-cyber-matrix/30 transition-all cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, dev.type)}
              onClick={() => onAddDevice(dev.type)}
              title={dev.description}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onAddDevice(dev.type)}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5 group-hover:border-cyber-matrix/20 transition-colors"
                style={{ background: dev.bg }}
              >
                <Icon size={18} color={dev.color} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-cyber-text truncate group-hover:text-cyber-matrix transition-colors">{dev.label}</div>
                <div className="text-xs text-cyber-muted leading-tight truncate opacity-80">{dev.description}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-3 py-3 mt-auto border-t border-cyber-border">
        <p className="text-xs text-cyber-muted leading-relaxed opacity-80">
          Drag handles between nodes to connect. Toggle Ethernet / Wireless before connecting.
        </p>
      </div>
    </aside>
  )
}