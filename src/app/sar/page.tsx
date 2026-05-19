"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  CheckCircle2, 
  Info,
  FileJson
} from "lucide-react"
import { sarGenerationAndSummary } from "@/ai/flows/sar-generation-and-summary"
import { useToast } from "@/hooks/use-toast"
import { INITIAL_SAR_FORM_DATA } from "@/lib/mock-data"
import { jsPDF } from "jspdf"

export default function SARPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<{ narrative: string, summary: string } | null>(null)
  
  const [formData, setFormData] = React.useState(INITIAL_SAR_FORM_DATA)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const response = await sarGenerationAndSummary({
        caseId: formData.caseId,
        investigationDetails: formData.investigationDetails,
        aiFindings: formData.aiFindings.split('.').filter(s => s.trim()),
        graphInsights: formData.graphInsights,
        regulatoryContext: formData.regulatoryContext,
        evidenceSummary: formData.evidenceSummary
      })
      setResult({
        narrative: response.sarNarrative,
        summary: response.investigationSummary
      })
      toast({
        title: "SAR Generated",
        description: "Draft narrative and summary are ready for review."
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate SAR at this time."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result.narrative)
    toast({
      title: "Copied to Clipboard",
      description: "SAR narrative has been copied for external reporting."
    })
  }

  const handleDownloadPDF = () => {
    if (!result) return
    
    const doc = new jsPDF()
    const title = `Suspicious Activity Report: ${formData.caseId || 'Draft'}`
    const margin = 10
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(16)
    doc.text(title, margin, 20)
    
    doc.setFontSize(12)
    doc.text("Investigation Summary:", margin, 35)
    
    doc.setFontSize(10)
    const summaryLines = doc.splitTextToSize(result.summary, pageWidth - (margin * 2))
    doc.text(summaryLines, margin, 42)
    
    let currentY = 42 + (summaryLines.length * 5) + 10
    
    doc.setFontSize(12)
    doc.text("SAR Narrative:", margin, currentY)
    
    doc.setFontSize(10)
    const narrativeLines = doc.splitTextToSize(result.narrative, pageWidth - (margin * 2))
    doc.text(narrativeLines, margin, currentY + 7)
    
    doc.save(`SAR_${formData.caseId || 'DRAFT'}.pdf`)
    
    toast({
      title: "PDF Export Complete",
      description: "Regulatory-ready SAR document has been downloaded."
    })
  }

  const handleDownloadText = () => {
    if (!result) return
    const blob = new Blob([result.narrative], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `SAR_${formData.caseId || 'DRAFT'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Text Downloaded",
      description: "SAR narrative text file downloaded."
    })
  }

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">SAR Generation Engine</h1>
            <p className="text-muted-foreground">AI-assisted drafting of Suspicious Activity Reports for regulatory submission.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card className="glass border-white/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-headline font-bold">Investigation Evidence</CardTitle>
                </div>
                <CardDescription>Populate findings to synthesize a regulatory-ready draft.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Case ID</label>
                    <Input 
                      value={formData.caseId} 
                      onChange={(e) => setFormData({...formData, caseId: e.target.value})}
                      className="bg-secondary/30 border-white/5 focus-visible:ring-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Regulatory Context</label>
                    <Input 
                      value={formData.regulatoryContext} 
                      onChange={(e) => setFormData({...formData, regulatoryContext: e.target.value})}
                      placeholder="e.g. FinCEN, FCA" 
                      className="bg-secondary/30 border-white/5 focus-visible:ring-primary" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Investigation Details</label>
                  <Textarea 
                    value={formData.investigationDetails} 
                    onChange={(e) => setFormData({...formData, investigationDetails: e.target.value})}
                    placeholder="Describe the core activity..." 
                    className="min-h-[100px] bg-secondary/30 border-white/5 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI & Graph Findings</label>
                  <Textarea 
                    value={formData.aiFindings + "\n" + formData.graphInsights} 
                    onChange={(e) => {
                      const lines = e.target.value.split('\n')
                      setFormData({...formData, aiFindings: lines[0] || "", graphInsights: lines[1] || ""})
                    }}
                    placeholder="Detection results..." 
                    className="min-h-[100px] bg-secondary/30 border-white/5 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evidence Summary</label>
                  <Textarea 
                    value={formData.evidenceSummary} 
                    onChange={(e) => setFormData({...formData, evidenceSummary: e.target.value})}
                    placeholder="List attached documents..." 
                    className="h-20 bg-secondary/30 border-white/5 focus-visible:ring-primary"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading}
                  className="w-full h-12 glow-primary bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Synthesizing Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate SAR Draft
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {!result ? (
              <div className="h-[400px] sm:h-[600px] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-muted-foreground p-6 sm:p-12 text-center bg-card/20">
                <FileText className="h-12 w-12 mb-4 opacity-20" />
                <h3 className="font-headline font-bold text-lg mb-2">No SAR Drafted</h3>
                <p className="text-sm">Enter investigation details and click generate to create a regulatory-ready narrative.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="glass border-primary/20 bg-primary/5">
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm font-headline font-bold">Investigation Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/80">{result.summary}</p>
                  </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden border-white/5">
                  <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary" onClick={copyToClipboard} title="Copy Narrative"><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary" onClick={handleDownloadText} title="Download Text"><FileJson className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 hover:text-primary" onClick={handleDownloadPDF} title="Export PDF"><Download className="h-4 w-4" /></Button>
                  </div>
                  <CardHeader className="border-b bg-card/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-sm font-headline font-bold">SAR Narrative (Draft)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <p className="text-xs leading-relaxed whitespace-pre-wrap font-body text-foreground/90 bg-secondary/10 p-4 rounded-md border border-white/5 overflow-x-auto">
                        {result.narrative}
                      </p>
                    </div>
                  </CardContent>
                  <div className="px-4 sm:px-6 py-3 border-t bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-primary border-primary/30 bg-primary/5">
                      AI Reasoning Active
                    </Badge>
                    <p className="text-[10px] text-muted-foreground italic">Review required before submission</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
