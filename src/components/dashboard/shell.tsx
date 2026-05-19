
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Activity, 
  ShieldCheck, 
  Network, 
  MessageSquareCode, 
  FileText, 
  Menu,
  ChevronRight,
  Zap,
  Briefcase,
  Database,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navigation = [
  { name: 'Live Signals', href: '/', icon: Activity },
  { name: 'Network Graph', href: '/graph', icon: Network },
  { name: 'Investigation Cases', href: '/cases', icon: Briefcase },
  { name: 'Compliance Copilot', href: '/copilot', icon: MessageSquareCode },
  { name: 'SAR Engine', href: '/sar', icon: FileText },
  { name: 'Data Management', href: '/settings', icon: Database },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  // Collapse sidebar by default on smaller desktop screens
  React.useEffect(() => {
    const handleInitialResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      } else if (window.innerWidth >= 1280) {
        setIsSidebarOpen(true)
      }
    }
    handleInitialResize()
  }, [])

  const NavContent = ({ mobile = false, onItemClick }: { mobile?: boolean, onItemClick?: () => void }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex h-16 items-center px-6 gap-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-primary shrink-0">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {(isSidebarOpen || mobile) && (
          <span className="font-headline text-lg font-bold tracking-tight whitespace-nowrap animate-in fade-in duration-300">
            VYRAXIS
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                (!isSidebarOpen && !mobile) && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {(isSidebarOpen || mobile) && (
                <span className="ml-3 truncate whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.name}
                </span>
              )}
              {isActive && (isSidebarOpen || mobile) && (
                <ChevronRight className="ml-auto h-4 w-4 animate-in zoom-in duration-300" />
              )}
            </Link>
          )
        })}
      </nav>

      {!mobile && (
        <div className="p-4 border-t shrink-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "w-full text-muted-foreground transition-all duration-200",
              isSidebarOpen ? "justify-start" : "justify-center px-0"
            )}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-3 whitespace-nowrap animate-in fade-in duration-300">Collapse</span>
              </>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground dark">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside 
          className={cn(
            "relative z-20 flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
            isSidebarOpen ? "w-64" : "w-20"
          )}
        >
          <NavContent />
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card/50 backdrop-blur-md px-4 sm:px-8 shrink-0">
          <div className="flex items-center flex-1 gap-4">
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 bg-card border-r dark">
                  <NavContent mobile onItemClick={() => setIsMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            )}
            
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse-glow truncate">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span className="truncate">Node Monitoring: Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8 sm:h-9 w-9 border cursor-pointer hover:ring-2 ring-primary transition-all">
              <AvatarImage src="https://picsum.photos/seed/analyst/100/100" />
              <AvatarFallback>VY</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-background/50">
          {children}
        </main>
      </div>
    </div>
  )
}
