import clsx from "clsx"
import { forwardRef } from "react"
import { FiLoader } from "react-icons/fi"

import type { IconType } from "react-icons"
import { ComposeComponentProps } from "../../utils/composeComponentProps"

type ButtonProps = ComposeComponentProps<
  "button",
  {
    children: string
    type?: "button" | "submit" | "reset"
    size?: "sm" | "md"
    theme?: "primary" | "secondary" | "skelton"
    prefix?: IconType
    loading?: boolean
  }
>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      theme = "primary",
      size = "md",
      prefix: Prefix,
      children,
      loading = false,
      disabled = loading,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        {...props}
        disabled={disabled}
        data-size={size}
        className={clsx(
          "flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm leading-none transition focus:outline-none active:translate-y-px",
          theme === "primary" &&
            "border-slate-800 bg-slate-800 text-white hover:bg-slate-700 disabled:border-slate-200 disabled:bg-slate-200",
          theme === "secondary" &&
            "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
          theme === "skelton" &&
            "border-transparent text-slate-800 hover:bg-slate-400/20",
          "data-[size=sm]:gap-1 data-[size=sm]:px-3 data-[size=sm]:py-2 data-[size=sm]:text-xs data-[size=sm]:leading-none",
        )}
      >
        {Prefix != null && !loading && (
          <div className="shrink-0">
            <Prefix />
          </div>
        )}
        {loading && <FiLoader className="animate-spin" />}
        {children}
      </button>
    )
  },
)
