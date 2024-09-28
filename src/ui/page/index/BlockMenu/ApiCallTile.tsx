import type { IconType } from "react-icons"
import type { ActionId } from "@/domain/entity/action/action"

import { useAction } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"

type ApiCallTileProps = {
  actionId: ActionId
  suffix?: IconType
}

export const ApiCallTile = ({ actionId, suffix: Icon }: ApiCallTileProps) => {
  const action = useAction(actionId)
  return (
    <div className="group flex w-full items-center gap-1 rounded-md border border-[#EEEEEE] px-3 py-2 text-start transition hover:border-slate-300">
      <div className="flex grow flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="shrink-0 text-xs">
            <MethodChip truncate={3}>{action.parameter.method}</MethodChip>
          </div>
          <span className="text-sm">{action.parameter.path}</span>
        </div>
        <div className="line-clamp-2 text-xs">{action.description}</div>
      </div>
      <div>{Icon != null && <Icon className="text-slate-300" />}</div>
    </div>
  )
}
