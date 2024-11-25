import * as Popover from "@radix-ui/react-popover"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { RxCaretLeft, RxCaretRight, RxPlus } from "react-icons/rx"
import { TbApi, TbArrowRightCircle } from "react-icons/tb"
import { Handle, Position } from "@xyflow/react"

import { Transition } from "../../common/Transition"

import type { Action } from "@/domain/entity/action/action"

import { type ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import { HTTP_METHODS, type HttpMethod } from "@/utils/http"
import { useSetState } from "@/ui/utils/useSetState"
import { useActions } from "@/ui/adapter/query"
import { ApiCallTile } from "@/ui/page/index/BlockMenu/ApiCallTile"
import { searchFuzzy } from "@/utils/searchFuzzy"
import { getIdentifier } from "@/domain/entity/action/action"

type OpenCreateDropdownProps = {
  children: React.ReactNode
  onCreateApiCall: (actionId: ActionSourceIdentifier) => void
}

export const OpenCreateDropdown = ({
  children,
  onCreateApiCall,
}: OpenCreateDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState<1 | 2>(1)
  const [filters, { toggle: toggleFilter }] = useSetState([] as HttpMethod[])

  const actions = useActions().filter((action) => action.type === "rest_call")

  const [searchText, setSeachText] = useState("")

  const filteredActions = useMemo(() => {
    const methodFilteredActions = actions.filter((action) => {
      if (filters.length === 0 || filters.length === HTTP_METHODS.length) {
        return true
      } else {
        return filters.includes(action.schema.base.method!)
      }
    })

    if (searchText.length === 0 || methodFilteredActions.length === 0) {
      return methodFilteredActions
    }

    return searchFuzzy(searchText, methodFilteredActions, {
      keys: [
        (action) => action.schema.base.method!,
        (action) => action.schema.base.path!,
        "name",
        "description",
      ],
    })
  }, [actions, filters, searchText])

  const handleSelectApiCall = (action: Action) => {
    onCreateApiCall(getIdentifier(action))
    setIsOpen(false)
  }

  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (isOpen) {
      return () => {
        setPage(1)
        setIsDragging(false)
      }
    }
  }, [isOpen])

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={clsx(
            "relative flex overflow-hidden rounded-lg bg-white p-0.5 shadow-object transition-[width] delay-100 duration-200",
            page === 1 ? "w-[240px]" : "w-[320px]",
            isDragging && "opacity-0",
          )}
          sideOffset={5}
        >
          <Transition show={page === 1} delay={195}>
            <div
              className={clsx(
                "w-full",
                page !== 1 && "absolute inset-0.5 animate-slideOut",
              )}
            >
              <button
                type="button"
                onClick={() => setPage(2)}
                data-active={page === 1}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm leading-none text-slate-700 data-[active=true]:hover:bg-slate-100 data-[active=true]:hover:text-slate-900 data-[active=true]:hover:outline-none"
              >
                <TbApi size={24} className="text-red-500" />
                呼び出しを追加
                <RxCaretRight size={18} className="ml-auto" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  data-active={page === 1}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm leading-none text-slate-700 data-[active=true]:hover:bg-slate-100 data-[active=true]:hover:text-slate-900 data-[active=true]:hover:outline-none"
                  onPointerDown={() => setIsDragging(true)}
                >
                  <TbArrowRightCircle
                    size={24}
                    className="-rotate-45 text-purple-500"
                  />
                  他のノードに接続する
                  <Handle
                    type="source"
                    position={Position.Top}
                    className="!absolute !inset-0 !h-full !w-full !translate-x-0 !translate-y-0 !rounded-none"
                  />
                </button>
              </div>
            </div>
          </Transition>

          {page === 2 && (
            <div className="flex w-full animate-slideIn flex-col gap-2 p-2">
              <div>
                <button
                  type="button"
                  className="rounded p-1 transition hover:bg-slate-100"
                  onClick={() => setPage(1)}
                >
                  <RxCaretLeft size={18} />
                </button>
              </div>
              <input
                placeholder="検索"
                type="text"
                value={searchText}
                onChange={(e) => setSeachText(e.target.value)}
                className="w-full rounded border border-transparent bg-slate-100 px-3 py-2 text-sm leading-none transition focus:border-slate-200 focus:outline-none"
              />

              <div className="flex gap-1 overflow-x-scroll">
                {HTTP_METHODS.map((method) => (
                  <button
                    type="button"
                    key={method}
                    aria-pressed={filters.includes(method)}
                    onClick={() => toggleFilter(method)}
                    className="rounded bg-slate-300 px-2 py-1 text-xs font-bold leading-none text-white aria-[pressed=true]:bg-blue-500"
                  >
                    {method}
                  </button>
                ))}
              </div>
              <div className="h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleSelectApiCall(action)}
                      className="w-full"
                    >
                      <ApiCallTile
                        key={action.id}
                        actionIdentifier={getIdentifier(action)}
                        suffix={RxPlus}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}