"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useMobile } from "../../hooks/useMobile"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { Input } from "./Input"
import { ScrollArea } from "./ScrollArea"
import { Separator } from "./Separator"
import { Skeleton } from "./Skeleton"
import { Sheet, SheetContent } from "./Sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./Tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | undefined>(undefined)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = ({
  children,
  defaultState = "expanded",
  defaultOpen = true,
  defaultOpenMobile = false,
}: {
  children: React.ReactNode
  defaultState?: "expanded" | "collapsed"
  defaultOpen?: boolean
  defaultOpenMobile?: boolean
}) => {
  const [state, setState] = React.useState<"expanded" | "collapsed">(defaultState)
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(defaultOpenMobile)
  const isMobile = useMobile()

  const toggleSidebar = React.useCallback(() => {
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"))
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            side={side}
            className={cn(
              "flex w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
              className
            )}
          >
            {children}
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        data-sidebar="sidebar"
        data-variant={variant}
        data-state={state}
        data-side={side}
        className={cn(
          "relative flex flex-col",
          variant === "sidebar" &&
            "w-[--sidebar-width] data-[state=collapsed]:w-[--sidebar-width-icon]",
          variant === "floating" &&
            "absolute inset-y-0 z-50 w-[--sidebar-width] data-[state=collapsed]:w-[--sidebar-width-icon]",
          variant === "inset" &&
            "w-[--sidebar-width] data-[state=collapsed]:w-[--sidebar-width-icon]",
          side === "left" && "left-0",
          side === "right" && "right-0",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn(
        "flex h-[--header-height] items-center border-b border-sidebar-border px-4",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarHeaderTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn(
        "flex items-center gap-2 text-sm font-semibold",
        state === "collapsed" && "hidden",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

const SidebarHeaderIcon = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarHeaderIcon.displayName = "SidebarHeaderIcon"

const SidebarBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn("flex-1", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarBody.displayName = "SidebarBody"

const SidebarSearch = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn("p-4", state === "collapsed" && "hidden", className)}
      ref={ref}
      {...props}
    >
      <Input
        type="search"
        placeholder="Search..."
        className="h-8 w-full"
        {...props}
      />
    </div>
  )
})
SidebarSearch.displayName = "SidebarSearch"

const SidebarNav = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn("flex-1 overflow-auto", className)}
      ref={ref}
      {...props}
    >
      <ScrollArea className="h-full">
        <nav className="grid gap-1 px-2">{children}</nav>
      </ScrollArea>
    </div>
  )
})
SidebarNav.displayName = "SidebarNav"

const SidebarNavHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn(
        "mb-2 px-2 py-1.5",
        state === "collapsed" && "hidden",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="text-xs font-medium text-sidebar-foreground/50">
        {children}
      </div>
    </div>
  )
})
SidebarNavHeader.displayName = "SidebarNavHeader"

const SidebarNavItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    icon?: React.ReactNode
    tooltip?: string
  }
>(({ className, children, icon, tooltip, ...props }, ref) => {
  const { state } = useSidebar()

  if (state === "collapsed" && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-9 w-9 justify-center p-0",
                className
              )}
              ref={ref}
              {...props}
            >
              {icon}
              <span className="sr-only">{children}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-9 w-full justify-start",
        state === "collapsed" && "h-9 w-9 p-0",
        className
      )}
      ref={ref}
      {...props}
    >
      {icon}
      {state === "expanded" && <span>{children}</span>}
    </Button>
  )
})
SidebarNavItem.displayName = "SidebarNavItem"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  const { state } = useSidebar()

  return (
    <div
      data-state={state}
      className={cn(
        "mt-auto flex flex-col gap-4 border-t border-sidebar-border p-4",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarCollapse = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, children, ...props }, ref) => {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-8 w-8 p-0 hover:bg-sidebar-hover",
        state === "collapsed" && "rotate-180",
        className
      )}
      onClick={toggleSidebar}
      ref={ref}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarCollapse.displayName = "SidebarCollapse"

export {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarHeaderIcon,
  SidebarBody,
  SidebarSearch,
  SidebarNav,
  SidebarNavHeader,
  SidebarNavItem,
  SidebarFooter,
  SidebarCollapse,
} 