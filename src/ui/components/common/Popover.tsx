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
  onClick: (id: Id) => void
}

export const Popover = <Id extends string = string>({
  children,
  items,
  onClick,
}: PopoverProps<Id>) => {
  return (
    <RxPopover.Root>
      <RxPopover.Trigger>{children}</RxPopover.Trigger>
      <RxPopover.Portal>
        <RxPopover.Content
          className="min-w-[240px] overflow-hidden rounded-lg border border-slate-100 bg-white shadow-object"
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
                        onClick={() => onClick(item.id)}
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
        </RxPopover.Content>
      </RxPopover.Portal>
    </RxPopover.Root>
  )
}
