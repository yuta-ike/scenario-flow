import type { IconType } from "react-icons"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"

import { useAction } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"

type ApiCallTileProps = {
  actionIdentifier: ActionSourceIdentifier
  suffix?: IconType
}

export const ApiCallTile = ({
  actionIdentifier,
  suffix: Icon,
}: ApiCallTileProps) => {
  const action = useAction(actionIdentifier)
  if (action.type !== "rest_call") {
    throw new Error("Invalid action type")
  }
  return (
    <div className="group flex w-full items-center gap-1 rounded-md border border-[#EEEEEE] px-3 py-2 text-start transition hover:border-slate-300">
      <div className="flex grow flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="shrink-0 text-xs">
            <MethodChip truncate={3}>{action.schema.base.method!}</MethodChip>
          </div>
          <span className="text-sm">
            {action.schema.base.path ?? "Unknown"}
          </span>
        </div>
        <div className="line-clamp-2 text-xs">{action.description}</div>
      </div>
      <div>{Icon != null && <Icon className="text-slate-300" />}</div>
    </div>
  )
}
