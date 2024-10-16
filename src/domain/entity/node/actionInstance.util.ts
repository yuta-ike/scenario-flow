import type { ActionInstanceId } from "./actionInstance"

export const toActionInstanceId = (id: string): ActionInstanceId =>
  id as ActionInstanceId
