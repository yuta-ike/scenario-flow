import type { SectionComponentInterface } from "./interface"

import { useFocusNode } from "@/ui/state/focusedNodeId"

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
      className="flex w-full flex-col gap-2 rounded-lg bg-white px-3 py-2 text-start shadow-object transition hover:bg-slate-50"
    >
      <div className="line-clamp-3 flex w-full items-center gap-1 font-mono text-[11px]">
        {actionInstance.instanceParameter.query}
      </div>
    </button>
  )
}
