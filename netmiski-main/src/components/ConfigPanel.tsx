import { Plus, Power, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useNetworkStore } from '../store'
import type { DnsRecord, FirewallRule } from '../types'

const LEVEL_ORDER = { ks3: 3, ks4: 4, ks5: 5 } as const
function atLeast(current: string, min: 'ks3' | 'ks4' | 'ks5') {
  return LEVEL_ORDER[current as keyof typeof LEVEL_ORDER] >= LEVEL_ORDER[min]
}

interface Props {
  nodeId: string
  onClose: () => void
}

function Field({ label, value, onChange, placeholder = '', mono = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-cyber-muted uppercase tracking-wide">{label}</label>
      <input
        className={`bg-cyber-bg border border-cyber-border rounded-md px-2.5 py-1.5 text-sm text-cyber-text outline-none focus:border-cyber-matrix focus:ring-1 focus:ring-cyber-matrix/50 transition-all ${mono ? 'font-mono' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function ConfigPanel({ nodeId, onClose }: Props) {
  const { nodes, updateNodeData, addRoute, removeRoute, addRule, removeRule, addDnsRecord, removeDnsRecord, level } = useNetworkStore()
  const node = nodes.find((n) => n.id === nodeId)
  const [tab, setTab] = useState<'basic' | 'advanced' | 'security' | 'wireless' | 'page' | 'records'>('basic')

  if (!node) return null

  const { data } = node
  const upd = (patch: Parameters<typeof updateNodeData>[1]) => updateNodeData(nodeId, patch)

  function handleAddRoute() {
    addRoute(nodeId, { destination: '10.0.0.0', subnet: '255.255.255.0', gateway: '0.0.0.0', iface: 'eth0', metric: 1 })
  }

  function handleAddDnsRecord() {
    addDnsRecord(nodeId, {
      id: `dr${Date.now()}`,
      hostname: 'host.local',
      ip: '192.168.1.',
    } satisfies DnsRecord)
  }

  function handleAddRule() {
    addRule(nodeId, {
      id: `r${Date.now()}`,
      direction: 'in',
      protocol: 'TCP',
      srcIp: '*',
      dstIp: '*',
      port: '80',
      action: 'allow',
    })
  }

  const isRouter = data.deviceType === 'router'
  const isSwitch = data.deviceType === 'switch'
  const isHub = data.deviceType === 'hub'
  const isWap = data.deviceType === 'wap'
  const isFirewall = data.deviceType === 'firewall'
  const isGateway = data.deviceType === 'gateway'
  const isWeb = data.deviceType === 'web'
  const isDns = data.deviceType === 'dns'
  const hasIp = !(isSwitch || isHub)

  const advanced = atLeast(level, 'ks4')
  const ks5 = atLeast(level, 'ks5')

  const TABS = [
    { id: 'basic',    label: 'Basic' },
    ...(isSwitch                        && advanced ? [{ id: 'advanced', label: 'MAC Table' }] : []),
    ...((isRouter   || isGateway)       && advanced ? [{ id: 'advanced', label: 'Routing' }]   : []),
    ...((isWap      || isGateway)       && advanced ? [{ id: 'wireless', label: 'Wireless' }]  : []),
    ...((isFirewall || isGateway)       && advanced ? [{ id: 'security', label: 'Security' }]  : []),
    ...(isWeb                           && advanced ? [{ id: 'page',     label: 'Page' }]       : []),
    ...(isDns                           && advanced ? [{ id: 'records',  label: 'Records' }]    : []),
  ] as { id: string; label: string }[]

  return (
    <div className="flex flex-col h-full bg-cyber-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border">
        <div>
          <h2 className="font-semibold text-cyber-text text-sm">{data.label}</h2>
          <span className="text-xs text-cyber-muted capitalize">{data.deviceType}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors border ${
              data.isOn 
                ? 'bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-900/50' 
                : 'bg-red-900/30 text-red-400 border-red-500/50 hover:bg-red-900/50'
            }`}
            onClick={() => upd({ isOn: !data.isOn })}
          >
            <Power size={11} />
            {data.isOn ? 'Online' : 'Offline'}
          </button>
          <button onClick={onClose} className="text-cyber-muted hover:text-cyber-text transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      {TABS.length > 1 && (
        <div className="flex border-b border-cyber-border px-4 bg-cyber-bg/50">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-cyber-matrix text-cyber-matrix'
                  : 'border-transparent text-cyber-muted hover:text-cyber-text'
              }`}
              onClick={() => setTab(t.id as typeof tab)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {tab === 'basic' && (
          <>
            <Field label="Label" value={data.label} onChange={(v) => upd({ label: v })} />
            {hasIp && (
              <>
                {(isRouter || isGateway) && ks5 && (
                  <Field label="WAN IP — eth0 (ISP-facing)" value={(data.wanIp as string) ?? ''} onChange={(v) => upd({ wanIp: v })} placeholder="e.g. 82.1.2.3" mono />
                )}
                <Field label={(isRouter || isGateway) && ks5 ? 'LAN IP — eth1 (network-facing)' : 'IP Address'} value={data.ip} onChange={(v) => upd({ ip: v })} placeholder="192.168.1.x" mono />
                {advanced && (
                  <>
                    <Field label="Subnet Mask" value={data.subnet} onChange={(v) => upd({ subnet: v })} placeholder="255.255.255.0" mono />
                    <Field label="Default Gateway" value={data.gateway} onChange={(v) => upd({ gateway: v })} placeholder="192.168.1.1" mono />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-cyber-muted uppercase tracking-wide">MAC Address</label>
                      <span className="font-mono text-sm text-cyber-matrix bg-cyber-bg rounded-md px-2.5 py-1.5 border border-cyber-border">
                        {data.mac}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
            
            {/* DHCP server section — routers and gateways, KS4+ */}
            {(isRouter || isGateway) && advanced && (
              <div className="border border-cyber-border rounded-lg p-3 space-y-3 bg-cyber-bg/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-cyber-text">DHCP Server</div>
                    <div className="text-xs text-cyber-muted">Auto-assign IPs to clients</div>
                  </div>
                  <button
                    role="switch"
                    aria-checked={!!data.dhcpEnabled}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                      data.dhcpEnabled ? 'bg-cyber-matrix' : 'bg-cyber-border'
                    }`}
                    onClick={() => upd({ dhcpEnabled: !data.dhcpEnabled })}
                    title="Toggle DHCP server"
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-bg shadow ring-0 transition-transform ${
                      data.dhcpEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                {data.dhcpEnabled && (
                  <>
                    <Field
                      label="IP Pool (last octet range)"
                      value={(data.dhcpPool as string) ?? '100-200'}
                      onChange={(v) => upd({ dhcpPool: v })}
                      placeholder="100-200"
                      mono
                    />
                    <p className="text-xs text-cyber-muted">
                      Clients run <code className="bg-cyber-bg text-cyber-matrix px-1 rounded font-mono border border-cyber-border">dhclient</code> or{' '}
                      <code className="bg-cyber-bg text-cyber-matrix px-1 rounded font-mono border border-cyber-border">ipconfig /renew</code> to get an IP from the pool.
                    </p>
                  </>
                )}
              </div>
            )}
            <Field label="Notes" value={data.notes} onChange={(v) => upd({ notes: v })} placeholder="Add notes..." />
          </>
        )}

        {tab === 'advanced' && (isRouter || isGateway) && (
          <div>
            {ks5 && (data.wanIp || data.ip) && (
              <div className="mb-3 text-xs text-cyber-matrix font-mono bg-cyber-bg rounded px-2.5 py-2 border border-cyber-border">
                eth0 (WAN) = {(data.wanIp as string) || '(not set)'}
                {'  ·  '}
                eth1 (LAN) = {data.ip || '(not set)'}
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cyber-text">Routing Table</h3>
              <button
                className="flex items-center gap-1 text-xs bg-cyber-bg text-cyber-matrix hover:bg-cyber-border border border-cyber-border px-2 py-1 rounded transition-colors"
                onClick={handleAddRoute}
              >
                <Plus size={12} /> Add Route
              </button>
            </div>
            <div className="space-y-2">
              {data.routingTable.map((route, i) => (
                <div key={i} className="bg-cyber-bg rounded-lg p-3 text-xs font-mono space-y-1.5 relative border border-cyber-border">
                  <button
                    className="absolute top-2 right-2 text-cyber-muted hover:text-red-400 transition-colors"
                    onClick={() => removeRoute(nodeId, i)}
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pr-5">
                    {(['destination', 'subnet', 'gateway', 'iface'] as const).map((field) => (
                      <div key={field}>
                        <div className="text-cyber-muted text-xs mb-1">{field}</div>
                        <input
                          className="w-full bg-cyber-panel border border-cyber-border rounded px-1.5 py-0.5 font-mono text-xs text-cyber-text focus:border-cyber-matrix outline-none"
                          value={route[field]}
                          onChange={(e) => {
                            const updated = data.routingTable.map((r, idx) =>
                              idx === i ? { ...r, [field]: e.target.value } : r
                            )
                            upd({ routingTable: updated })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {data.routingTable.length === 0 && (
                <p className="text-xs text-cyber-muted text-center py-4">No routes. Add a route above.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'advanced' && isSwitch && (
          <div>
            <h3 className="text-sm font-semibold text-cyber-text mb-3">MAC Address Table</h3>
            {data.macTable.length === 0 ? (
              <p className="text-xs text-cyber-muted text-center py-4">Table empty. MAC addresses are learnt as traffic flows.</p>
            ) : (
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-cyber-muted border-b border-cyber-border">
                    <th className="text-left py-1">MAC</th>
                    <th className="text-left py-1">Port</th>
                    <th className="text-left py-1">VLAN</th>
                  </tr>
                </thead>
                <tbody>
                  {data.macTable.map((e, i) => (
                    <tr key={i} className="border-b border-cyber-border/50">
                      <td className="py-1 text-cyber-matrix">{e.mac}</td>
                      <td className="py-1 text-cyber-text">{e.port}</td>
                      <td className="py-1 text-cyber-text">{e.vlan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'wireless' && (isWap || isGateway) && (
          <>
            <Field label="SSID (Network Name)" value={data.ssid} onChange={(v) => upd({ ssid: v })} />
            <Field label="WPA2 Key" value={data.wpaKey} onChange={(v) => upd({ wpaKey: v })} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-cyber-muted uppercase tracking-wide">Band</label>
              <div className="flex gap-2">
                {(['2.4GHz', '5GHz'] as const).map((b) => (
                  <button
                    key={b}
                    className={`flex-1 py-1.5 text-sm rounded-md border transition-colors ${
                      data.band === b
                        ? 'border-cyber-matrix bg-cyber-matrix/10 text-cyber-matrix font-medium'
                        : 'border-cyber-border text-cyber-muted hover:bg-cyber-bg'
                    }`}
                    onClick={() => upd({ band: b })}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <p className="text-xs text-cyber-muted mt-1">
                {data.band === '2.4GHz'
                  ? '2.4 GHz: longer range, slower, more interference'
                  : '5 GHz: shorter range, faster, less congestion'}
              </p>
            </div>
          </>
        )}

        {tab === 'page' && isWeb && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-cyber-muted">
              Edit the HTML served by this web server. Use{' '}
              <code className="bg-cyber-bg text-cyber-matrix px-1 rounded font-mono border border-cyber-border">curl {data.ip}</code>{' '}
              from a terminal to fetch it.
            </p>
            <textarea
              className="font-mono text-xs bg-[#050505] text-cyber-matrix p-3 rounded-lg resize-none outline-none border border-cyber-border focus:border-cyber-matrix transition-colors"
              style={{ height: '280px' }}
              value={data.pageContent ?? ''}
              onChange={(e) => upd({ pageContent: e.target.value })}
              spellCheck={false}
            />
          </div>
        )}

        {tab === 'records' && isDns && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-cyber-text">DNS Records (A)</h3>
              <button
                className="flex items-center gap-1 text-xs bg-cyber-bg text-cyber-matrix hover:bg-cyber-border border border-cyber-border px-2 py-1 rounded transition-colors"
                onClick={handleAddDnsRecord}
              >
                <Plus size={12} /> Add Record
              </button>
            </div>
            <p className="text-xs text-cyber-muted mb-3">
              Local hostnames resolved by this server. Use{' '}
              <code className="bg-cyber-bg text-cyber-matrix px-1 rounded font-mono border border-cyber-border">nslookup host.local</code>{' '}
              from any connected device.
            </p>
            <div className="space-y-2">
              {(data.dnsRecords ?? []).map((rec) => (
                <div key={rec.id} className="flex items-center gap-2 bg-cyber-bg rounded-lg px-3 py-2 relative border border-cyber-border">
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full font-mono text-xs border border-cyber-border rounded px-1.5 py-0.5 mb-1 bg-cyber-panel text-cyber-text focus:border-cyber-matrix outline-none"
                      placeholder="hostname.local"
                      value={rec.hostname}
                      onChange={(e) => {
                        const updated = (data.dnsRecords ?? []).map((r) =>
                          r.id === rec.id ? { ...r, hostname: e.target.value } : r
                        )
                        upd({ dnsRecords: updated })
                      }}
                    />
                    <input
                      className="w-full font-mono text-xs border border-cyber-border rounded px-1.5 py-0.5 bg-cyber-panel text-cyber-text focus:border-cyber-matrix outline-none"
                      placeholder="192.168.1.x"
                      value={rec.ip}
                      onChange={(e) => {
                        const updated = (data.dnsRecords ?? []).map((r) =>
                          r.id === rec.id ? { ...r, ip: e.target.value } : r
                        )
                        upd({ dnsRecords: updated })
                      }}
                    />
                  </div>
                  <button
                    className="text-cyber-muted hover:text-red-400 transition-colors flex-shrink-0"
                    onClick={() => removeDnsRecord(nodeId, rec.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {(data.dnsRecords ?? []).length === 0 && (
                <p className="text-xs text-cyber-muted text-center py-4">
                  No records. Add an A record above.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'security' && (isFirewall || isGateway) && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-cyber-text">Firewall Rules</h3>
              <button
                className="flex items-center gap-1 text-xs bg-cyber-bg text-cyber-matrix hover:bg-cyber-border border border-cyber-border px-2 py-1 rounded transition-colors"
                onClick={handleAddRule}
              >
                <Plus size={12} /> Add Rule
              </button>
            </div>
            <p className="text-xs text-cyber-muted mb-3">Rules are evaluated top-to-bottom. First match wins.</p>
            <div className="space-y-2">
              {data.rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`rounded-lg p-3 text-xs space-y-2 relative border ${
                    rule.action === 'allow' 
                      ? 'border-cyber-matrix/50 bg-cyber-matrix/5' 
                      : 'border-[#ff007f]/50 bg-[#ff007f]/5'
                  }`}
                >
                  <button
                    className="absolute top-2 right-2 text-cyber-muted hover:text-red-400 transition-colors"
                    onClick={() => removeRule(nodeId, rule.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="grid grid-cols-3 gap-2 pr-5">
                    {/* Direction */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Direction</div>
                      <select
                        className="w-full border border-cyber-border rounded px-1 py-0.5 text-xs bg-cyber-bg text-cyber-text outline-none focus:border-cyber-matrix"
                        value={rule.direction}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, direction: e.target.value as FirewallRule['direction'] } : r
                          )
                          upd({ rules: updated })
                        }}
                      >
                        <option value="in">Inbound</option>
                        <option value="out">Outbound</option>
                      </select>
                    </div>
                    {/* Protocol */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Protocol</div>
                      <select
                        className="w-full border border-cyber-border rounded px-1 py-0.5 text-xs bg-cyber-bg text-cyber-text outline-none focus:border-cyber-matrix"
                        value={rule.protocol}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, protocol: e.target.value as FirewallRule['protocol'] } : r
                          )
                          upd({ rules: updated })
                        }}
                      >
                        {['TCP', 'UDP', 'ICMP', 'ANY'].map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    {/* Port */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Port</div>
                      <input
                        className="w-full border border-cyber-border rounded px-1 py-0.5 text-xs font-mono bg-cyber-bg text-cyber-text outline-none focus:border-cyber-matrix"
                        value={rule.port}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, port: e.target.value } : r
                          )
                          upd({ rules: updated })
                        }}
                        placeholder="80 or *"
                      />
                    </div>
                    {/* Src IP */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Source IP</div>
                      <input
                        className="w-full border border-cyber-border rounded px-1 py-0.5 text-xs font-mono bg-cyber-bg text-cyber-text outline-none focus:border-cyber-matrix"
                        value={rule.srcIp}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, srcIp: e.target.value } : r
                          )
                          upd({ rules: updated })
                        }}
                        placeholder="* or IP"
                      />
                    </div>
                    {/* Dst IP */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Dest IP</div>
                      <input
                        className="w-full border border-cyber-border rounded px-1 py-0.5 text-xs font-mono bg-cyber-bg text-cyber-text outline-none focus:border-cyber-matrix"
                        value={rule.dstIp}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, dstIp: e.target.value } : r
                          )
                          upd({ rules: updated })
                        }}
                        placeholder="* or IP"
                      />
                    </div>
                    {/* Action */}
                    <div>
                      <div className="text-cyber-muted mb-0.5">Action</div>
                      <select
                        className={`w-full border rounded px-1 py-0.5 text-xs font-semibold outline-none ${
                          rule.action === 'allow' 
                            ? 'border-cyber-matrix/50 bg-cyber-matrix/10 text-cyber-matrix' 
                            : 'border-[#ff007f]/50 bg-[#ff007f]/10 text-[#ff007f]'
                        }`}
                        value={rule.action}
                        onChange={(e) => {
                          const updated = data.rules.map((r) =>
                            r.id === rule.id ? { ...r, action: e.target.value as FirewallRule['action'] } : r
                          )
                          upd({ rules: updated })
                        }}
                      >
                        <option value="allow">Allow</option>
                        <option value="deny">Deny</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}