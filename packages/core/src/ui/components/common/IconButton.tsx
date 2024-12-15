import { forwardRef } from "react"

import type { IconType } from "react-icons"
import type { ComposeComponentProps } from "@/ui/utils/composeComponentProps"

type Props = ComposeComponentProps<
  "button",
  {
    icon: IconType
    label: string
    /** @default md */
    size?: "md" | "sm"
    /** @default default */
    variant?: "default" | "segmented"
  }
>

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ label, icon: Icon, size = "md", variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        title={label}
        aria-label={label}
        data-size={size}
        data-variant={variant}
        className="rounded-full border border-transparent p-3 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none data-[variant=segmented]:rounded data-[size=sm]:p-1 data-[variant=segmented]:text-slate-400 data-[variant=segmented]:hover:text-slate-800"
        {...props}
      >
        <Icon />
      </button>
    )
  },
)
