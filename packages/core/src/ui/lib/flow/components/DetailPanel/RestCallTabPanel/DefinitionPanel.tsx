import React from "react"
import { TbComponents } from "react-icons/tb"

import type { ResolvedAction } from "@/domain/entity/action/action"
import type { ResourceActionIdentifier } from "@/domain/entity/action/identifier"

import { useResource } from "@/ui/adapter/query"
import { Drawer } from "@/ui/components/common/Drawer"
import { ResourceDetail } from "@/ui/page/index/Settings/ResourceDetail"

type Props = {
  action: ResolvedAction & ResourceActionIdentifier
}

export const DefinitionPanel = ({ action }: Props) => {
  const resource = useResource(action.resourceIdentifier.resourceId)
  if (action.type !== "rest_call") {
    return null
  }

  return (
    <div className="w-full rounded border border-blue-200 bg-blue-100 p-2">
      <div className="flex items-center gap-1 text-xs">
        <TbComponents />
        定義
      </div>
      <div className="text-sm">
        {action.resourceIdentifier.identifier.operationId} in{" "}
        <Drawer
          key={resource.id}
          title={resource.name}
          description=""
          modal={<ResourceDetail resourceId={resource.id} />}
        >
          <button type="button" className="text-sm underline">
            {resource.name}
          </button>
        </Drawer>
      </div>
    </div>
  )
}
