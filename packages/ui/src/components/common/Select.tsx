import * as RxSelect from "@radix-ui/react-select"
import { TbCheck, TbChevronDown, TbChevronUp } from "react-icons/tb"

import type { IconType } from "react-icons"

type SelectProps<Id extends string | null> = {
  prefix?: IconType
  items: { id: Id; label: string }[]
  value: Id
  onChange: (value: Id) => void
  placeholder?: React.ReactNode
}

export const Select = <Id extends string | null>({
  prefix: PrefixIcon,
  items,
  value,
  onChange,
  placeholder,
}: SelectProps<Id>) => (
  <RxSelect.Root
    value={value ?? "NULL"}
    // @ts-expect-error
    onValueChange={(value) => onChange(value === "NULL" ? null : (value as Id))}
  >
    <RxSelect.Trigger className="flex w-full items-center gap-3 rounded border border-slate-200 px-3 py-2 text-sm hover:border-slate-300 data-[state=open]:border-slate-300">
      {PrefixIcon != null && (
        <PrefixIcon size={18} className="shrink-0 text-slate-400" />
      )}
      <div className="flex min-h-[1lh] grow truncate">
        <RxSelect.Value
          placeholder={<div className="text-slate-400">{placeholder}</div>}
        />
      </div>
      <RxSelect.Icon>
        <TbChevronDown />
      </RxSelect.Icon>
    </RxSelect.Trigger>
    <RxSelect.Portal>
      <RxSelect.Content
        position="popper"
        className="z-10 w-full min-w-[var(--radix-select-trigger-width)] rounded border-slate-200 bg-white shadow-object"
      >
        <RxSelect.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-white">
          <TbChevronUp />
        </RxSelect.ScrollUpButton>
        <RxSelect.Viewport className="w-full p-[5px]">
          {items.map(({ id, label }) => (
            <RxSelect.Item
              key={id ?? "NULL"}
              value={id ?? "NULL"}
              className="relative flex cursor-pointer select-none items-center rounded py-2 pl-[25px] pr-[35px] text-sm leading-none data-[highlighted]:bg-slate-50 data-[highlighted]:outline-none"
            >
              <RxSelect.ItemText>{label}</RxSelect.ItemText>
              <RxSelect.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                <TbCheck />
              </RxSelect.ItemIndicator>
            </RxSelect.Item>
          ))}
        </RxSelect.Viewport>
        <RxSelect.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-white">
          <TbChevronDown />
        </RxSelect.ScrollDownButton>
      </RxSelect.Content>
    </RxSelect.Portal>
  </RxSelect.Root>
)
