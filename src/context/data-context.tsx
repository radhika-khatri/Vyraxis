"use client"

import * as React from "react"
import { 
  CHART_DATA, 
  MOCK_CASES, 
  INITIAL_TRANSACTIONS, 
  MOCK_NODES, 
  MOCK_EDGES 
} from "@/lib/mock-data"

interface AppData {
  chartData: any[]
  cases: any[]
  transactions: any[]
  nodes: any[]
  edges: any[]
}

interface DataContextType {
  data: AppData
  updateData: (newData: AppData) => void
  resetToDefault: () => void
}

const DEFAULT_DATA: AppData = {
  chartData: CHART_DATA,
  cases: MOCK_CASES,
  transactions: INITIAL_TRANSACTIONS,
  nodes: MOCK_NODES,
  edges: MOCK_EDGES,
}

const DataContext = React.createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<AppData>(DEFAULT_DATA)

  React.useEffect(() => {
    const saved = localStorage.getItem("vyraxis_data")
    if (saved) {
      try {
        setData(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load saved data", e)
      }
    }
  }, [])

  const updateData = (newData: AppData) => {
    setData(newData)
    localStorage.setItem("vyraxis_data", JSON.stringify(newData))
  }

  const resetToDefault = () => {
    setData(DEFAULT_DATA)
    localStorage.removeItem("vyraxis_data")
  }

  return (
    <DataContext.Provider value={{ data, updateData, resetToDefault }}>
      {children}
    </DataContext.Provider>
  )
}

export function useAppData() {
  const context = React.useContext(DataContext)
  if (!context) {
    throw new Error("useAppData must be used within a DataProvider")
  }
  return context
}
