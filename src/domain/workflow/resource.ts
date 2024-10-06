import { toResourceId } from "../entity/resource/resource.util"

import type { Resource, ResourceId } from "../entity/resource/resource"
import type { Id, OmitId } from "@/utils/idType"

type AddResourceContext = {
  genId: () => Id
  addResource: (resource: Resource) => void
}

export const addResource = (
  resource: OmitId<Resource>,
  context: AddResourceContext,
) => {
  const { genId, addResource } = context
  const id = toResourceId(genId())
  // TODO: validationなど
  addResource({ id, ...resource } as Resource)
}

type PutResourceContext = {
  putResource: (resourceId: ResourceId, resource: OmitId<Resource>) => void
}

export const putResource = (
  resourceId: ResourceId,
  resource: OmitId<Resource>,
  context: PutResourceContext,
) => {
  const { putResource } = context
  putResource(resourceId, resource)
}
