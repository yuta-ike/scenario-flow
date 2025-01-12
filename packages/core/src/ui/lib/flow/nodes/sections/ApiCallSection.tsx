import { TbComponents } from "react-icons/tb"

import type { SectionComponentInterface } from "./interface"

import { MethodChip } from "@/ui/components/common/MethodChip"
import { useFocusNode } from "@/ui/state/focusedNodeId"
import { getFilledPath } from "@/domain/entity/action/actionParameter"

export const ApiCallSection: SectionComponentInterface = ({
  nodeId,
  actionInstance,
}) => {
  const focus = useFocusNode()

  if (actionInstance.type !== "rest_call") {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => focus(nodeId)}
      data-hotkey="delete"
      className="flex w-full flex-col gap-2 rounded-lg bg-white px-4 py-3 text-start shadow-object transition hover:bg-slate-50"
    >
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <MethodChip truncate={3}>
          {actionInstance.instanceParameter.method!}
        </MethodChip>
        {actionInstance.action.resourceType === "resource" && (
          <div className="flex translate-x-2 items-center gap-0.5 rounded border border-blue-200 bg-blue-100 px-2 py-1 text-xs leading-none">
            <TbComponents />
            {actionInstance.action.schema.jsonSchema?.operationId}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="break-all text-sm leading-none">
        {getFilledPath(actionInstance.instanceParameter)}
      </div>
      <div className="line-clamp-2 text-xs leading-none">
        {actionInstance.description}
      </div>
    </button>
  )
}
