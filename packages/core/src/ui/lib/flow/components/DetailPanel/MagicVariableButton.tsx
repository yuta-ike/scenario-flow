import { ImMagicWand } from "react-icons/im"
import { TbArrowRight, TbSquareRotated } from "react-icons/tb"
import { useState } from "react"

import { useFocusOn } from "../../useFocusOn"

import type { ResolvedEnvironment } from "@/domain/entity/environment/environment"
import type { NodeId } from "@/domain/entity/node/node"

import { Popover } from "@/ui/components/common/Popover"
import { associateWithList } from "@/utils/set"
import { useSetHighlightedNodeId } from "@/ui/state/highlightedNodeId"
import { getVariableName } from "@/domain/entity/environment/variable"
import { getBoundIn } from "@/domain/entity/variable/variable"
import { nonNull } from "@/utils/assert"

type MagicVariableButtonProps = {
  onInsert?: (value: string) => void
  environment: ResolvedEnvironment
  currentNodeId?: NodeId
}

export const MagicVariableButton = ({
  onInsert,
  environment,
  currentNodeId,
}: MagicVariableButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  // const environment = useParentNodeEnvironment(nodeId)
  const environmentMap = associateWithList(
    environment,
    ({ variable: { boundIn } }) =>
      boundIn === "global"
        ? "global"
        : boundIn.type === "node"
          ? boundIn.node.name
          : boundIn.route.name,
  )
  const bindMap = associateWithList(environment, ({ variable: { id } }) => id)

  const highlight = useSetHighlightedNodeId()
  const focusOn = useFocusOn()

  const button = (
    <div className="gap grid h-[28px] w-[28px] place-items-center gap-1 rounded bg-white/80 text-xs text-sky-500 backdrop-blur transition hover:bg-sky-50 active:translate-y-px">
      <ImMagicWand />
    </div>
  )

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      items={environmentMap
        .entries()
        .map(([boundInName, binds]) => {
          const { variable } = binds[0]
          const boundIn = getBoundIn(variable)
          const isThisNode =
            typeof variable.boundIn === "object" &&
            boundIn?.nodeId === currentNodeId
          return {
            id: boundIn?.nodeId ?? boundIn?.routeId ?? "global",
            title: (
              <div className="flex border-t border-t-slate-200 bg-slate-100 px-2 py-2 text-xs text-slate-600 first:border-t-transparent">
                <div className="grow">
                  {isThisNode ? "このブロックで定義された変数" : boundInName}
                </div>
                {variable.boundIn !== "global" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (variable.boundIn === "global") {
                        return
                      }
                      if (boundIn?.nodeId != null) {
                        highlight(boundIn.nodeId)
                        void focusOn(
                          [currentNodeId, boundIn.nodeId].filter(nonNull),
                        )
                      }
                      e.stopPropagation()
                    }}
                    className="group rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <TbSquareRotated
                      className="transition group-hover:rotate-180 group-hover:scale-105"
                      strokeWidth={3}
                    />
                  </button>
                )}
              </div>
            ),
            items: binds.map((bind) => ({
              id: bind.variable.id,
              content: (
                <div
                  className="flex w-full items-center justify-between px-3 py-2"
                  onMouseEnter={() => {
                    if (variable.boundIn === "global") {
                      return
                    }
                    if (typeof variable.boundIn === "string") {
                      highlight(variable.boundIn)
                    }
                  }}
                  onMouseLeave={() => {
                    if (variable.boundIn === "global") {
                      return
                    }
                    highlight(null)
                  }}
                >
                  {getVariableName(bind.variable)}
                  <TbArrowRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400" />
                </div>
              ),
            })),
          }
        })
        .toArray()
        .toReversed()}
      empty={
        <div className="grid place-items-center gap-3 p-4 text-sm text-slate-600">
          <ImMagicWand size={20} className="text-slate-400" />
          利用できる変数がありません
        </div>
      }
      onClick={(VariableId) => {
        const bind = bindMap.get(VariableId)![0]
        onInsert?.(getVariableName(bind.variable))
        setIsOpen(false)
      }}
    >
      {button}
    </Popover>
  )
}
