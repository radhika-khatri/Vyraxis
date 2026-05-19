"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Save, 
  RotateCcw, 
  Copy, 
  FileJson,
  CheckCircle2,
  AlertCircle,
  Upload
} from "lucide-react"
import { useAppData } from "@/context/data-context"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { data, updateData, resetToDefault } = useAppData()
  const { toast } = useToast()
  const [jsonInput, setJsonInput] = React.useState(JSON.stringify(data, null, 2))
  const [isValid, setIsValid] = React.useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setJsonInput(JSON.stringify(data, null, 2))
  }, [data])

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const requiredKeys = ["chartData", "cases", "transactions", "nodes", "edges"]
      const hasAllKeys = requiredKeys.every(k => k in parsed)
      
      if (!hasAllKeys) {
        throw new Error("Missing required data keys")
      }

      updateData(parsed)
      toast({
        title: "Dataset Applied",
        description: "The platform has been updated with your custom data."
      })
    } catch (e) {
      setIsValid(false)
      toast({
        variant: "destructive",
        title: "Invalid JSON",
        description: "Please check your data format and try again."
      })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        JSON.parse(content)
        setJsonInput(content)
        setIsValid(true)
        toast({
          title: "File Uploaded",
          description: "JSON content has been loaded into the editor."
        })
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: "The selected file does not contain valid JSON."
        })
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleReset = () => {
    resetToDefault()
    toast({
      title: "Reset to Default",
      description: "Reverted all platform data to the original mock dataset."
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonInput)
    toast({
      title: "Copied",
      description: "Current dataset JSON copied to clipboard."
    })
  }

  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl mx-auto px-1 sm:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold">Data Management</h1>
          <p className="text-sm text-muted-foreground">Directly manipulate the underlying data model for Vyraxis Intelligence.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="glass border-white/5">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-headline font-bold">Live Data Editor</CardTitle>
                <CardDescription className="text-xs">Edit or upload a custom JSON dataset below. Schema validation is automatic.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 flex-1 sm:flex-none">
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 flex-1 sm:flex-none">
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10 flex-1 sm:flex-none">
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Textarea 
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value)
                    setIsValid(true)
                  }}
                  className="min-h-[400px] sm:min-h-[500px] font-code text-[10px] sm:text-xs bg-black/40 border-white/5 focus-visible:ring-primary leading-relaxed"
                  placeholder="Paste your JSON dataset here..."
                />
                {!isValid && (
                  <div className="bg-destructive/10 border border-destructive/50 rounded-md p-3 flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-1">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-bold">Invalid JSON Format Detected</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <Badge variant="outline" className="h-6 flex gap-1.5 items-center bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Chart
                    </Badge>
                    <Badge variant="outline" className="h-6 flex gap-1.5 items-center bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Cases
                    </Badge>
                    <Badge variant="outline" className="h-6 flex gap-1.5 items-center bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Graphs
                    </Badge>
                </div>
                <Button onClick={handleApply} className="w-full sm:w-auto bg-primary glow-primary hover:bg-primary/90 px-8">
                  <Save className="mr-2 h-4 w-4" /> Apply Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base font-headline font-bold flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" /> Required Data Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">chartData (Array)</h4>
                    <p className="text-[11px] text-muted-foreground">Keys: time (string), risk (number).</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">cases (Array)</h4>
                    <p className="text-[11px] text-muted-foreground">Keys: id, title, status, priority, analyst, updated, risk.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">nodes (Array)</h4>
                    <p className="text-[11px] text-muted-foreground">Keys: id, label, x, y, type, risk.</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1">edges (Array)</h4>
                    <p className="text-[11px] text-muted-foreground">Keys: from, to, amount, color.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
