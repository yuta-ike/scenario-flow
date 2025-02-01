import { useFocusNode } from "../../../../state/focusedNodeId"
import type { SectionComponentInterface } from "./interface"

export const ValidatorSection: SectionComponentInterface = ({
  nodeId,
  actionInstance,
}) => {
  const focus = useFocusNode()

  if (actionInstance.type !== "validator") {
    return null
  }

  if (actionInstance.instanceParameter.contents.length === 0) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => focus(nodeId)}
      className="group flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-start shadow-object transition hover:bg-slate-100 active:translate-y-0.5"
    >
      <div className="flex w-full items-center gap-1 truncate font-mono text-xs">
        {actionInstance.instanceParameter.contents}
      </div>
    </button>
  )
}
