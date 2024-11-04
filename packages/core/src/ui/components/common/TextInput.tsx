import { forwardRef } from "react"

import type { ComponentPropsWithoutRef } from "react"

type TextInputProps = ComponentPropsWithoutRef<"input"> & {
  /** @default full */
  width?: "full" | "md"
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ width = "full", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        {...props}
        className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
        style={{
          width: width === "full" ? "100%" : "320px",
        }}
      />
    )
  },
)
