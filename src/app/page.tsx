
"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { RiskCard } from "@/components/dashboard/risk-card"
import { TransactionStream } from "@/components/dashboard/transaction-stream"
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Zap, Network } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppData } from "@/context/data-context"

export default function Dashboard() {
  const { data } = useAppData()
  const [activeTab, setActiveTab] = React.useState("risk")

  // Derived metrics
  const totalCases = data.cases.length
  const highRiskCount = data.cases.filter(c => c.risk > 80).length
  const escalatedCount = data.cases.filter(c => c.status === "Escalated").length
  const systemRiskScore = Math.round(data.cases.reduce((sum, c) => sum + c.risk, 0) / Math.max(1, totalCases))
  const systemRiskChange = `${highRiskCount > 0 ? `+${Math.round((highRiskCount / Math.max(1, totalCases)) * 100)}%` : "-0%"}`

  // Graph coverage
  const totalNodes = data.nodes.length
  const totalEdges = data.edges.length
  const coveragePercent = Math.min(100, Math.round((totalNodes / Math.max(1, 10)) * 100))
  const deepHubs = data.nodes.filter(n => data.edges.filter(e => String(e.from) === String(n.id) || String(e.to) === String(n.id)).length >= 3).length
  const topAlerts = [...data.cases].sort((a, b) => b.risk - a.risk).slice(0, 3)

  return (
    <DashboardShell>
      <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
        {/* Top Hero Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <RiskCard 
            title="System Risk Score" 
            score={systemRiskScore} 
            trend={highRiskCount > 0 ? "up" : "stable"} 
            change={`${systemRiskChange} Risk Change`} 
            description="Overall platform exposure based on current case risk distribution."
          />
          <RiskCard 
            title="Active Investigations" 
            score={totalCases} 
            trend={escalatedCount > 0 ? "up" : "stable"} 
            change={`${escalatedCount} escalated`} 
            description="Currently tracked cases in system."
          />
           <RiskCard 
            title="Anomaly Precision" 
            score={Math.round((data.transactions.filter(t => t.status === "flagged").length / data.transactions.length) * 100)} 
            trend="stable" 
            change={`${data.transactions.filter(t => t.status === "flagged").length} flagged`} 
            description="Transaction anomaly detection rate from live stream."
          />
           <Card className="glass flex flex-col justify-between overflow-hidden">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-headline font-semibold text-muted-foreground uppercase">AI Readiness</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent glow-accent">
                      <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                   </div>
                   <div>
                   <div className="text-xl sm:text-2xl font-headline font-bold">{totalNodes >= 8 ? "OPTIMAL" : totalNodes >= 4 ? "FAIR" : "LIMITED"}</div>
                   <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Nodes: {totalNodes} • Links: {totalEdges}</div>
                   </div>
                </div>
               <div className="mt-4">
                 <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                   <div style={{ width: `${coveragePercent}%` }} className="h-full bg-accent glow-accent" />
                 </div>
                 <div className="text-[10px] text-muted-foreground mt-2">Coverage: {coveragePercent}% • Deep Hubs: {deepHubs}</div>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Main Grid: Live Analytics & Stream */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            <Card className="glass border-white/5">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg font-headline font-bold">Behavioral Anomaly Trends</CardTitle>
                  <p className="text-xs text-muted-foreground">Real-time risk propagation analytics</p>
                </div>
                <Tabs defaultValue="risk" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                  <TabsList className="bg-secondary/50 w-full sm:w-auto">
                    <TabsTrigger value="risk" className="flex-1 sm:flex-none text-xs">Risk</TabsTrigger>
                    <TabsTrigger value="anomalies" className="flex-1 sm:flex-none text-xs">Anomalies</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] sm:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData}>
                      <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeTab === 'risk' ? "hsl(var(--primary))" : "hsl(var(--accent))"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={activeTab === 'risk' ? "hsl(var(--primary))" : "hsl(var(--accent))"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey={activeTab} 
                        stroke={activeTab === 'risk' ? "hsl(var(--primary))" : "hsl(var(--accent))"} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRisk)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <TransactionStream />
          </div>

          {/* Sidebar Grid Column */}
          <div className="space-y-6 sm:space-y-8">
             <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader className="py-4 px-6">
                   <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base font-headline font-bold">Priority Alerts</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                   {topAlerts.map((alert, idx) => (
                     <div key={idx} className="p-3 rounded-lg border bg-card/50 hover:border-primary/50 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-1">
                           <span className={cn(
                             "text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded",
                             alert.risk > 80 ? "bg-destructive text-white" : "bg-primary text-white"
                           )}>
                             {alert.risk > 80 ? 'CRITICAL' : 'HIGH'}
                           </span>
                           <span className="text-[9px] font-code text-muted-foreground">{alert.id}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors truncate">{alert.title}</h4>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[100px]">{alert.analyst}</span>
                           <span className={cn("text-xs font-bold", alert.risk > 80 ? "text-destructive" : "text-primary")}>{alert.risk}%</span>
                        </div>
                     </div>
                   ))}
                </CardContent>
             </Card>

             <Card className="glass">
                <CardHeader className="py-4 px-6">
                   <div className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-accent" />
                      <CardTitle className="text-base font-headline font-bold">Graph Coverage</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="pt-0">
                   <div className="space-y-4">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Nodes</span>
                         <span className="text-base sm:text-lg font-headline font-bold">{data.nodes.length}</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                         <div className="h-full w-[85%] bg-accent glow-accent" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                         <div className="p-2 sm:p-3 rounded-lg bg-secondary/30">
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold mb-1">Links</div>
                            <div className="text-xs sm:text-sm font-bold">{data.edges.length}</div>
                         </div>
                         <div className="p-2 sm:p-3 rounded-lg bg-secondary/30">
                            <div className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold mb-1">Deep Hubs</div>
                            <div className="text-xs sm:text-sm font-bold">4</div>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
