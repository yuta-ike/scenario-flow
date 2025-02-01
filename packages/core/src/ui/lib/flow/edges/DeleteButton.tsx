import { TbTrash } from "react-icons/tb"

import { useStore } from "../../provider"
import { NodeId } from "../../../../domain/entity"
import { disconnectNodes } from "../../../adapter/command"

type Props = {
  expanded: boolean
  fromNodeId: NodeId
  toNodeId: NodeId
}

export const DeleteButton = ({ expanded, fromNodeId, toNodeId }: Props) => {
  const store = useStore()
  return (
    <button
      data-expanded={expanded}
      type="button"
      className="focused:border-slate-50 group/button w-full rounded border border-transparent px-1.5 py-1 hover:bg-slate-100 data-[expanded=false]:data-[focused=true]:rounded-full data-[focused=true]:border-[var(--color)] data-[focused=true]:bg-[var(--color)]"
      onClick={() => disconnectNodes(store, { fromNodeId, toNodeId })}
    >
      <div className="flex items-center gap-2 group-data-[focused=true]/button:text-white">
        <TbTrash size={16} className="text-red-400" />
        {expanded && <div>削除</div>}
      </div>
    </button>
  )
}
