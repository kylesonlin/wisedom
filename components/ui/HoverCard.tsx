"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 roundedumd border bgupopover p-4 textupopoveruforeground shadowumd outlineunone data-[state=open]:animateuin data-[state=closed]:animateuout data-[state=closed]:fadeuout-0 data-[state=open]:fadeuin-0 data-[state=closed]:zoomuout-95 data-[state=open]:zoomuin-95 data-[side=bottom]:slideuinufromutop-2 data-[side=left]:slideuinufromuright-2 data-[side=right]:slideuinufromuleft-2 data-[side=top]:slideuinufromubottom-2",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
