import { TbExternalLink } from "react-icons/tb"

import type { SectionComponentInterface } from "./interface"

import { unwrapNull } from "@scenario-flow/util"
import { useFocusNode } from "../../../../state/focusedNodeId"

export const IncludeSection: SectionComponentInterface = ({
  nodeId,
  actionInstance,
  onChangePage,
}) => {
  const focus = useFocusNode()

  if (actionInstance.type !== "include") {
    return null
  }

  const refRoute = unwrapNull(actionInstance.instanceParameter.ref)

  return (
    <button
      type="button"
      onClick={() => focus(nodeId)}
      data-hotkey="delete"
      className="flex w-full flex-col gap-1 rounded-lg bg-white px-4 py-3 text-start shadow-object transition hover:bg-slate-50"
    >
      {/* Header */}
      <div>
        <div className="text-xs font-bold text-blue-500">Ref:</div>
      </div>
      {/* Body */}
      {refRoute != null ? (
        <button
          type="button"
          onClick={() => onChangePage(refRoute.page)}
          className="flex -translate-x-1 items-center gap-1 rounded px-1 py-1 text-start text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:underline"
        >
          <div className="shrink-0">
            <TbExternalLink />
          </div>
          <div>
            {refRoute.page}/{refRoute.name}
          </div>
        </button>
      ) : (
        <div className="rounded bg-red-100 p-1 py-0.5 text-xs text-red-400">
          参照先が設定されていません
        </div>
      )}
    </button>
  )
}
