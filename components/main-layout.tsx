"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/sidebar-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen">
      {/* Sidebar for desktop with collapse/expand and mode toggle at the top */}
      <div
        className={cn(
          "fixed hidden h-full flex-col border-r bg-background md:flex transition-all duration-200",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Top section: Mode toggle and collapse button */}
        <div className="flex items-center justify-between h-14 border-b px-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 flex flex-col">
          <SidebarNav className="flex-1" isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-background transition-transform duration-200",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top section: Mode toggle and close button */}
          <div className="flex items-center justify-between h-14 border-b px-2">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <SidebarNav />
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col",
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
} 