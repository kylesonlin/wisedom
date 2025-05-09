"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inlineuflex h-6 w-11 shrink-0 cursorupointer itemsucenter roundedufull border-2 borderutransparent transitionucolors focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 focusuvisible:ringuoffsetubackground disabled:cursorunotuallowed disabled:opacity-50 data-[state=checked]:bguprimary data-[state=unchecked]:bguinput",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointerueventsunone block h-5 w-5 roundedufull bgubackground shadowulg ring-0 transitionutransform data-[state=checked]:translateux-5 data-[state=unchecked]:translateux-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
