import * as RxTooltip from "@radix-ui/react-tooltip"

type TooltipProps = {
  children: React.ReactNode
  label: string
}

export const Tooltip = ({ children, label }: TooltipProps) => {
  return (
    <RxTooltip.Provider delayDuration={100}>
      <RxTooltip.Root>
        <RxTooltip.Trigger asChild>{children}</RxTooltip.Trigger>
        <RxTooltip.Portal>
          <RxTooltip.Content
            className="rounded bg-slate-800 px-2.5 py-1.5 text-xs text-white shadow-sm"
            sideOffset={5}
          >
            {label}
            <RxTooltip.Arrow className="fill-slate-800" />
          </RxTooltip.Content>
        </RxTooltip.Portal>
      </RxTooltip.Root>
    </RxTooltip.Provider>
  )
}
