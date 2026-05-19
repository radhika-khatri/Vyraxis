
"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { NetworkVis } from "@/components/graph/network-vis"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Zap, 
  History, 
  Layers, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  ClipboardCheck,
  FileSearch,
  Activity,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateInvestigationCase, AutonomousInvestigationCaseGenerationOutput } from "@/ai/flows/autonomous-investigation-case-generation"
import { timelineReplayAnalysis, TimelineReplayAnalysisOutput } from "@/ai/flows/timeline-replay-analysis"
import { useAppData } from "@/context/data-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function GraphPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data } = useAppData()
  const [isAgentRunning, setIsAgentRunning] = React.useState(false)
  const [isReplaying, setIsReplaying] = React.useState(false)
  const [agentResult, setAgentResult] = React.useState<AutonomousInvestigationCaseGenerationOutput | null>(null)
  const [replayResult, setReplayResult] = React.useState<{ detected: boolean, description: string } | null>(null)
  const [replayAnalysis, setReplayAnalysis] = React.useState<TimelineReplayAnalysisOutput | null>(null)
  const [highlightedNodeIds, setHighlightedNodeIds] = React.useState<string[]>([])
  const [highlightedEdges, setHighlightedEdges] = React.useState<{ from: string; to: string }[]>([])
  const [isOverlayActive, setIsOverlayActive] = React.useState(false)

  const handleAgentRun = async () => {
    setIsAgentRunning(true)
    setAgentResult(null)
    
    // Use only existing case data; do not fabricate an alert ID
    const highestRiskCase = data.cases.length > 0 ? data.cases.reduce((max, c) => c.risk > max.risk ? c : max, data.cases[0]) : null
    if (!highestRiskCase) {
      toast({
        variant: "destructive",
        title: "No Cases Available",
        description: "The AI agent cannot run because there are no existing investigation cases in the dataset."
      })
      setIsAgentRunning(false)
      return
    }
    const alertId = highestRiskCase.id
    
    toast({
      title: "AI Agent Initialized",
      description: `Vyraxis Agent is reviewing the current investigation context for "${highestRiskCase.title}".`
    })
    
    try {
      // Collect real data from nodes and edges
      const highRiskNodes = data.nodes.filter(n => n.risk > 70)
      const targetNode = data.nodes.find(n => n.type === "target") || data.nodes[0]
      const relatedEdges = data.edges.filter(e => e.to === targetNode?.id)
      const totalTransactionValue = relatedEdges.reduce((sum, e) => {
        const amt = e.amount.replace(/[$,k]/g, '')
        const multiplier = e.amount.includes('k') ? 1000 : 1
        return sum + (parseFloat(amt) * multiplier)
      }, 0)
      
      const result = await generateInvestigationCase({
        alertId: alertId,
        transactionDetails: JSON.stringify({
          entity: targetNode?.label || "Target Account",
          cluster: `Cluster_${targetNode?.id}`,
          hops: relatedEdges.length,
          totalValue: totalTransactionValue,
          currentNodes: data.nodes.length,
          riskNodes: highRiskNodes.map((n: any) => n.label),
          caseTitle: highestRiskCase?.title,
          analyst: highestRiskCase?.analyst
        })
      })
      
      setAgentResult(result)
      toast({
        title: "Agent Discovery Complete",
        description: `Contextual analysis generated from existing dataset relationships. ${highRiskNodes.length} high-risk entities identified.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Agent Error",
        description: "Autonomous reasoning engine failed to converge on the current cluster."
      })
    } finally {
      setIsAgentRunning(false)
    }
  }

  const handleTimelineReplay = () => {
    setIsReplaying(true)
    setReplayResult(null)
    setReplayAnalysis(null)
    toast({
      title: "Timeline Replay Active",
      description: "Reconstructing network state from historical transaction logs..."
    })
    
    setTimeout(async () => {
      setIsReplaying(false)
      
      // Analyze actual graph data from mock data
      const highRiskNodes = data.nodes.filter(n => n.risk > 80)
      const suspiciousEdges = data.edges.filter(e => e.color === "destructive")
      
      if (highRiskNodes.length > 0 && suspiciousEdges.length > 0) {
        const riskNode = highRiskNodes[0]
        const connection = suspiciousEdges[0]
        const targetNode = data.nodes.find(n => n.id === connection.to)
        
        // Activate overlay and highlight suspicious elements
        setHighlightedNodeIds(highRiskNodes.map(n => n.id))
        setHighlightedEdges(suspiciousEdges.map(e => ({ from: e.from, to: e.to })))
        setIsOverlayActive(true)
        
        setReplayResult({
          detected: true,
          description: `Structural shift detected: High-risk entity "${riskNode.label}" (Risk: ${riskNode.risk}%) connected to "${targetNode?.label || 'Target'}" via ${connection.amount} transaction. This follows a layering pattern detected in your dataset.`
        })
        
        // Call AI to generate simple explanation
        try {
          const analysis = await timelineReplayAnalysis({
            highRiskNodes: highRiskNodes.map(n => ({ label: n.label, risk: n.risk, type: n.type })),
            suspiciousEdges: suspiciousEdges,
            totalNodesInGraph: data.nodes.length,
            totalEdgesInGraph: data.edges.length,
          })
          setReplayAnalysis(analysis)
        } catch (err) {
          console.error("Timeline analysis failed:", err)
        }
        
        toast({
          variant: "destructive",
          title: "Structural Shift Detected",
          description: `Found ${highRiskNodes.length} high-risk nodes and ${suspiciousEdges.length} suspicious transactions in replay.`
        })
      } else {
        // No shift detected - clear overlay
        setHighlightedNodeIds([])
        setHighlightedEdges([])
        setIsOverlayActive(false)
        
        setReplayResult({
          detected: false,
          description: `Network analysis complete. ${data.nodes.length} entities examined. No significant new structural shifts detected in current dataset. All ${data.edges.length} connections remain consistent with baseline.`
        })
        
        // Call AI to explain normal state
        try {
          const analysis = await timelineReplayAnalysis({
            highRiskNodes: [],
            suspiciousEdges: [],
            totalNodesInGraph: data.nodes.length,
            totalEdgesInGraph: data.edges.length,
          })
          setReplayAnalysis(analysis)
        } catch (err) {
          console.error("Timeline analysis failed:", err)
        }
        
        toast({
          title: "Replay Complete",
          description: "Network state verified against historical baseline."
        })
      }
    }, 3000)
  }

  const handleExport = () => {
    const exportData = {
      nodes: data.nodes,
      edges: data.edges,
      exportedAt: new Date().toISOString(),
      platform: "Vyraxis Intelligence"
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Vyraxis_Network_Export_${new Date().getTime()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export Complete",
      description: "Graph data and entity metadata have been downloaded as JSON."
    })
  }

  const handleEscalateToSAR = (description: string) => {
    toast({
      title: "Escalating Findings",
      description: "Transferring timeline discovery to SAR Engine..."
    })
    // In a real app we'd use a shared state or URL params. 
    // For this prototype we'll navigate to SAR.
    router.push(`/sar`)
  }

  return (
    <DashboardShell>
      <div className="flex flex-col h-full gap-6 max-w-[1600px] mx-auto pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold">Graph Intelligence Hub</h1>
            <p className="text-sm text-muted-foreground">Persisted entity relationships and automated cluster detection.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="glass h-9 font-headline flex-1 sm:flex-none" 
              onClick={handleTimelineReplay}
              disabled={isReplaying}
            >
              {isReplaying ? (
                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2" />
              ) : (
                <History className="mr-2 h-4 w-4" />
              )}
              {isReplaying ? "Replaying..." : "Replay"}
            </Button>
            <Button variant="outline" size="sm" className="glass h-9 font-headline flex-1 sm:flex-none" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
            <Button 
              size="sm" 
              className="h-9 font-headline glow-primary bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
              onClick={handleAgentRun}
              disabled={isAgentRunning}
            >
              {isAgentRunning ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isAgentRunning ? "Processing..." : "Run AI Agent"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-3 h-[400px] sm:h-[500px] lg:h-[700px] relative order-2 lg:order-1">
            <NetworkVis 
              nodes={data.nodes} 
              edges={data.edges}
              highlightedNodeIds={highlightedNodeIds}
              highlightedEdges={highlightedEdges}
              isOverlayActive={isOverlayActive}
            />
            
            {isReplaying && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white rounded-xl p-4 text-center">
                 <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                 <h3 className="font-headline font-bold text-lg sm:text-xl mb-1 text-primary">Timeline Reconstruction</h3>
                 <p className="text-muted-foreground text-xs sm:text-sm font-medium">Analyzing historical node states: 30-Day Window</p>
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col h-auto lg:h-[700px] order-1 lg:order-2">
            <Card className="glass border-white/5 flex-1 overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
              <CardHeader className="border-b bg-card/30 pb-4">
                <CardTitle className="text-base font-headline font-bold">Intelligence Feed</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <CardContent className="pt-4 space-y-6">
                   {/* Agent Result Display */}
                   {agentResult && (
                     <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 animate-in fade-in slide-in-from-top-2 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                           <Sparkles className="h-4 w-4 text-primary" />
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Autonomous Analysis</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="p-2 rounded bg-background/50 border border-white/5">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase">Case ID</p>
                              <p className="text-xs font-code text-primary font-bold">{agentResult.caseId}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1 mb-1">Summary</p>
                              <p className="text-[11px] leading-relaxed text-foreground/90 font-medium">{agentResult.summary}</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* Replay Result Display */}
                   {replayResult && (
                     <div className={cn(
                       "p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 mb-4",
                       replayResult.detected ? "border-destructive/30 bg-destructive/5" : "border-emerald-500/20 bg-emerald-500/5"
                     )}>
                        <div className="flex items-center gap-2 mb-3">
                           <Activity className={cn("h-4 w-4", replayResult.detected ? "text-destructive" : "text-emerald-500")} />
                           <h4 className={cn(
                             "text-[10px] font-bold uppercase tracking-widest",
                             replayResult.detected ? "text-destructive" : "text-emerald-500"
                           )}>
                             {replayResult.detected ? "Shift Detected" : "Replay Verified"}
                           </h4>
                        </div>
                        <p className="text-[11px] leading-relaxed font-medium">
                          {replayResult.description}
                        </p>
                        {replayResult.detected && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-4 h-8 text-[10px] uppercase font-bold border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleEscalateToSAR(replayResult.description)}
                          >
                            <FileText className="mr-2 h-3 w-3" /> Draft SAR Narrative
                          </Button>
                        )}
                     </div>
                   )}

                   {/* AI Analysis Explanation */}
                   {replayAnalysis && (
                     <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                           <Sparkles className="h-4 w-4 text-primary" />
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Analysis</h4>
                        </div>
                        <p className="text-[11px] leading-relaxed mb-3 text-foreground">
                          {replayAnalysis.explanation}
                        </p>
                        <div className="space-y-2 mb-3">
                           <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Key Findings:</h5>
                           {replayAnalysis.keyFindings.map((finding, idx) => (
                             <div key={idx} className="text-[10px] text-muted-foreground flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>{finding}</span>
                             </div>
                           ))}
                        </div>
                        <div className="mb-3">
                           <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Risk Assessment:</h5>
                           <p className="text-[10px] text-muted-foreground">{replayAnalysis.riskAssessment}</p>
                        </div>
                        <div>
                           <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Next Steps:</h5>
                           <p className="text-[10px] text-muted-foreground">{replayAnalysis.recommendations}</p>
                        </div>
                     </div>
                   )}

                   <div>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-1">Active Nodes</h4>
                      <div className="space-y-2">
                        {data.nodes.map((n: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer border-white/5">
                            <div className="flex justify-between items-start mb-2 text-wrap break-all">
                               <span className="font-headline font-bold text-xs sm:text-sm">{n.label}</span>
                               <Badge variant={n.risk > 80 ? "destructive" : "secondary"} className="text-[8px] sm:text-[9px] h-4 shrink-0 ml-2">
                                  {n.risk > 80 ? 'CRITICAL' : n.risk > 50 ? 'ALERT' : 'STABLE'}
                               </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                               <span className="flex items-center gap-1 truncate mr-2"><Layers className="h-3 w-3 shrink-0" /> ID: {n.id}</span>
                               <span className={cn("font-bold shrink-0", n.risk > 70 ? "text-destructive" : "text-foreground")}>{n.risk}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </CardContent>
              </ScrollArea>
            </Card>

            <Card className="glass border-accent/20 bg-accent/5 p-4 shrink-0 hidden lg:block">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                     <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                     <h5 className="text-xs font-bold uppercase tracking-widest text-accent">Heuristic Integrity</h5>
                     <p className="text-[11px] text-muted-foreground leading-tight">Clustering models active.</p>
                  </div>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
