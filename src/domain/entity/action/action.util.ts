import type { ResourceActionId, ResourceId } from "../resource/resource"
import type { ActionId } from "./action"

export const toActionId = (id: string) => id as ActionId

export const resourceActionToActionId = (
  resurceActionId: ResourceActionId,
  resourceId: ResourceId,
) => toActionId(`${resurceActionId}-${resourceId}`)
