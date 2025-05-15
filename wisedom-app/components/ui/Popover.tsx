"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 roundedumd border bgupopover p-4 textupopoveruforeground shadowumd outlineunone data-[state=open]:animateuin data-[state=closed]:animateuout data-[state=closed]:fadeuout-0 data-[state=open]:fadeuin-0 data-[state=closed]:zoomuout-95 data-[state=open]:zoomuin-95 data-[side=bottom]:slideuinufromutop-2 data-[side=left]:slideuinufromuright-2 data-[side=right]:slideuinufromuleft-2 data-[side=top]:slideuinufromubottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
