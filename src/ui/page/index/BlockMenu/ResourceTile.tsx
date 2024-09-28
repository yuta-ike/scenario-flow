import type { ResourceId } from "@/domain/entity/resource/resource"

import { useResource } from "@/ui/adapter/query"

export const ResourceTile = ({ resourceId }: { resourceId: ResourceId }) => {
  const resource = useResource(resourceId)
  return (
    <div className="rounded border border-slate-200 px-1.5 py-1 text-sm leading-none text-slate-500">
      {resource.name}
    </div>
  )
}
