"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex wufull touchunone selectunone itemsucenter",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 wufull grow overflowuhidden roundedufull bgusecondary">
      <SliderPrimitive.Range className="absolute hufull bguprimary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 roundedufull border-2 borderuprimary bgubackground ringuoffsetubackground transitionucolors focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 disabled:pointerueventsunone disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
