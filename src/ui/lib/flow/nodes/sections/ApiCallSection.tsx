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
      className="flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-3 text-start shadow-object transition hover:bg-slate-50"
    >
      {/* Header */}
      {actionInstance.action.type === "unknown" ? (
        <div className="text-sm">呼び出し情報が見つかりません</div>
      ) : (
        <div className="flex w-full items-center justify-between">
          <MethodChip truncate={3}>
            {actionInstance.action.parameter!.method}
          </MethodChip>
          <div className="text-xs text-slate-400">
            {actionInstance.action.parameter!.operationObject?.operationId}
          </div>
        </div>
      )}
      {/* Body */}
      <div className="text-sm leading-none">
        {actionInstance.action.parameter?.path}
      </div>
      <div className="line-clamp-2 text-xs leading-none">
        {actionInstance.instanceParameter.description}
      </div>
    </button>
  )
}
