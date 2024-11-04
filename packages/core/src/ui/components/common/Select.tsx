import * as RxSelect from "@radix-ui/react-select"
import { TbCheck, TbChevronDown, TbChevronUp } from "react-icons/tb"

type SelectProps<Id extends string | null> = {
  items: { id: Id; label: string }[]
  value: Id
  onChange: (value: Id) => void
}

export const Select = <Id extends string | null>({
  items,
  value,
  onChange,
}: SelectProps<Id>) => (
  <RxSelect.Root
    value={value ?? "NULL"}
    // @ts-expect-error
    onValueChange={(value) => onChange(value === "NULL" ? null : (value as Id))}
  >
    <RxSelect.Trigger className="flex w-full items-center justify-between gap-2 rounded border border-transparent px-3 py-1 text-sm hover:border-slate-200 data-[state=open]:border-slate-200">
      <RxSelect.Value />
      <RxSelect.Icon>
        <TbChevronDown />
      </RxSelect.Icon>
    </RxSelect.Trigger>
    <RxSelect.Portal>
      <RxSelect.Content
        position="popper"
        className="z-10 rounded border-slate-200 bg-white shadow-object"
      >
        <RxSelect.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-white">
          <TbChevronUp />
        </RxSelect.ScrollUpButton>
        <RxSelect.Viewport className="p-[5px]">
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
