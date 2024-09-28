import { forwardRef, useId } from "react"

import type { IconType } from "react-icons"

type RadioPanelProps = {
  children: string
  name: string
  value: string
  icon: IconType
} & React.ComponentPropsWithoutRef<"input">

export const RadioPanel = forwardRef<HTMLInputElement, RadioPanelProps>(
  ({ children, name, icon: Icon, value, ...props }, ref) => {
    const id = useId()
    return (
      <div className="relative flex flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-200 px-2 py-4 transition focus-within:border-blue-400 hover:bg-slate-50 hover:shadow-sm active:translate-y-px has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50">
        <input
          ref={ref}
          {...props}
          id={id}
          name={name}
          type="radio"
          value={value}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div>
          <Icon size={28} />
        </div>
        <div>
          <label htmlFor={id} className="text-xs leading-none">
            {children}
          </label>
        </div>
      </div>
    )
  },
)
