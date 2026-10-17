import type { EdgeProps } from '@xyflow/react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react'
import { useEffect, useRef } from 'react'
import { useNetworkStore } from '../store'
import type { PacketAnim } from '../types'

// Cores neon para os protocolos
const PROTOCOL_COLORS: Record<string, string> = {
  ICMP: '#ff9f1c',  // Laranja neon
  HTTP: '#00f0ff',  // Ciano neon
  DNS:  '#b026ff',  // Roxo neon
  TCP:  '#00FF41',  // Verde Matrix
  UDP:  '#facc15',  // Amarelo neon
}

// Separate component so useEffect fires correctly on mount
function PacketDot({ edgePath, packet }: { edgePath: string; packet: PacketAnim }) {
  const ref = useRef<SVGAnimationElement>(null)
  const isBlocked = packet.isBlocked
  const color = isBlocked ? '#ff007f' : (PROTOCOL_COLORS[packet.protocol] ?? '#6b7280')

  useEffect(() => {
    ref.current?.beginElement()
  }, [])

  return (
    <g>
      <animateMotion
        ref={ref as React.RefObject<SVGAnimateMotionElement>}
        path={edgePath}
        dur={`${packet.durationMs}ms`}
        begin="indefinite"
        fill="freeze"
        repeatCount="1"
        {...(packet.reverse ? { keyPoints: '1;0', keyTimes: '0;1', calcMode: 'linear' } : {})}
      />
      
      {isBlocked ? (
        // Visual de Bloqueio: Um X vermelho com efeito de explosão
        <g>
          <circle r={12} fill={color} opacity={0.3} className="animate-ping" />
          <circle r={6} fill="#050505" stroke={color} strokeWidth={2} />
          <path d="M-3,-3 L3,3 M3,-3 L-3,3" stroke={color} strokeWidth={2} />
        </g>
      ) : (
        // Visual Normal: Bolinha colorida
        <>
          <circle r={5} fill={color} stroke="#050505" strokeWidth={1.5} cx={0} cy={0} />
          <circle r={8} fill={color} opacity={0.2} className="animate-pulse" cx={0} cy={0} />
        </>
      )}

      <text
        fontSize={9}
        fill={color}
        fontWeight="bold"
        textAnchor="middle"
        dy={-12}
        stroke="#050505"
        strokeWidth={3}
        paintOrder="stroke"
        className="font-mono tracking-wider"
      >
        {packet.label}
      </text>
    </g>
  )
}

export default function DeletableEdge({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  style,
  label,
  selected,
  markerEnd,
}: EdgeProps) {
  const onEdgesChange = useNetworkStore((s) => s.onEdgesChange)
  const activePackets = useNetworkStore((s) => s.activePackets)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const myPackets = activePackets.filter((p) => p.edgeId === id)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    onEdgesChange([{ type: 'remove', id }])
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label && (
            <span className="text-xs bg-cyber-panel/90 px-1.5 py-0.5 rounded border border-cyber-border text-cyber-matrix font-medium shadow-sm font-mono">
              {label as string}
            </span>
          )}
          {selected && (
            <button
              onClick={handleDelete}
              className="w-5 h-5 bg-cyber-panel rounded-full border border-[#ff007f]/50 text-[#ff007f] hover:bg-[#ff007f]/20 hover:text-white text-sm flex items-center justify-center shadow-sm transition-colors"
              title="Delete connection"
            >
              ×
            </button>
          )}
        </div>
      </EdgeLabelRenderer>

      {myPackets.map((packet) => (
        <PacketDot key={packet.id} edgePath={edgePath} packet={packet} />
      ))}
    </>
  )
}