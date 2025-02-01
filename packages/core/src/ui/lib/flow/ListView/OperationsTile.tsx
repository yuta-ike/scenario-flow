import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"
import { FiPlus } from "react-icons/fi"
import { TbApi, TbDatabase, TbFileImport } from "react-icons/tb"

import { useStore } from "../../provider"
import { NodeId, RouteId } from "../../../../domain/entity"
import {
  appendIncludeNode,
  appendUserDefinedRestCallNode,
  appendDbNode,
} from "../../../adapter/command"
import { currentPageAtom } from "../../../state/page"

type Props = {
  nodeId: NodeId
}

export const OperationsTile = ({ nodeId }: Props) => {
  const store = useStore()

  const handleCreateNewIncludeNode = useAtomCallback(
    useCallback(
      (get, _) =>
        appendIncludeNode(store, nodeId, "" as RouteId, get(currentPageAtom)),
      [nodeId],
    ),
    { store: store.store },
  )

  const handleCreateUserDefinedApiCallNode = useAtomCallback(
    useCallback(
      (get, _) =>
        appendUserDefinedRestCallNode(store, nodeId, get(currentPageAtom)),
      [nodeId],
    ),
    { store: store.store },
  )

  const handleAppendDbNode = useAtomCallback(
    useCallback(
      (get, _) => appendDbNode(store, nodeId, get(currentPageAtom)),
      [nodeId],
    ),
    { store: store.store },
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
