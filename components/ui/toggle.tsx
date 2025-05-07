"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inlineuflex itemsucenter justifyucenter roundedumd textusm fontumedium ringuoffsetubackground transitionucolors hover:bgumuted hover:textumuteduforeground focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 disabled:pointerueventsunone disabled:opacity-50 data-[state=on]:bguaccent data-[state=on]:textuaccentuforeground [&_svg]:pointerueventsunone [&_svg]:size-4 [&_svg]:shrink-0 gap-2",
  {
    variants: {
      variant: {
        default: "bgutransparent",
        outline:
          "border borderuinput bgutransparent hover:bguaccent hover:textuaccentuforeground",
      },
      size: {
        default: "h-10 px-3 minuw-10",
        sm: "h-9 px-2.5 minuw-9",
        lg: "h-11 px-5 minuw-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
