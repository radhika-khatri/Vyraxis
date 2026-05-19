"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskCardProps {
  title: string
  score: number
  trend: "up" | "down" | "stable"
  change: string
  description: string
}

export function RiskCard({ title, score, trend, change, description }: RiskCardProps) {
  const getScoreColor = (s: number) => {
    if (s > 75) return "text-destructive"
    if (s > 40) return "text-amber-500"
    return "text-emerald-500"
  }

  const getProgressColor = (s: number) => {
    if (s > 75) return "[&>div]:bg-destructive"
    if (s > 40) return "[&>div]:bg-amber-500"
    return "[&>div]:bg-emerald-500"
  }

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-headline font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <div className={cn("text-3xl font-headline font-bold", getScoreColor(score))}>
            {score}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium pb-1">
            {trend === "up" ? (
              <span className="flex items-center text-destructive">
                <TrendingUp className="h-3 w-3 mr-0.5" /> {change}
              </span>
            ) : (
              <span className="flex items-center text-emerald-500">
                <TrendingDown className="h-3 w-3 mr-0.5" /> {change}
              </span>
            )}
          </div>
        </div>
        <Progress value={score} className={cn("h-1.5 mt-3", getProgressColor(score))} />
        <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
