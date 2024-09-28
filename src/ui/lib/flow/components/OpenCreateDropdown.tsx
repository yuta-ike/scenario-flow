import * as Popover from "@radix-ui/react-popover"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { RxCaretLeft, RxCaretRight, RxPlus } from "react-icons/rx"

import { Transition } from "../../common/Transition"

import type { ActionId } from "@/domain/entity/action/action"

import { HTTP_METHODS, type HttpMethod } from "@/utils/http"
import { useSetState } from "@/ui/utils/useSetState"
import { useActions } from "@/ui/adapter/query"
import { ApiCallTile } from "@/ui/page/index/BlockMenu/ApiCallTile"
import { searchFuzzy } from "@/utils/searchFuzzy"

type OpenCreateDropdownProps = {
  children: React.ReactNode
  onCreateApiCall: (actionId: ActionId) => void
}

export const OpenCreateDropdown = ({
  children,
  onCreateApiCall,
}: OpenCreateDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState<1 | 2>(1)
  const [filters, { toggle: toggleFilter }] = useSetState([] as HttpMethod[])

  const actions = useActions()

  const [searchText, setSeachText] = useState("")

  const filteredActions = useMemo(() => {
    const methodFilteredActions = actions.filter((action) => {
      if (filters.length === 0 || filters.length === HTTP_METHODS.length) {
        return true
      } else {
        return filters.includes(action.parameter.method)
      }
    })

    if (searchText.length === 0 || methodFilteredActions.length === 0) {
      return methodFilteredActions
    }

    return searchFuzzy(searchText, methodFilteredActions, {
      keys: [
        (action) => action.parameter.method,
        (action) => action.parameter.path,
        "name",
        "description",
      ],
    })
  }, [actions, filters, searchText])

  const handleSelectApiCall = (actionId: ActionId) => {
    onCreateApiCall(actionId)
    setIsOpen(false)
  }

  useEffect(() => {
    if (isOpen) {
      return () => setPage(1)
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
                <span className="text-xs font-bold text-red-500">API</span>
                呼び出しを追加
                <RxCaretRight size={18} className="ml-auto" />
              </button>
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
                      onClick={() => handleSelectApiCall(action.id)}
                      className="w-full"
                    >
                      <ApiCallTile
                        key={action.id}
                        actionId={action.id}
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
