"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inlineuflex h-10 itemsucenter justifyucenter roundedumd bgumuted p-1 textumuteduforeground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inlineuflex itemsucenter justifyucenter whitespaceunowrap roundedusm px-3 py-1.5 textusm fontumedium ringuoffsetubackground transitionuall focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 disabled:pointerueventsunone disabled:opacity-50 data-[state=active]:bgubackground data-[state=active]:textuforeground data-[state=active]:shadowusm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ringuoffsetubackground focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
