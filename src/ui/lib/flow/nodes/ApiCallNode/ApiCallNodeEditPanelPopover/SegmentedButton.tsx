import * as ToggleGroup from "@radix-ui/react-toggle-group"

import type { IconType } from "react-icons"

type SegmentedButtonProps<Id extends string> = {
  options: {
    id: Id
    label: string
    icon: IconType
  }[]
  label: string
  value: string
  onSelected: (id: Id) => void
}

export const SegmentedButton = <Id extends string = string>({
  options,
  label,
  value,
  onSelected,
}: SegmentedButtonProps<Id>) => {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={onSelected}
      className="flex items-center overflow-hidden rounded border border-slate-200"
      aria-label={label}
    >
      {options.map(({ id, label, icon: Icon }) => (
        <ToggleGroup.Item
          key={id}
          value={id}
          className="bg-slate-100 px-1.5 py-1 text-[#676767] data-[state=on]:bg-white"
          aria-label={label}
        >
          <Icon size={14} />
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
