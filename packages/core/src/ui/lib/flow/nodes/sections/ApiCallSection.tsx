import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"

import { MethodChip } from "@/ui/components/common/MethodChip"
import { useSetFocusedActionInstanceId } from "@/ui/state/focusedNodeId"

type ApiCallSectionProps = {
  nodeId: NodeId
  actionInstance: ResolvedRestCallActionInstance
}

export const ApiCallSection = ({
  nodeId,
  actionInstance,
}: ApiCallSectionProps) => {
  const focus = useSetFocusedActionInstanceId(nodeId)

  return (
    <button
      type="button"
      onClick={focus}
      data-hotkey="delete"
      className="flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-3 text-start shadow-object transition hover:bg-slate-50"
    >
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <MethodChip truncate={3}>
          {actionInstance.instanceParameter.method!}
        </MethodChip>
        <div className="text-xs text-slate-400">
          {actionInstance.action.schema.jsonSchema?.operationId}
        </div>
      </div>
      {/* Body */}
      <div className="text-sm leading-none">
        {actionInstance.instanceParameter.path!}
      </div>
      <div className="line-clamp-2 text-xs leading-none">
        {actionInstance.description}
      </div>
    </button>
  )
}
