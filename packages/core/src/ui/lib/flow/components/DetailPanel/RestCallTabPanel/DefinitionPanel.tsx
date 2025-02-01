import { TbComponents } from "react-icons/tb"

import { Drawer } from "@scenario-flow/ui"
import {
  ResolvedAction,
  ResourceActionIdentifier,
} from "../../../../../../domain/entity"
import { useResource } from "../../../../../adapter/query"
import { ResourceDetail } from "../../../../../page/index/Settings/ResourceDetail"

type Props = {
  action: ResolvedAction & ResourceActionIdentifier
}

export const DefinitionPanel = ({ action }: Props) => {
  const resource = useResource(action.resourceIdentifier.resourceId)
  if (action.type !== "rest_call") {
    return null
  }

  return (
    <div className="flex w-full items-center rounded border border-blue-200 bg-blue-100 p-2">
      <div className="grow">
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
    </div>
  )
}
