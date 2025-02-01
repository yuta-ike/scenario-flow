import { ResourceId } from "../../../../domain/entity"
import { useResource } from "../../../adapter/query"

export const ResourceTile = ({ resourceId }: { resourceId: ResourceId }) => {
  const resource = useResource(resourceId)
  return (
    <h3 className="sticky top-0 w-full grow bg-white px-2 py-1 text-xs text-slate-600">
      {resource.name}
    </h3>
  )
}
