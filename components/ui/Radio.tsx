"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    label?: string
  }
>(({ className, label, ...props }, ref) => (
  <div className="flex itemsucenter spaceux-2">
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "h-4 w-4 roundedufull border borderuprimary textuprimary ringuoffsetubackground focus:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 disabled:cursorunotuallowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex itemsucenter justifyucenter">
        <div className="h-2 w-2 roundedufull bguprimary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
    {label && <label className="textusm fontumedium leadingunone">{label}</label>}
  </div>
))
Radio.displayName = RadioGroupPrimitive.Item.displayName

export { Radio } 