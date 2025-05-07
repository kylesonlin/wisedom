"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

import { cn } from "@/lib/utils"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bgubackground group-[.toaster]:textuforeground group-[.toaster]:borderuborder group-[.toaster]:shadowulg",
          description: "group-[.toast]:textumuteduforeground",
          actionButton:
            "group-[.toast]:bguprimary group-[.toast]:textuprimaryuforeground",
          cancelButton:
            "group-[.toast]:bgumuted group-[.toast]:textumuteduforeground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
