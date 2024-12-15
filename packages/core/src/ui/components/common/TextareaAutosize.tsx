import { forwardRef } from "react"

import type { ComponentPropsWithoutRef } from "react"

export type TextareaAutosizeProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "value"
> & {
  value: string
}

export const TextareaAutosize = forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>(({ className, style, ...props }, ref) => {
  const value = props.value
  return (
    <div className="relative">
      <div
        className={className}
        style={{
          ...style,
          userSelect: "none",
          pointerEvents: "none",
          whiteSpace: "pre-line",
          opacity: 0,
        }}
        aria-hidden
      >
        <div style={{ minHeight: "1lh" }}>
          {props.rows != null
            ? `a${Array(props.rows).fill("\n").join("")}a`
            : value.endsWith("\n")
              ? value + "a"
              : props.value}
        </div>
      </div>
      <textarea
        className={className}
        style={{
          ...style,
          position: "absolute",
          inset: 0,
        }}
        {...props}
        ref={ref}
      />
    </div>
  )
})
