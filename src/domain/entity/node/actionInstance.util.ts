import type { ActionInstanceId, ValidatorId } from "./actionInstance"

export const toActionInstanceId = (id: string): ActionInstanceId =>
  id as ActionInstanceId

export const toValidatorId = (id: string) => id as ValidatorId
