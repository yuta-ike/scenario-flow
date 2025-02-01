import { displayIdentifier } from "../resource/identifier"

import type { ActionSourceIdentifier } from "./identifier"
import type { UserDefinedActionId } from "../userDefinedAction/userDefinedAction"
import type { ResourceActionId, ResourceId } from "../resource/resource"
import type { ActionId } from "./action"

export const toActionId = (id: string) => id as ActionId

/**
 * @deprecated
 */
export const resourceActionToActionId = (
  resurceActionId: ResourceActionId,
  resourceId: ResourceId,
) => toActionId(`${resurceActionId}-${resourceId}`)

export const identifierToActionId = (identifier: ActionSourceIdentifier) => {
  if (identifier.resourceType === "resource") {
    return toActionId(
      `${identifier.resourceIdentifier.resourceId}-${displayIdentifier(identifier.resourceIdentifier.identifier)}`,
    )
  } else {
    return toActionId(identifier.resourceIdentifier.userDefinedActionId)
  }
}

export const userDefinedActionToActionId = (
  userDefinedActionId: UserDefinedActionId,
) => toActionId(userDefinedActionId)
