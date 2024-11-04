import { forwardRef } from "react"

import { Tooltip } from "./Tooltip"

import type { IconType } from "react-icons"
import type { ComposeComponentProps } from "@/ui/utils/composeComponentProps"

type Props = ComposeComponentProps<
  "button",
  {
    icon: IconType
    label: string
    /** @default md */
    size?: "md" | "sm"
    highlighted?: boolean
  }
>

export const ToolButton = forwardRef<HTMLButtonElement, Props>(
  ({ label, icon: Icon, size = "md", highlighted, ...props }, ref) => {
    return (
      <Tooltip label={label}>
        <button
          ref={ref}
          type="button"
          title={label}
          aria-label={label}
          data-size={size}
          data-highlighted={highlighted}
          className="relative rounded border border-transparent p-3 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none data-[size=sm]:p-1.5 data-[highlighted=true]:after:absolute data-[highlighted=true]:after:inset-x-1.5 data-[highlighted=true]:after:bottom-0 data-[highlighted=true]:after:h-0.5 data-[highlighted=true]:after:rounded-full data-[highlighted=true]:after:bg-slate-600"
          {...props}
        >
          <Icon />
        </button>
      </Tooltip>
    )
  },
)
