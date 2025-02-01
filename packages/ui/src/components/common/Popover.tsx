import React from "react"
import * as RxPopover from "@radix-ui/react-popover"

type Item<Id> = {
  id: Id
  content: React.ReactNode
}

type PopoverProps<Id> = {
  children: React.ReactNode
  items: {
    id: string
    title: React.ReactNode
    items: Item<Id>[]
  }[]
  empty?: React.ReactNode
  onClick: (id: Id, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Popover = <Id extends string = string>({
  children,
  items,
  empty,
  onClick,
  open,
  onOpenChange,
}: PopoverProps<Id>) => {
  return (
    <RxPopover.Root open={open} onOpenChange={onOpenChange}>
      <RxPopover.Trigger>{children}</RxPopover.Trigger>
      <RxPopover.Portal>
        <RxPopover.Content
          className="z-10 min-w-[240px] overflow-hidden rounded-lg border border-slate-100 bg-white shadow-object"
          side="bottom"
          align="start"
          sideOffset={12}
        >
          <ol>
            {items.map(({ id, title, items }) => (
              <li key={id}>
                {title}
                <ol className="flex flex-col">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={(e) => onClick(item.id, e)}
                        className="group w-full text-start text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:outline-none"
                      >
                        {item.content}
                      </button>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
          {items.length === 0 && empty}
        </RxPopover.Content>
      </RxPopover.Portal>
    </RxPopover.Root>
  )
}
