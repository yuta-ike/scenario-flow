import clsx from "clsx"
import { forwardRef } from "react"

import type { ComponentPropsWithoutRef } from "react"

type ButtonProps = {
  children: string
  type?: "button" | "submit" | "reset"
  theme?: "primary" | "secondary"
} & Omit<ComponentPropsWithoutRef<"button">, "children">

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", theme = "primary", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        {...props}
        className={clsx(
          "rounded-md border px-4 py-2.5 text-sm leading-none transition focus:outline-none active:translate-y-px",
          theme === "primary" &&
            "border-slate-800 bg-slate-800 text-white hover:bg-slate-700 disabled:border-slate-200 disabled:bg-slate-200",
          theme === "secondary" &&
            "border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
        )}
      >
        {children}
      </button>
    )
  },
)
