
"use client"

import * as React from "react"
import { useAppData } from "@/context/data-context"
import { DashboardShell } from "@/components/dashboard/shell"
import { ChatInterface } from "@/components/copilot/chat-interface"
import { ChatHistorySidebar } from "@/components/copilot/chat-history-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, MessageSquare, History, FileText, Search } from "lucide-react"

export default function CopilotPage() {
  const { data } = useAppData()
  const [sessions, setSessions] = React.useState<{ id: string; title: string; messages: any[]; updatedAt?: string }[]>([])
  const [currentSessionId, setCurrentSessionId] = React.useState<string | undefined>(undefined)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('vyraxis_chat_sessions')
      const cur = localStorage.getItem('vyraxis_chat_current')
      if (raw) setSessions(JSON.parse(raw))
      if (cur) setCurrentSessionId(cur)
    } catch (e) {}
  }, [])

  const persist = (next: any[]) => {
    try { localStorage.setItem('vyraxis_chat_sessions', JSON.stringify(next)) } catch (e) {}
    setSessions(next)
  }

  const createSession = (initialTitle = 'New Chat') => {
    const id = `s_${Date.now()}`
    const now = new Date().toISOString()
    const newSession = { id, title: initialTitle, messages: [{ role: 'assistant', content: 'I am Vyraxis Copilot. I analyze your investigation data and can help you examine cases, understand risk scores, or ask about entities in your system. What would you like to investigate?' }], updatedAt: now }
    const next = [newSession, ...sessions]
    persist(next)
    setCurrentSessionId(id)
    try { localStorage.setItem('vyraxis_chat_current', id) } catch (e) {}
    return newSession
  }

  const setSessionUpdates = (sessionId: string, updates: { title?: string; messages?: any[] }) => {
    const next = sessions.map(s => s.id === sessionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
    persist(next)
  }

  // Ensure at least one session exists
  React.useEffect(() => {
    if (!currentSessionId) {
      const s = createSession()
      setCurrentSessionId(s.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId])

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0]

  const generateTitleFromMessages = (msgs: any[]) => {
    // Heuristic: look for CASE- ids, otherwise node labels from data, otherwise first user message
    const combined = msgs.map(m => m.content).join(' ')
    const caseMatch = combined.match(/CASE-\d{3,}/i)
    if (caseMatch) return `Investigation ${caseMatch[0].toUpperCase()}`
    for (const node of data.nodes) {
      if (combined.includes(String(node.label))) return `Entity: ${node.label}`
    }
    const user = msgs.find(m => m.role === 'user')
    if (user) return user.content.slice(0,48)
    return 'New Chat'
  }
  return (
    <DashboardShell>
      <div className="flex flex-col min-h-[calc(100vh-140px)] gap-6 max-w-[1400px] mx-auto pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-headline font-bold">Compliance Copilot</h1>
            <p className="text-sm text-muted-foreground">Context-aware conversational intelligence for deep investigations.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-hidden">
             <Badge variant="outline" className="h-8 border-primary/30 text-primary bg-primary/5 flex gap-2 items-center px-3 sm:whitespace-nowrap shrink-0 max-w-full">
               <Sparkles className="h-3.5 w-3.5 shrink-0" /> <span className="text-[10px] sm:text-xs truncate">Reasoning Model v2.4 Active</span>
             </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full min-h-0">
           {/* History / Context Sidebar (chat history) */}
          <div className="hidden lg:flex flex-col gap-6">
            <div className="h-full">
              <ChatHistorySidebar
                sessions={sessions}
                currentSessionId={currentSessionId}
                onSelect={(id) => { setCurrentSessionId(id); try { localStorage.setItem('vyraxis_chat_current', id) } catch (e) {} }}
                onNew={() => createSession()}
              />
            </div>
          </div>

          {/* Chat Main Area */}
          <div className="lg:col-span-3 min-h-[500px] h-full">
            {currentSession && (
              <ChatInterface
                session={currentSession}
                onUpdate={(id, updates) => {
                  // update messages
                  setSessionUpdates(id, updates)
                  // If title is default, generate a context-based title
                  const s = sessions.find(ss => ss.id === id)
                  const msgs = updates.messages || s?.messages || []
                  if (s && (!s.title || s.title === 'New Chat') && msgs.length > 0) {
                    const newTitle = generateTitleFromMessages(msgs)
                    setSessionUpdates(id, { title: newTitle })
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
