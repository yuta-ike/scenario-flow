import { memo, useCallback } from "react"
import { Handle, Position, useConnection, type NodeProps } from "@xyflow/react"
import { FiPlus } from "react-icons/fi"
import { TbApi, TbDatabase, TbFileImport } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"

import type { CreateNode as CreateNodeType } from "../../type"
import { useStore } from "../../../provider"
import { RouteId } from "../../../../../domain/entity"
import {
  appendIncludeNode,
  appendUserDefinedRestCallNode,
  appendDbNode,
} from "../../../../adapter/command"
import { currentPageAtom } from "../../../../state/page"

type ApiCallNodeProps = NodeProps<CreateNodeType>

export const CreateNode = memo<ApiCallNodeProps>(
  ({ data: { originalNodeId: nodeId } }) => {
    const store = useStore()
    const connection = useConnection()

    const handleCreateNewIncludeNode = useAtomCallback(
      useCallback(
        (get, _) =>
          appendIncludeNode(store, nodeId, "" as RouteId, get(currentPageAtom)),
        [nodeId],
      ),
      { store: store.store },
    )

    const handleInsertUserDefinedApiCallNode = useAtomCallback(
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
      <>
        {!connection.inProgress && (
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={false}
            className="opacity-0"
          />
        )}
        <div className="group box-content hidden w-[240px] flex-col gap-1 rounded-lg border border-dashed border-slate-200 p-1 outline outline-2 outline-offset-2 outline-transparent transition hover:border-solid hover:bg-slate-100">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white bg-opacity-30 p-1 text-start text-xs transition hover:bg-slate-50 group-hover:bg-opacity-100"
            onClick={handleInsertUserDefinedApiCallNode}
          >
            <TbApi size={24} className="text-red-500" />
            <div className="grow">API呼び出し</div>
            <FiPlus size={18} className="text-slate-400" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white bg-opacity-30 p-1 text-start text-xs transition hover:bg-slate-50 group-hover:bg-opacity-100"
            onClick={handleAppendDbNode}
          >
            <TbDatabase size={20} className="text-blue-500" />
            <div className="grow">クエリ呼び出し</div>
            <FiPlus size={18} className="text-slate-400" />
          </button>
          <button
            type="button"
            onClick={handleCreateNewIncludeNode}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white bg-opacity-30 p-1 text-start text-xs transition hover:bg-slate-50 group-hover:bg-opacity-100"
          >
            <TbFileImport size={20} className="text-orange-500" />
            <div className="grow">他シナリオ読み込み</div>
            <FiPlus size={18} className="text-slate-400" />
          </button>
        </div>
      </>
    )
  },
)
