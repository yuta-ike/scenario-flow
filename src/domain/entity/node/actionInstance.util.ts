import type { ActionInstanceId, BinderId, ValidatorId } from "./actionInstance"

export const toActionInstanceId = (id: string): ActionInstanceId =>
  id as ActionInstanceId

export const toBinderId = (id: string) => id as BinderId

export const toValidatorId = (id: string) => id as ValidatorId
