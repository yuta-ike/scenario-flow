import * as Popover from "@radix-ui/react-popover"
import clsx from "clsx"
import { useEffect, useMemo, useState } from "react"
import { RxCaretLeft, RxPlus } from "react-icons/rx"
import {
  TbApi,
  TbArrowRightCircle,
  TbDatabase,
  TbFileImport,
} from "react-icons/tb"
import { Handle, Position, useReactFlow } from "@xyflow/react"
import { FiChevronRight, FiPlus } from "react-icons/fi"
import { flushSync } from "react-dom"

import { Transition } from "../../common/Transition"

import { IncludeSelectPage } from "./IncludeSelectPage"

import type { RouteId } from "@/domain/entity/route/route"
import type { NodeId } from "@/domain/entity/node/node"
import type { HttpMethod } from "@/utils/http"

import { type ActionSourceIdentifier } from "@/domain/entity/action/identifier"
import { useFocusNode } from "@/ui/state/focusedNodeId"
import { Button } from "@/ui/components/common/Button"
import { getIdentifier } from "@/domain/entity/action/action"
import { ApiCallTile } from "@/ui/page/index/BlockMenu/ApiCallTile"
import { HTTP_METHODS } from "@/utils/http"
import { searchFuzzy } from "@/utils/searchFuzzy"
import { useActions } from "@/ui/adapter/query"

type OpenCreateDropdownProps = {
  children: React.ReactNode
  onCreateApiCall: (actionId: ActionSourceIdentifier) => NodeId
  onCreateUserDefinedApiCall: () => NodeId
  onCreateIclude: (routeId: RouteId) => NodeId
  onCreateDbNode: () => NodeId
  mode: "append" | "insert"
}

export const OpenCreateDropdown = ({
  children,
  onCreateApiCall,
  onCreateUserDefinedApiCall,
  onCreateIclude,
  onCreateDbNode,
  mode,
}: OpenCreateDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState<1 | 2 | 3>(1)
  const focus = useFocusNode()
  const reactflow = useReactFlow()

  const handleSelectInclude = (routeId: RouteId) => {
    onCreateIclude(routeId)
    setIsOpen(false)
  }

  const handleCreatNewNode = () => {
    let nodeId: NodeId
    flushSync(() => {
      nodeId = onCreateUserDefinedApiCall()
      setIsOpen(false)
      focus(nodeId)
    })
    const node = reactflow.getNode(nodeId!)
    if (node == null) {
      return
    }
    setTimeout(() => {
      void reactflow.setCenter(
        node.position.x + 160 / 2,
        node.position.y + window.innerHeight * 0.2,
        { zoom: reactflow.getZoom(), duration: 500 },
      )
    }, 150)
  }

  const handleCreateDbNode = () => {
    onCreateDbNode()
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

  const [searchText, setSeachText] = useState("")

  const [filters, setFilters] = useState<HttpMethod[]>([])
  const toggleFilter = (method: HttpMethod) => {
    setFilters((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    )
  }

  const actions = useActions()

  const filteredActions = useMemo(() => {
    const exampleOmitted = actions
      .filter((action) => action.type === "rest_call")
      .filter(
        (action) =>
          !(
            action.schema.base.method === "GET" &&
            action.schema.base.path === "/example"
          ),
      )

    if (searchText.length === 0) {
      return exampleOmitted
    }

    return searchFuzzy(searchText, exampleOmitted, {
      keys: [
        (action) => action.schema.base.method!,
        (action) => action.schema.base.path!,
      ],
    })
  }, [actions, searchText])

  const handleSelectApiCall = (action: ActionSourceIdentifier) => {
    onCreateApiCall(action)
    setIsOpen(false)
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className={clsx(
            "relative z-10 flex overflow-hidden rounded-lg bg-white p-0.5 shadow-object transition-[width] delay-100 duration-200",
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
                API呼び出し
                <FiChevronRight size={18} className="ml-auto text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => setPage(3)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm leading-none text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:outline-none"
              >
                <TbFileImport
                  size={20}
                  strokeWidth={2.5}
                  className="m-0.5 fill-current text-orange-500"
                />
                シナリオ呼び出し
                <FiChevronRight size={18} className="ml-auto text-slate-500" />
              </button>
              <button
                type="button"
                onClick={handleCreateDbNode}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm leading-none text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:outline-none"
              >
                <TbDatabase
                  size={20}
                  strokeWidth={2.5}
                  className="m-0.5 text-blue-500"
                />
                クエリ呼び出し
                <FiPlus size={18} className="ml-auto text-slate-500" />
              </button>
              {mode === "append" && (
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-sm leading-none text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:outline-none"
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
              )}
            </div>
          </Transition>

          {page === 2 && (
            <div className="flex w-full animate-slideIn flex-col gap-2 p-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="rounded p-1 transition hover:bg-slate-100"
                  onClick={() => setPage(1)}
                >
                  <RxCaretLeft size={18} />
                </button>
                <Button
                  theme="secondary"
                  size="sm"
                  onClick={handleCreatNewNode}
                  prefix={FiPlus}
                >
                  新規作成
                </Button>
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
                  <hr />
                  <Button
                    theme="secondary"
                    size="md"
                    onClick={handleCreatNewNode}
                    prefix={FiPlus}
                  >
                    新規作成
                  </Button>
                </div>
              </div>
            </div>
          )}

          {page === 3 && (
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

              <div>
                <IncludeSelectPage onCreate={handleSelectInclude} />
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
