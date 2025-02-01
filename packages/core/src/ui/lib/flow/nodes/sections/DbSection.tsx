import clsx from "clsx"

import type { SectionComponentInterface } from "./interface"

import { fill } from "@scenario-flow/util"
import { useFocusNode } from "../../../../state/focusedNodeId"

export const DbSection: SectionComponentInterface = ({
  nodeId,
  actionInstance,
}) => {
  const focus = useFocusNode()

  if (actionInstance.type !== "db") {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => focus(nodeId)}
      data-hotkey="delete"
      className="flex w-full flex-col gap-1 rounded-lg bg-white px-3 py-2 text-start shadow-object transition hover:bg-slate-50"
    >
      <div className="text-xs font-bold text-blue-500">DB</div>
      <div
        className={clsx(
          "line-clamp-3 flex min-h-[1lh] w-full items-center gap-1 font-mono text-[11px]",
          actionInstance.instanceParameter.query.length === 0
            ? "text-gray-400"
            : "text-slate-600",
        )}
      >
        {fill(
          actionInstance.instanceParameter.query,
          "クエリを入力してください",
        )}
      </div>
    </button>
  )
}
