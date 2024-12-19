import { useRef, useState } from "react"
import {
  TbChevronRight,
  TbEdit,
  TbFlag2,
  TbLayoutSidebarRightCollapse,
  TbTrash,
  TbViewfinder,
} from "react-icons/tb"
import clsx from "clsx"
import { flushSync } from "react-dom"
import * as RadixAccordion from "@radix-ui/react-accordion"

import { useSetShowListView } from "../../ListView"

import type { FormEvent } from "react"
import type { RouteId } from "@/domain/entity/route/route"

import { useRoute } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { AccordionItem } from "@/ui/components/common/Accordion"
import { deleteRoute, updteRoute } from "@/ui/adapter/command"
import { useFocusNode } from "@/ui/state/focusedNodeId"
import { IconButton } from "@/ui/components/common/IconButton"
import {
  useIsFocusedRouteId,
  useSetFocuseRoute,
} from "@/ui/state/focusedRouteId"
import { unwrapNull } from "@/utils/result"

type Props = {
  routeId: RouteId
}

export const RouteTile = ({ routeId }: Props) => {
  const route = useRoute(routeId)
  const focusNode = useFocusNode()

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
          <div className="group relative flex w-full shrink-0 items-center gap-px rounded text-slate-600 transition">
            {isFocused ? (
              <RadixAccordion.Trigger className="group/handle z-10 shrink-0">
                <button
                  type="button"
                  className="absolute inset-0"
                  onClick={() => focus(routeId)}
                />
              </RadixAccordion.Trigger>
            ) : (
              <button
                type="button"
                className="absolute inset-0"
                onClick={() => focus(routeId)}
              />
            )}
            <RadixAccordion.Trigger className="group/handle z-10 shrink-0">
              <div className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                <TbChevronRight
                  size={12}
                  className="transition group-hover/handle:stroke-[3px] group-data-[state=open]/handle:rotate-90"
                />
              </div>
            </RadixAccordion.Trigger>
            <div
              className="flex grow items-center gap-1 rounded px-1 py-0.5 data-[selected=true]:bg-slate-100"
              data-selected={isFocused}
            >
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
                    className="w-full rounded border border-transparent bg-transparent px-0 py-1 text-sm transition-[padding] hover:border-slate-200 hover:px-1 focus:bg-white focus:px-1 focus:outline-none focus-visible:border-slate-400"
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
                    <TbEdit size={14} stroke="currentColor" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    title="リストパネルを開く"
                    onClick={() => {
                      focus(route.id)
                      showListView(true)
                    }}
                    className="rounded border border-transparent p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none"
                  >
                    <TbLayoutSidebarRightCollapse />
                  </button>
                </div>
              )}
            </div>
          </div>
        </RadixAccordion.Header>
      }
      gap={4}
    >
      {/* ノード一覧 */}
      <ol className="flex flex-col pl-5">
        {route.path.map((node) => (
          <li
            key={node.id}
            className="group rounded px-2 py-1 transition hover:bg-slate-50"
          >
            {node.actionInstances.map((ai) => {
              if ("action" in ai && ai.action.type === "rest_call") {
                return (
                  <div
                    key={ai.id}
                    className="flex w-full justify-between gap-2 text-sm"
                  >
                    <div className="flex grow items-center gap-2">
                      <MethodChip truncate={3}>
                        {ai.instanceParameter.method!}
                      </MethodChip>
                      <div className="grow truncate">
                        {ai.instanceParameter.path!}
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100">
                      <IconButton
                        onClick={() => focusNode(node.id)}
                        icon={TbViewfinder}
                        size="sm"
                        label="フォーカス"
                        variant="segmented"
                      />
                    </div>
                  </div>
                )
              } else if (ai.type === "include") {
                return (
                  <div
                    key={ai.id}
                    className="flex w-full justify-between gap-2 text-sm"
                  >
                    <div className="flex grow items-center gap-2">
                      <div className="text-xs font-bold text-blue-400">
                        Include
                      </div>
                      <div className="line-clamp-1 grow">
                        {unwrapNull(ai.instanceParameter.ref)?.name}
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100">
                      <IconButton
                        onClick={() => focusNode(node.id)}
                        icon={TbViewfinder}
                        size="sm"
                        label="フォーカス"
                        variant="segmented"
                      />
                    </div>
                  </div>
                )
              } else if (ai.type === "db") {
                return (
                  <div
                    key={ai.id}
                    className="flex w-full justify-between gap-2 text-sm"
                  >
                    <div className="flex grow items-center gap-2">
                      <div className="text-xs font-bold text-blue-400">SQL</div>
                      <div className="line-clamp-1 grow">
                        {ai.instanceParameter.query}
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100">
                      <IconButton
                        onClick={() => focusNode(node.id)}
                        icon={TbViewfinder}
                        size="sm"
                        label="フォーカス"
                        variant="segmented"
                      />
                    </div>
                  </div>
                )
              } else {
                return null
              }
            })}
          </li>
        ))}
      </ol>
    </AccordionItem>
  )
}
