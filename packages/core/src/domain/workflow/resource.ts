import { toResourceId } from "../entity/resource/resource.util"

import type { StripeSymbol } from "../entity/type"
import type { Resource, ResourceId } from "../entity/resource/resource"
import { Id, OmitId } from "@scenario-flow/util"

type AddResourceContext = {
  genId: () => Id
  addResource: (resource: Resource) => void
}

export const addResource = (
  resource: OmitId<StripeSymbol<Resource>>,
  context: AddResourceContext,
) => {
  const { genId, addResource } = context
  const id = toResourceId(genId())
  addResource({ id, ...resource } as Resource)
}

type PutResourceContext = {
  putResource: (
    resourceId: ResourceId,
    resource: OmitId<StripeSymbol<Resource>>,
  ) => void
}

export const putResource = (
  resourceId: ResourceId,
  resource: OmitId<StripeSymbol<Resource>>,
  context: PutResourceContext,
) => {
  const { putResource } = context
  putResource(resourceId, resource)
}
