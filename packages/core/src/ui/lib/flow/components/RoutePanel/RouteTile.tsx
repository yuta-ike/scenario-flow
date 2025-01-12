import { useRef, useState } from "react"
import { TbChevronRight, TbEdit, TbFlag2, TbTrash } from "react-icons/tb"
import clsx from "clsx"
import { flushSync } from "react-dom"
import * as RadixAccordion from "@radix-ui/react-accordion"

import { useSetShowListView } from "../../ListView/showListViewAtom"

import type { FormEvent } from "react"
import type { RouteId } from "@/domain/entity/route/route"
import type { NodeId } from "@/domain/entity/node/node"

import { useNode, usePrimitiveRoute } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { AccordionItem } from "@/ui/components/common/Accordion"
import { deleteRoute, updteRoute } from "@/ui/adapter/command"
import { useFocusNode, useIsNodeFocused } from "@/ui/state/focusedNodeId"
import {
  useIsFocusedRouteId,
  useSetFocuseRoute,
} from "@/ui/state/focusedRouteId"
import { unwrapNull } from "@/utils/result"

type Props = {
  routeId: RouteId
}

export const RouteTile = ({ routeId }: Props) => {
  const route = usePrimitiveRoute(routeId)

  const [editMode, setEditMode] = useState(false)

  const { isFocused } = useIsFocusedRouteId(routeId)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // @ts-expect-error
    const name: string = e.currentTarget.name.value
    handleUpdate(name)
  }

  const handleUpdate = (name: string) => {
    updteRoute(routeId, { name })
    setEditMode(false)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const showListView = useSetShowListView()
  const focus = useSetFocuseRoute()

  return (
    <AccordionItem
      key={route.id}
      value={route.id}
      type="custom"
      title={
        <RadixAccordion.Header className="w-full">
          <RadixAccordion.Trigger
            className="group/handle w-full"
            onClick={() => focus(route.id)}
          >
            <div
              className="group relative flex w-full shrink-0 items-center gap-px text-slate-600 transition data-[selected=true]:bg-slate-100"
              data-selected={isFocused}
            >
              <div className="group/handle z-10 grid h-5 w-5 shrink-0 place-items-center rounded text-slate-400">
                <TbChevronRight
                  size={12}
                  className="transition group-hover/handle:stroke-[3px] group-data-[state=open]/handle:rotate-90"
                />
              </div>
              <div className="flex grow items-center gap-1 rounded px-1">
                <div
                  className="shrink-0"
                  style={{
                    color: route.color,
                  }}
                >
                  <TbFlag2 size={20} fill={route.color} />
                </div>
                <div
                  className={clsx(
                    "grow transition-all",
                    editMode ? "peer grow" : "pointer-events-none",
                  )}
                >
                  <form onSubmit={handleSubmit} className="grow">
                    <input
                      key={route.name}
                      name="name"
                      defaultValue={route.name}
                      type="text"
                      className="w-full rounded border border-transparent bg-transparent px-0 py-1 text-sm transition-[padding] hover:border-slate-200 hover:px-1 focus:bg-white focus:px-1 focus:outline-none focus-visible:border-slate-300"
                      placeholder="シナリオ名"
                      onBlur={(e) => handleUpdate(e.target.value)}
                      ref={inputRef}
                    />
                  </form>
                </div>
                {!editMode && (
                  <div className="z-10 flex w-0 shrink-0 items-center gap-1 overflow-x-hidden opacity-0 transition group-hover:w-max group-hover:opacity-100 peer-focus-within:hidden peer-hover:hidden">
                    <button
                      type="button"
                      title="シナリオを削除"
                      onClick={() => deleteRoute(route.id)}
                      className="rounded border border-transparent p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none"
                    >
                      <TbTrash
                        size={14}
                        stroke="currentColor"
                        strokeWidth={2.5}
                      />
                    </button>
                    <button
                      type="button"
                      title="編集する"
                      onClick={(e) => {
                        flushSync(() => setEditMode(true))
                        inputRef.current?.focus()
                        e.preventDefault()
                      }}
                      className="rounded border border-transparent p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none"
                    >
                      <TbEdit
                        size={14}
                        stroke="currentColor"
                        strokeWidth={2.5}
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </RadixAccordion.Trigger>
        </RadixAccordion.Header>
      }
      gap={4}
    >
      {/* ノード一覧 */}
      <ol className="flex flex-col gap-0.5 pl-5">
        {route.path.map((nodeId) => (
          <ListItem key={nodeId} nodeId={nodeId} />
        ))}
      </ol>
    </AccordionItem>
  )
}

const ListItem = ({ nodeId }: { nodeId: NodeId }) => {
  const node = useNode(nodeId)
  const isFocused = useIsNodeFocused(nodeId)
  const focus = useFocusNode()

  return (
    <li key={node.id}>
      <button
        type="button"
        aria-pressed={isFocused}
        className="group w-full rounded px-2 py-1 hover:bg-slate-50 aria-[pressed=true]:bg-slate-100"
        onClick={() => focus(node.id)}
      >
        {node.actionInstances.map((ai) =>
          "action" in ai && ai.action.type === "rest_call" ? (
            <div key={ai.id} className="flex grow items-center gap-2">
              <MethodChip truncate={3}>
                {ai.instanceParameter.method!}
              </MethodChip>
              <div className="grow truncate text-start text-sm">
                {ai.instanceParameter.path!}
              </div>
            </div>
          ) : ai.type === "include" ? (
            <div key={ai.id} className="flex grow items-center gap-2">
              <div className="text-xs font-bold text-blue-400">Include</div>
              <div className="line-clamp-1 grow text-start text-sm">
                {unwrapNull(ai.instanceParameter.ref)?.name}
              </div>
            </div>
          ) : ai.type === "db" ? (
            <div key={ai.id} className="flex grow items-center gap-2">
              <div className="text-xs font-bold text-blue-400">SQL</div>
              <div className="line-clamp-1 grow text-start text-sm">
                {ai.instanceParameter.query}
              </div>
            </div>
          ) : null,
        )}
      </button>
    </li>
  )
}
