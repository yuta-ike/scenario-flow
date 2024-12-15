import { TbExternalLink } from "react-icons/tb"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { HiMenuAlt4 } from "react-icons/hi"
import clsx from "clsx"

import { RestCallActionBadge } from "../components/DetailPanel/RestCallActionBadge"

import type { Node } from "@/domain/entity/node/node"
import type { ResolvedAction } from "@/domain/entity/action/action"

import { MethodChip } from "@/ui/components/common/MethodChip"
import { useFocusNode, useIsNodeFocused } from "@/ui/state/focusedNodeId"
import { unwrapNull } from "@/utils/result"
import { updateNode } from "@/ui/adapter/command"

type Props = {
  node: Node
  index: number
}

export const StepItem = ({ node, index }: Props) => {
  const focus = useFocusNode()
  const isFocused = useIsNodeFocused(node.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id })

  const updateNodeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(node.id, { name: e.target.value })
  }

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-2"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <div className="shrink-0">
        <button type="button" {...attributes} {...listeners}>
          <HiMenuAlt4
            size={14}
            className="text-slate-400 transition hover:text-slate-600"
          />
        </button>
      </div>
      <div
        data-selected={isFocused}
        className={clsx(
          "outline-transparen group relative w-full grow overflow-hidden rounded-lg border border-slate-200 bg-white outline outline-2 outline-offset-2 outline-transparent transition",
          isDragging ? "shadow-lg" : "data-[selected=true]:outline-blue-300",
        )}
      >
        <button
          className="absolute inset-0"
          type="button"
          onClick={() => focus(node.id)}
        />
        <div className="flex gap-2 border-b border-b-slate-200 px-2 py-1">
          <div className="my-0.5 shrink-0">
            <span className="shrink-0 text-slate-400 group-data-[selected=true]:font-bold group-data-[selected=true]:text-blue-400">
              #{index}
            </span>{" "}
          </div>
          <div className="flex w-full grow flex-col text-sm text-slate-800">
            <input
              type="text"
              className="z-10 max-w-[300px] grow rounded border border-transparent bg-transparent px-1 py-1 hover:border-slate-200 hover:bg-white focus:border-slate-200 focus:bg-white focus:outline-none"
              value={node.name}
              onChange={updateNodeName}
            />
            <div className="line-clamp-3 w-full whitespace-pre-line p-1 text-sm text-slate-500 empty:hidden">
              {node.description}
            </div>
          </div>
        </div>
        <div className="flex w-full">
          <div className="w-[40px] shrink-0" />
          <div className="flex grow flex-col">
            {node.actionInstances.map((ai) => (
              <button
                key={ai.id}
                type="button"
                className="relative border-t border-t-slate-200 p-2 first:border-t-0 empty:hidden hover:bg-slate-50"
                onClick={() => focus(node.id)}
              >
                {ai.type === "rest_call" ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <MethodChip>
                        {ai.instanceParameter.method ?? "GET"}
                      </MethodChip>
                      <div className="text-sm">{ai.instanceParameter.path}</div>
                      {ai.action.resourceType === "resource" && (
                        <div className="text-sm">
                          ({ai.action.resourceIdentifier.identifier.operationId}
                          )
                        </div>
                      )}
                    </div>
                    <div>
                      <RestCallActionBadge
                        action={ai.action as ResolvedAction<"rest_call">}
                      />
                    </div>
                  </div>
                ) : ai.type === "validator" &&
                  0 < ai.instanceParameter.contents.length ? (
                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-bold text-blue-400">Test </div>
                    <div className="font-mono text-xs">
                      {ai.instanceParameter.contents}
                    </div>
                  </div>
                ) : ai.type === "include" ? (
                  <div className="flex items-baseline gap-2">
                    <button
                      type="button"
                      // onClick={() => onChangePage(refRoute.page)}
                      className="flex -translate-x-1 items-center gap-1 rounded px-1 py-1 text-start text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:underline"
                    >
                      <div className="shrink-0">
                        <TbExternalLink />
                      </div>
                      <div>
                        {unwrapNull(ai.instanceParameter.ref)?.page}/
                        {unwrapNull(ai.instanceParameter.ref)?.name}
                      </div>
                    </button>
                  </div>
                ) : ai.type === "binder" &&
                  0 < ai.instanceParameter.assignments.length ? (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-blue-400">Bind </div>
                    {ai.instanceParameter.assignments.map((assign) => (
                      <div
                        key={assign.variableId}
                        className="font-mono text-xs"
                      >
                        {assign.variable.name},{" "}
                      </div>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
