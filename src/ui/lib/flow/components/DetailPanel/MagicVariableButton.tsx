import { ImMagicWand } from "react-icons/im"
import { TbArrowRight, TbSquareRotated } from "react-icons/tb"

import type { NodeId } from "@/domain/entity/node/node"

import { useNodeEnvironment } from "@/ui/adapter/query"
import { Popover } from "@/ui/components/common/Popover"
import { associateBy, associateWithList } from "@/utils/set"

type MagicVariableButtonProps = {
  nodeId: NodeId
  onInsert?: (value: string) => void
}

export const MagicVariableButton = ({
  nodeId,
  onInsert,
}: MagicVariableButtonProps) => {
  const environment = useNodeEnvironment(nodeId)
  const environmentMap = associateWithList(
    environment.map(({ variable }) => variable),
    ({ boundIn }) => (boundIn === "global" ? "global" : boundIn.name),
  )
  const variableMap = associateBy(
    environment.map(({ variable }) => variable),
    "id",
  )

  const button = (
    <div className="gap grid h-[28px] w-[28px] place-items-center gap-1 rounded bg-white/80 text-xs text-sky-500 backdrop-blur transition hover:bg-sky-50 active:translate-y-px">
      <ImMagicWand />
    </div>
  )

  return (
    <Popover
      items={environmentMap
        .entries()
        .map(([boundInName, variables]) => {
          const variable = variables[0]
          const isThisNode =
            typeof variable.boundIn === "object" &&
            variable.boundIn.id === nodeId
          return {
            id: variable.boundIn === "global" ? "global" : variable.boundIn.id,
            title: (
              <div className="flex border-t border-t-slate-200 bg-slate-100 px-2 py-2 text-xs text-slate-600 first:border-t-transparent">
                <div className="grow">
                  {isThisNode ? "このブロックで定義された変数" : boundInName}
                </div>
                {!isThisNode && (
                  <div>
                    <TbSquareRotated
                      className="text-slate-400"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
            ),
            items: variables.map(({ id, name }) => ({
              id,
              content: (
                <div className="flex w-full items-center justify-between px-3 py-2">
                  {name}
                  <TbArrowRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
                </div>
              ),
            })),
          }
        })
        .toArray()
        .toReversed()}
      onClick={(VariableId) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const variableName = variableMap.get(VariableId)!.name
        onInsert?.(variableName)
      }}
    >
      {button}
    </Popover>
  )
}
