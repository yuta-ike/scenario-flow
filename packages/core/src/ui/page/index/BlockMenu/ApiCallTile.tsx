import { TbComponents } from "react-icons/tb"

import type { IconType } from "react-icons"
import { Tooltip } from "@scenario-flow/ui"
import { ActionSourceIdentifier } from "../../../../domain/entity"
import { useAction } from "../../../adapter/query"
import { MethodChip } from "../../../components/common/MethodChip"

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

  if (
    action.schema.base.method === "GET" &&
    action.schema.base.path === "/example"
  ) {
    return null
  }

  return (
    <div className="group flex w-full items-center gap-1 rounded-md border border-[#EEEEEE] px-3 py-2 text-start transition hover:border-slate-300">
      <div className="flex w-full grow flex-col gap-1">
        <div className="flex w-full items-center gap-2">
          <div className="shrink-0 text-xs">
            <MethodChip truncate={3}>{action.schema.base.method!}</MethodChip>
          </div>
          <span className="break-all text-sm">
            {action.schema.base.path ?? "Unknown"}
          </span>
          {action.resourceType === "resource" && (
            <Tooltip label={action.schema.jsonSchema?.operationId ?? ""}>
              <div className="shrink-0 rounded border border-blue-200 bg-blue-100 p-0.5 text-[11px]">
                <TbComponents />
              </div>
            </Tooltip>
          )}
        </div>
        <div className="line-clamp-2 text-xs">{action.description}</div>
      </div>
      <div>{Icon != null && <Icon className="text-slate-300" />}</div>
    </div>
  )
}
