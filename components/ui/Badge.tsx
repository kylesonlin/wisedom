import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inlineuflex itemsucenter roundedufull border px-2.5 py-0.5 textuxs fontusemibold transitionucolors focus:outlineunone focus:ring-2 focus:ringuring focus:ringuoffset-2",
  {
    variants: {
      variant: {
        default:
          "borderutransparent bguprimary textuprimaryuforeground hover:bguprimary/80",
        secondary:
          "borderutransparent bgusecondary textusecondaryuforeground hover:bgusecondary/80",
        destructive:
          "borderutransparent bgudestructive textudestructiveuforeground hover:bgudestructive/80",
        outline: "textuforeground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
