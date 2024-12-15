import { useRef, useState } from "react"
import {
  TbChevronRight,
  TbEdit,
  TbFlag2,
  TbPlayerPlay,
  TbTrash,
  TbViewfinder,
} from "react-icons/tb"
import clsx from "clsx"
import { flushSync } from "react-dom"
import * as RadixAccordion from "@radix-ui/react-accordion"

import { RunModalContent } from "../RunButton/RunModalContent"

import type { FormEvent } from "react"
import type { RouteId } from "@/domain/entity/route/route"
import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"

import { useRoute } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { AccordionItem } from "@/ui/components/common/Accordion"
import { deleteRoute, updteRoute } from "@/ui/adapter/command"
import { CustomModal } from "@/ui/components/common/CustomModal"
import { useFocusNode } from "@/ui/state/focusedNodeId"
import { IconButton } from "@/ui/components/common/IconButton"
import {
  useIsFocusedRouteId,
  useSetFocuseRoute,
} from "@/ui/state/focusedRouteId"

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
  }

  const inputRef = useRef<HTMLInputElement>(null)

  const focus = useSetFocuseRoute()

  return (
    <AccordionItem
      key={route.id}
      value={route.id}
      type="custom"
      title={
        <RadixAccordion.Header className="w-full">
          <div className="group relative flex w-full shrink-0 items-center gap-px rounded text-slate-600 transition">
            <button
              type="button"
              className="absolute inset-0"
              onClick={() => focus(routeId)}
            />
            <RadixAccordion.Trigger className="group/handle z-10 shrink-0">
              <div className="grid h-5 w-5 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-800">
                <TbChevronRight
                  size={12}
                  className="transition group-hover/handle:stroke-[3px] group-data-[state=open]/handle:rotate-90"
                />
              </div>
            </RadixAccordion.Trigger>
            <div
              className="flex items-center gap-1 rounded p-1 data-[selected=true]:bg-slate-100"
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
                  "transition-all",
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
                    onBlur={(e) => {
                      handleUpdate(e.target.value)
                      setEditMode(false)
                    }}
                    ref={inputRef}
                  />
                </form>
              </div>
              {!editMode && (
                <div className="z-10 flex w-0 shrink-0 items-center gap-1 overflow-x-hidden opacity-0 transition group-hover:w-max group-hover:opacity-100 peer-focus-within:hidden peer-hover:hidden">
                  <CustomModal
                    modal={<RunModalContent initialSelected={[route.id]} />}
                  >
                    <button
                      type="button"
                      title="テストを実行する"
                      className="rounded border border-transparent p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus:border-slate-300 focus:bg-slate-100 focus:outline-none"
                    >
                      <TbPlayerPlay
                        size={14}
                        stroke="currentColor"
                        strokeWidth={2.5}
                      />
                    </button>
                  </CustomModal>
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
                </div>
              )}
            </div>
          </div>
        </RadixAccordion.Header>
      }
      gap={4}
    >
      {/* ノード一覧 */}
      <ol className="flex flex-col pl-2">
        {route.path.map((node) => (
          <li
            key={node.id}
            className="group rounded px-2 py-1 transition hover:bg-slate-50"
          >
            {node.actionInstances
              .filter(
                (instance): instance is ResolvedRestCallActionInstance =>
                  instance.type === "rest_call",
              )
              .map((instance) => {
                const action = instance.action
                if (action.type !== "rest_call") {
                  return
                }

                return (
                  <div
                    key={instance.id}
                    className="flex w-full justify-between gap-2 text-sm"
                  >
                    <div className="flex grow items-center gap-2">
                      <MethodChip truncate={3}>
                        {instance.instanceParameter.method!}
                      </MethodChip>
                      <div className="grow truncate">
                        {instance.instanceParameter.path!}
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
              })}
          </li>
        ))}
      </ol>
    </AccordionItem>
  )
}
