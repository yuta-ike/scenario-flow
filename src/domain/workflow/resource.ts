import { toResourceId } from "../entity/resource/resource.util"

import type {
  RawResource,
  Resource,
  ResourceId,
} from "../entity/resource/resource"
import type { Id, OmitId } from "@/utils/idType"

type AddResourceContext = {
  genId: () => Id
  addResource: (resource: Resource) => void
}

export const addResource = (
  resource: OmitId<RawResource>,
  context: AddResourceContext,
) => {
  const { genId, addResource } = context
  const id = toResourceId(genId())
  // TODO: validationなど
  addResource({ id, ...resource } as Resource)
}

type PutResourceContext = {
  putResource: (resourceId: ResourceId, resource: OmitId<RawResource>) => void
}

export const putResource = (
  resourceId: ResourceId,
  resource: OmitId<RawResource>,
  context: PutResourceContext,
) => {
  const { putResource } = context
  putResource(resourceId, resource)
}
