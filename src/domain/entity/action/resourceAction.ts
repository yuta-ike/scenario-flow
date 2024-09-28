import type {
  ResourceActionId,
  ResourceId,
  ResourceType,
} from "../resource/resource"
import type { ResourceIdentifier } from "../resource/identifier"

export type ResourceActionInner<Type extends ResourceType> = {
  resourceId: ResourceId
  identifier: ResourceIdentifier<Type>
  resourceActionId: ResourceActionId
}
