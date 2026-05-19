
"use client"

import * as React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppData } from "@/context/data-context"

export function TransactionStream() {
  const { data } = useAppData()
  // Use the provided dataset directly — no random simulation
  const [transactions, setTransactions] = React.useState(() => data.transactions)

  React.useEffect(() => {
    setTransactions(data.transactions)
  }, [data.transactions])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-headline font-bold">Signal Stream</h3>
        <Badge variant="outline" className="font-code font-normal">LIVE_FEED v2.4</Badge>
      </div>
      
      <div className="rounded-md border bg-card/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group hover:bg-secondary/30 transition-colors border-b last:border-0"
                  >
                    <TableCell className="font-code text-xs text-muted-foreground">{tx.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full bg-secondary",
                          tx.type === "inbound" ? "text-emerald-500" : "text-primary"
                        )}>
                          {tx.type === "inbound" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-sm">{tx.entity}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">{tx.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          tx.risk > 75 ? "bg-destructive animate-pulse" : tx.risk > 40 ? "bg-amber-500" : "bg-emerald-500"
                        )} />
                        <span className="font-medium text-xs">{tx.risk}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={tx.status === "flagged" ? "destructive" : "secondary"}
                        className="text-[10px] uppercase font-bold px-1.5 py-0"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
