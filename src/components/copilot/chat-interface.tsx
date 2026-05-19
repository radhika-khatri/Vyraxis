"use client"

import * as React from "react"
import { Send, User, Bot, Sparkles, Paperclip, ChevronDown, ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { complianceCopilotQuery } from "@/ai/flows/compliance-copilot-query"
import { useAppData } from "@/context/data-context"

interface Message {
  role: "user" | "assistant"
  content: string
  riskScore?: any
}

interface ChatInterfaceProps {
  session: { id: string; title: string; messages: Message[] }
  onUpdate: (sessionId: string, updates: { title?: string; messages?: Message[] }) => void
}

export function ChatInterface({ session, onUpdate }: ChatInterfaceProps) {
  const { data } = useAppData()
  const [messages, setMessages] = React.useState<Message[]>(session?.messages || [
    { role: "assistant", content: "I am Vyraxis Copilot. I analyze your investigation data and can help you examine cases, understand risk scores, or ask about entities in your system. What would you like to investigate?" }
  ])
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input
    setInput("")
    const newMessages = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)
    onUpdate(session.id, { messages: newMessages })
    setIsLoading(true)

    try {
      // Pass context: top recent cases, high-risk nodes, and flagged transactions
      const response = await complianceCopilotQuery({ 
        query: userMessage,
        context: {
          cases: data.cases.slice(0, 5),
          nodes: data.nodes.filter(n => n.risk > 50),
          transactions: data.transactions.slice(0, 5)
        }
      })
      const updated = [...newMessages, { 
        role: "assistant", 
        content: response.answer,
        riskScore: response.riskScore
      }]
      setMessages(updated)
      onUpdate(session.id, { messages: updated })
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error analyzing that request. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  // Sync session -> local messages when session prop changes
  React.useEffect(() => {
    if (session?.messages && session.messages !== messages) {
      setMessages(session.messages)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id])

  return (
    <div className="flex flex-col h-full glass rounded-xl overflow-hidden border-white/5">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-sm">Vyraxis Copilot</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Reasoning Engine v2.4</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ListFilter className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronDown className="h-4 w-4" /></Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "assistant" ? "items-start" : "items-start flex-row-reverse")}>
              <Avatar className="h-8 w-8 border">
                {m.role === "assistant" ? (
                  <>
                    <AvatarFallback className="bg-primary/20 text-primary"><Bot className="h-4 w-4" /></AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="https://picsum.photos/seed/analyst/100/100" />
                    <AvatarFallback>AN</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className={cn(
                "max-w-[85%] space-y-3",
                m.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === "assistant" ? "bg-secondary/50 rounded-tl-none border" : "bg-primary text-primary-foreground rounded-tr-none glow-primary"
                )}>
                  {m.content}
                </div>
                
                {m.riskScore && (
                  <div className="glass p-3 rounded-lg border-primary/20 max-w-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-primary uppercase">Risk Insight</span>
                      <span className="text-xs font-headline font-bold">{m.riskScore.score}/100</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">{m.riskScore.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary border animate-pulse">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="bg-secondary/30 p-4 rounded-2xl rounded-tl-none border">
                <div className="flex gap-1.5">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-card/30">
        <form onSubmit={handleSubmit} className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about risk scores, suspicious patterns, or entities..."
            className="pr-20 py-6 bg-secondary/50 border-white/5 focus-visible:ring-primary"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
            <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading}><Send className="h-4 w-4" /></Button>
          </div>
        </form>
        <p className="text-[9px] text-center mt-3 text-muted-foreground uppercase tracking-[0.2em] font-semibold">
          AI Copilot may process sensitive data. Audit trails are enabled.
        </p>
      </div>
    </div>
  )
}
