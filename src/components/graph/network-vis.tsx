"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, Maximize2, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface NetworkVisProps {
  nodes: any[]
  edges: any[]
  highlightedNodeIds?: string[]
  highlightedEdges?: { from: string; to: string }[]
  isOverlayActive?: boolean
}

export function NetworkVis({ nodes, edges, highlightedNodeIds = [], highlightedEdges = [], isOverlayActive = false }: NetworkVisProps) {
  const { toast } = useToast()
  const [selectedNode, setSelectedNode] = React.useState<any>(null)
  const [zoom, setZoom] = React.useState(1)
  const [offset, setOffset] = React.useState({ x: 0, y: 0 })

  // Normalize node/edge ids and ensure coordinates exist so graph always renders
  const normalizedNodes = React.useMemo(() => {
    const center = { x: 400, y: 300 }
    return nodes.map((n, i) => {
      const id = String(n.id)
      const x = typeof n.x === 'number' ? n.x : center.x + Math.round(Math.cos((i / Math.max(1, nodes.length)) * Math.PI * 2) * (150 + (i % 3) * 30))
      const y = typeof n.y === 'number' ? n.y : center.y + Math.round(Math.sin((i / Math.max(1, nodes.length)) * Math.PI * 2) * (150 + (i % 3) * 30))
      return { ...n, id, x, y }
    })
  }, [nodes])

  const normalizedEdges = React.useMemo(() => {
    return edges.map(e => ({ ...e, from: String(e.from), to: String(e.to) }))
  }, [edges])

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    toast({ title: "View Reset", description: "Network graph viewport has been centered." })
  }

  return (
    <div className="relative h-full w-full bg-[#05060a] rounded-xl overflow-hidden border border-white/5 shadow-inner select-none">
      {/* Visual Canvas Area */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="h-full w-full bg-[radial-gradient(#1a1f2e_1px,transparent_1px)]" 
          style={{ 
            backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            backgroundPosition: `${offset.x}px ${offset.y}px`
          }} 
        />
      </div>

      {/* SVG Interaction Layer */}
      <motion.svg 
        className="h-full w-full"
        animate={{ 
          scale: zoom,
          translateX: offset.x,
          translateY: offset.y
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" opacity="0.5" />
          </marker>
        </defs>

        {/* Edges */}
        {normalizedEdges.map((edge, idx) => {
          const fromNode = normalizedNodes.find(n => n.id === edge.from)
          const toNode = normalizedNodes.find(n => n.id === edge.to)
          if (!fromNode || !toNode) return null
          
          const isHighlighted = highlightedEdges.some(e => String(e.from) === String(edge.from) && String(e.to) === String(edge.to))
          const isOverlayMode = isOverlayActive && highlightedEdges.length > 0
          const shouldDim = isOverlayMode && !isHighlighted

          return (
            <g key={`edge-${idx}`}>
              {/* Glow effect for highlighted edges */}
              {isHighlighted && isOverlayMode && (
                <>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="hsl(var(--destructive))"
                    strokeWidth={8}
                    opacity="0.15"
                    className="animate-pulse"
                  />
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="hsl(var(--destructive))"
                    strokeWidth={4}
                    opacity="0.3"
                    className="animate-pulse"
                    style={{ animationDelay: "0.1s" }}
                  />
                </>
              )}
              
              {/* Main edge line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isHighlighted && isOverlayMode ? "hsl(var(--destructive))" : edge.color === "destructive" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"}
                strokeWidth={isHighlighted && isOverlayMode ? 3 : edge.color === "destructive" ? 2 : 1}
                strokeDasharray={isHighlighted || edge.color === "destructive" ? "0" : "5,5"}
                opacity={shouldDim ? "0.05" : isHighlighted ? "0.8" : "0.3"}
                markerEnd="url(#arrowhead)"
              />
              
              {/* Flow animation dots for highlighted edges */}
              {isHighlighted && isOverlayMode && (
                <>
                      {[0.25, 0.5, 0.75].map((t, i) => (
                    <motion.circle
                      key={`flow-${idx}-${i}`}
                      cx={fromNode.x + (toNode.x - fromNode.x) * t}
                      cy={fromNode.y + (toNode.y - fromNode.y) * t}
                      r={3}
                      fill="hsl(var(--destructive))"
                      animate={{
                        x: (toNode.x - fromNode.x) * 0.5,
                        y: (toNode.y - fromNode.y) * 0.5,
                        opacity: [0.8, 0.3, 0.8]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity
                      }}
                    />
                  ))}
                </>
              )}
              
              {/* Transaction amount label */}
              {!shouldDim && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  className="text-[10px] font-code fill-muted-foreground/80 font-bold"
                  textAnchor="middle"
                  opacity={shouldDim ? "0.1" : "1"}
                >
                  {edge.amount}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {normalizedNodes.map((node) => {
          const isHighlighted = highlightedNodeIds.map(String).includes(String(node.id))
          const isOverlayMode = isOverlayActive && highlightedNodeIds.length > 0
          const shouldDim = isOverlayMode && !isHighlighted
          
          return (
          <motion.g
            key={node.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: shouldDim ? 1 : 1.1 }}
            className="cursor-pointer"
            onClick={() => !shouldDim && setSelectedNode(node)}
          >
            {/* Glow effect for highlighted nodes */}
            {isHighlighted && isOverlayMode && (
              <>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={45}
                  className="fill-none stroke-destructive/40 stroke-1 animate-pulse"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={55}
                  className="fill-none stroke-destructive/20 stroke-1"
                  style={{ animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite", animationDelay: "0.15s" }}
                />
              </>
            )}
            
            {/* Main node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={25}
              className={cn(
                "stroke-2 transition-all",
                shouldDim ? "fill-muted/5 stroke-muted/20" :
                isHighlighted && isOverlayMode ? "fill-destructive/40 stroke-destructive" :
                node.type === "target" ? "fill-primary/20 stroke-primary" : 
                node.type === "suspicious" ? "fill-destructive/20 stroke-destructive" : 
                "fill-emerald-500/10 stroke-emerald-500"
              )}
              opacity={shouldDim ? "0.3" : "1"}
            />
            
            {/* Risk indicator pulse */}
            {node.risk > 70 && !shouldDim && (
               <circle
                  cx={node.x}
                  cy={node.y}
                  r={35}
                  className="fill-none stroke-destructive/30 stroke-1 animate-ping"
                  opacity={shouldDim ? "0" : "1"}
                />
            )}
            
            {/* Enhanced pulse for highlighted nodes */}
            {isHighlighted && isOverlayMode && (
              <circle
                cx={node.x}
                cy={node.y}
                r={28}
                className="fill-none stroke-destructive/50 stroke-2 animate-pulse"
              />
            )}
            
            {/* Node label */}
            <text
              x={node.x}
              y={node.y + 45}
              className="text-[11px] font-headline font-semibold fill-foreground/90 transition-all"
              textAnchor="middle"
              opacity={shouldDim ? "0.2" : "0.9"}
            >
              {node.label}
            </text>
            
            {/* Risk score */}
            <text
              x={node.x}
              y={node.y + 5}
              className="text-[10px] font-code fill-foreground/60 transition-all"
              textAnchor="middle"
              opacity={shouldDim ? "0.1" : isHighlighted && isOverlayMode ? "1" : "0.6"}
              fontWeight={isHighlighted && isOverlayMode ? "bold" : "normal"}
            >
              {node.risk}%
            </text>
          </motion.g>
          )
        })}
      </motion.svg>

      {/* Control Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" className="glass h-8 w-8" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
        <Button size="icon" variant="secondary" className="glass h-8 w-8" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
        <Button size="icon" variant="secondary" className="glass h-8 w-8" onClick={handleReset}><RefreshCw className="h-4 w-4" /></Button>
        <Button size="icon" variant="secondary" className="glass h-8 w-8" onClick={() => toast({ title: "Fullscreen", description: "Toggling immersive investigation view." })}><Maximize2 className="h-4 w-4" /></Button>
      </div>

      {/* Legend & Info Overlay */}
      <div className="absolute bottom-4 right-4 max-w-xs space-y-3">
        {selectedNode ? (
          <div className="glass p-4 rounded-lg border-primary/30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-primary tracking-widest">Entity Intel</span>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedNode(null)}>&times;</Button>
            </div>
            <h4 className="font-headline font-bold text-sm mb-1">{selectedNode.label}</h4>
            <div className="flex items-center gap-2 mb-3">
               <div className={cn(
                 "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                 selectedNode.risk > 70 ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-500"
               )}>
                 Risk Index: {selectedNode.risk}
               </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal mb-3">
              Detected unusual velocity of outbound transfers. Connections found to sanctioned entities via multi-hop path analysis.
            </p>
            <Button 
              size="sm" 
              className="w-full h-8 text-xs bg-primary hover:bg-primary/90"
              onClick={() => toast({ title: "Trace Initialized", description: `Tracing ${selectedNode.label} across 14 jurisdictions.` })}
            >
              Run Full Trace
            </Button>
          </div>
        ) : (
          <div className="glass p-3 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary" /> Target / Subject
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-destructive" /> Suspicious Hub
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-3 w-3 text-destructive" /> Cluster Warning
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border-primary/20">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Graph Reasoning Active</span>
        </div>
      </div>
    </div>
  )
}
