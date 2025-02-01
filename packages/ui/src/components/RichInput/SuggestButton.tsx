import { useState } from "react"
import { ImMagicWand } from "react-icons/im"
import { TbArrowRight } from "react-icons/tb"
import { Popover } from "../common"

export type SuggestGroup = { title: string; variables: { name: string }[] }

type SuggestButtonProps = {
  suggests: SuggestGroup[]
  onInsert: (value: string) => void
}

export const SuggestButton = ({ suggests, onInsert }: SuggestButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      items={suggests.map(({ title, variables }) => {
        return {
          id: title,
          title: (
            <div className="flex border-t border-t-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-600 first:border-t-transparent">
              <div className="grow">{title}</div>
            </div>
          ),
          items: variables.map((variable) => ({
            id: variable.name,
            content: (
              <div className="flex w-full items-center justify-between px-3 py-2 text-sm">
                {variable.name}
                <TbArrowRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
              </div>
            ),
          })),
        }
      })}
      empty={
        <div className="grid place-items-center gap-3 p-4 text-sm text-slate-600">
          <ImMagicWand size={20} className="text-slate-400" />
          利用できる変数がありません
        </div>
      }
      onClick={(variableId) => {
        const variable = suggests
          .flatMap(({ variables }) => variables)
          .find((variable) => variable.name === variableId)
        if (variable == null) {
          return
        }
        onInsert(variable.name)
        setIsOpen(false)
      }}
    >
      <button className="rounded border border-transparent p-1.5 transition hover:border-sky-100 hover:bg-sky-50 active:translate-y-0.5">
        <ImMagicWand size={14} className="text-sky-500" />
      </button>
    </Popover>
  )
}
