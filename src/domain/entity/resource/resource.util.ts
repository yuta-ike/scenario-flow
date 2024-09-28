import type { ResourceActionId, ResourceId } from "./resource"

export const toResourceId = (id: string) => id as ResourceId

export const toResourceActionId = (id: string) => id as ResourceActionId
