import type { ResourceId } from "../resource/resource"
import type { Equal, Receiver, StripeSymbol } from "../type"
import type { UserDefinedActionId } from "../userDefinedAction/userDefinedAction"
import type { ResourceActionLocalIdentifier } from "../resource/identifier"

import { throwUnreachable } from "@/utils/unreachable"

// Action Identifier
export type ResourceActionIdentifier = {
  resourceId: ResourceId
  identifier: ResourceActionLocalIdentifier
}

export type UserDefinedActionIdentifier = {
  userDefinedActionId: UserDefinedActionId
}

declare const _actionSourceIdentifier: unique symbol
export type ActionSourceIdentifier =
  | {
      [_actionSourceIdentifier]: never
      resourceType: "resource"
      resourceIdentifier: ResourceActionIdentifier
    }
  | {
      [_actionSourceIdentifier]: never
      resourceType: "user_defined"
      resourceIdentifier: UserDefinedActionIdentifier
    }

export const buildActionSourceIdentifier = (
  params: StripeSymbol<ActionSourceIdentifier>,
) => {
  return params as ActionSourceIdentifier
}

export const eq: Equal<ActionSourceIdentifier> = (a, b) => {
  if (a.resourceType !== b.resourceType) {
    return false
  }
  if (a.resourceType === "resource" && b.resourceType === "resource") {
    return (
      a.resourceIdentifier.resourceId === b.resourceIdentifier.resourceId &&
      a.resourceIdentifier.identifier.operationId ===
        b.resourceIdentifier.identifier.operationId &&
      a.resourceIdentifier.identifier.methodAndPath ===
        b.resourceIdentifier.identifier.methodAndPath
    )
  } else if (
    a.resourceType === "user_defined" &&
    b.resourceType === "user_defined"
  ) {
    return (
      a.resourceIdentifier.userDefinedActionId ===
      b.resourceIdentifier.userDefinedActionId
    )
  } else {
    return throwUnreachable()
  }
}

export const display: Receiver<ActionSourceIdentifier, string> = (
  identifier,
) => {
  if (identifier.resourceType === "resource") {
    return `${identifier.resourceIdentifier.resourceId}-${identifier.resourceIdentifier.identifier.operationId}`
  } else {
    return identifier.resourceIdentifier.userDefinedActionId
  }
}
