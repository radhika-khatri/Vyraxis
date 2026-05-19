"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatHistorySidebarProps {
  sessions: { id: string; title: string; updatedAt?: string }[]
  currentSessionId?: string
  onSelect: (id: string) => void
  onNew: () => void
}

export function ChatHistorySidebar({ sessions = [], currentSessionId, onSelect, onNew }: ChatHistorySidebarProps) {
  return (
    <Card className="glass flex-1 overflow-hidden flex flex-col">
      <CardHeader className="border-b bg-card/30 py-4 px-5">
         <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-headline font-bold">Chat History</CardTitle>
            <div className="flex items-center gap-2">
              <button onClick={onNew} className="text-[12px] font-bold text-primary">+ New</button>
              <History className="h-4 w-4 text-muted-foreground" />
            </div>
         </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
         {sessions.length === 0 && (
           <div className="text-sm text-muted-foreground">No chat history yet. Start a conversation with the Copilot.</div>
         )}
         {sessions.map((s) => (
           <div key={s.id} onClick={() => onSelect(s.id)} className={cn(
             "p-3 rounded-lg border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer",
             currentSessionId === s.id && "ring-1 ring-primary/30 bg-primary/5"
           )}>
             <h4 className="text-xs font-semibold mb-1 line-clamp-1">{s.title}</h4>
             <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <span>{s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'recent'}</span>
                <Badge variant="outline" className="text-[8px]">Conversation</Badge>
             </div>
           </div>
         ))}
      </CardContent>
    </Card>
  )
}
