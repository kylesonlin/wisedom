import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex minuh-[80px] wufull roundedumd border borderuinput bgubackground px-3 py-2 textubase ringuoffsetubackground placeholder:textumuteduforeground focusuvisible:outlineunone focusuvisible:ring-2 focusuvisible:ringuring focusuvisible:ringuoffset-2 disabled:cursorunotuallowed disabled:opacity-50 md:textusm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
