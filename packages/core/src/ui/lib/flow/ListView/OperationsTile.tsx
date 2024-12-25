import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"
import { FiPlus } from "react-icons/fi"
import { TbApi, TbDatabase, TbFileImport } from "react-icons/tb"

import type { NodeId } from "@/domain/entity/node/node"
import type { RouteId } from "@/domain/entity/route/route"

import {
  appendIncludeNode,
  appendDbNode,
  appendUserDefinedRestCallNode,
} from "@/ui/adapter/command"
import { currentPageAtom } from "@/ui/state/page"

type Props = {
  nodeId: NodeId
}

export const OperationsTile = ({ nodeId }: Props) => {
  const handleCreateNewIncludeNode = useAtomCallback(
    useCallback(
      (get, _) =>
        appendIncludeNode(nodeId, "" as RouteId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const handleCreateUserDefinedApiCallNode = useAtomCallback(
    useCallback(
      (get, _) => appendUserDefinedRestCallNode(nodeId, get(currentPageAtom)),
      [nodeId],
    ),
  )

  const handleAppendDbNode = useAtomCallback(
    useCallback(
      (get, _) => appendDbNode(nodeId, get(currentPageAtom)),
      [nodeId],
    ),
  )
  return (
    <div
      className="grid gap-2 px-8"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      }}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-start text-sm shadow-sm transition hover:bg-slate-50 active:translate-y-0.5"
        onClick={handleCreateUserDefinedApiCallNode}
      >
        <TbApi size={24} className="text-red-500" />
        <div className="grow">API呼び出し</div>
        <FiPlus size={18} className="text-slate-400" />
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-start text-sm shadow-sm transition hover:bg-slate-50 active:translate-y-0.5"
        onClick={handleAppendDbNode}
      >
        <TbDatabase size={20} className="text-blue-500" />
        <div className="grow">クエリ呼び出し</div>
        <FiPlus size={18} className="text-slate-400" />
      </button>
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-start text-sm shadow-sm transition hover:bg-slate-50 active:translate-y-0.5"
        onClick={handleCreateNewIncludeNode}
      >
        <TbFileImport size={20} className="text-orange-500" />
        <div className="grow">他シナリオ読み込み</div>
        <FiPlus size={18} className="text-slate-400" />
      </button>
    </div>
  )
}
