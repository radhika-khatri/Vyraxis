
"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle,
  Download
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useAppData } from "@/context/data-context"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CasesPage() {
  const { toast } = useToast()
  const { data, updateData } = useAppData()
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const [newCaseTitle, setNewCaseTitle] = React.useState("")
  const [newCaseAnalyst, setNewCaseAnalyst] = React.useState("")
  const [newCaseStatus, setNewCaseStatus] = React.useState("Under Review")
  const [newCasePriority, setNewCasePriority] = React.useState<"Low" | "Medium" | "High">("High")
  const [newCaseRisk, setNewCaseRisk] = React.useState<number | string>(60)
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  
  const filteredCases = data.cases.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCase = () => {
    if (!newCaseTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please provide a title for the investigation."
      })
      return
    }

    const newCase = {
      id: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newCaseTitle,
      status: newCaseStatus,
      priority: newCasePriority,
      analyst: newCaseAnalyst || "Unassigned",
      updated: "Just now",
      risk: typeof newCaseRisk === 'number' ? Math.max(0, Math.min(100, Math.round(newCaseRisk))) : Math.floor(40 + Math.random() * 50)
    }

    const updatedData = {
      ...data,
      cases: [newCase, ...data.cases]
    }

    updateData(updatedData)
    setIsDialogOpen(false)
    
    setNewCaseTitle("")
    setNewCaseAnalyst("")
    setNewCaseStatus("Under Review")
    setNewCasePriority("High")
    setNewCaseRisk(60)
    
    toast({
      title: "Case Created",
      description: `New investigation file ${newCase.id} has been opened.`
    })
  }

  const handleExportCSV = () => {
    const headers = ["Case ID", "Title", "Status", "Priority", "Analyst", "Risk Score"]
    const rows = filteredCases.map(c => [c.id, c.title, c.status, c.priority, c.analyst, `${c.risk}%`])
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Vyraxis_Cases_Export_${new Date().getTime()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "CSV Exported",
      description: "The current case list has been exported to CSV."
    })
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Under Review":
        return "border-primary text-primary bg-primary/5";
      case "Escalated":
        return "border-amber-500 text-amber-500 bg-amber-500/5";
      case "Draft":
        return "border-muted-foreground/30 text-muted-foreground bg-muted/5";
      case "Regulatory Filing":
        return "border-accent text-accent bg-accent/5";
      case "Cleared":
        return "border-emerald-500 text-emerald-500 bg-emerald-500/5";
      default:
        return "border-border";
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">Investigation Cases</h1>
            <p className="text-muted-foreground">Workflow management for escalated financial crime investigations.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="glass flex-1 sm:flex-none" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glow-primary bg-primary hover:bg-primary/90 flex-1 sm:flex-none">
                  <Plus className="mr-2 h-4 w-4" /> New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="glass sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-headline font-bold">Initiate New Investigation</DialogTitle>
                  <DialogDescription>
                    Manually escalate a suspicious entity or transaction cluster.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Case Title</label>
                    <Input 
                      placeholder="e.g. High-velocity structuring in Node_09" 
                      className="bg-secondary/30 border-border"
                      value={newCaseTitle}
                      onChange={(e) => setNewCaseTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Analyst Name</label>
                      <Input 
                        placeholder="Assignee..." 
                        className="bg-secondary/30 border-border"
                        value={newCaseAnalyst}
                        onChange={(e) => setNewCaseAnalyst(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</label>
                      <Select value={newCaseStatus} onValueChange={setNewCaseStatus}>
                        <SelectTrigger className="bg-secondary/30 border-border">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Under Review">Under Review</SelectItem>
                          <SelectItem value="Escalated">Escalated</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Regulatory Filing">Regulatory Filing</SelectItem>
                          <SelectItem value="Cleared">Cleared</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Priority Level</label>
                    <div className="flex gap-2">
                      {(["Low", "Medium", "High"] as const).map((p) => (
                        <Button 
                          key={p}
                          type="button"
                          variant={newCasePriority === p ? "default" : "outline"} 
                          size="sm" 
                          className={cn(
                            "flex-1 border-border",
                            newCasePriority === p && "bg-primary text-primary-foreground border-primary"
                          )}
                          onClick={() => setNewCasePriority(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Risk Score</label>
                    <Input 
                      placeholder="e.g. 78" 
                      className="bg-secondary/30 border-border"
                      value={String(newCaseRisk)}
                      onChange={(e) => setNewCaseRisk(Number(e.target.value) || 0)}
                      type="number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-primary" onClick={handleCreateCase}>Create Case File</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
           {[
             { label: "My Active", count: data.cases.filter(c => c.analyst && c.analyst !== "Unassigned").length, icon: User, color: "text-primary" },
             { label: "Critical Escalations", count: data.cases.filter(c => c.risk > 80 || c.status === "Escalated").length, icon: AlertTriangle, color: "text-destructive" },
             { label: "Pending SARs", count: data.cases.filter(c => c.status === "Regulatory Filing").length, icon: Briefcase, color: "text-accent" },
             { label: "Total Open", count: data.cases.length, icon: Clock, color: "text-muted-foreground" },
           ].map((stat, i) => (
             <Card key={i} className="glass">
                <CardContent className="p-4 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      <p className="text-2xl font-headline font-bold">{stat.count}</p>
                   </div>
                   <div className={cn("p-2 rounded-lg bg-secondary/50", stat.color)}>
                      <stat.icon className="h-5 w-5" />
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <Card className="glass overflow-hidden">
           <CardHeader className="bg-card/30 border-b flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4 flex-1">
                 <div className="relative w-full max-w-sm">
                    <Input 
                      placeholder="Search cases by ID or title..." 
                      className="h-9 bg-secondary/30 border-none px-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
           </CardHeader>
           <CardContent className="p-0">
              <div className="overflow-x-auto">
                <ScrollArea className="h-[500px] w-full min-w-[800px]">
                  <table className="w-full text-left">
                      <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                         <tr className="border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <th className="px-6 py-3">Case ID</th>
                            <th className="px-6 py-3">Case Title</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Analyst</th>
                            <th className="px-6 py-3">Risk</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                         {filteredCases.map((item) => (
                           <tr key={item.id} className="group hover:bg-secondary/20 transition-all">
                              <td className="px-6 py-4 font-code text-xs text-primary font-bold">{item.id}</td>
                              <td className="px-6 py-4">
                                 <div>
                                    <div className="text-sm font-semibold">{item.title}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                       <Clock className="h-3 w-3" /> Updated {item.updated}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <Badge 
                                   variant="outline" 
                                   className={cn(
                                     "text-[10px] font-bold uppercase",
                                     getStatusStyles(item.status)
                                   )}
                                 >
                                   {item.status}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                                       <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    </div>
                                    <span className="text-xs font-medium">{item.analyst}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      item.risk > 80 ? "bg-destructive animate-pulse" : item.risk > 50 ? "bg-amber-500" : "bg-emerald-500"
                                    )} />
                                    <span className="text-xs font-bold">{item.risk}%</span>
                                 </div>
                              </td>
                           </tr>
                         ))}
                         {filteredCases.length === 0 && (
                           <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                 No cases found matching your search criteria.
                              </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </ScrollArea>
              </div>
           </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
