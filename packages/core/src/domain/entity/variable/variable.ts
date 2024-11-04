import type { NodeId } from "../node/node"
import type { Builder, BuilderReturn } from "../type"
import type { JSONSchema7 } from "json-schema"
import type { Id } from "@/utils/idType"

declare const _localVariable: unique symbol

export type LocalVariableId = Id & { [_localVariable]: never }

export type LocalVariable = {
  [_localVariable]: never
  id: LocalVariableId
  namespace?: "vars" | "steps"
  name: string
  schema: "any" | JSONSchema7
  description: string
  boundIn: NodeId
}

export const buildLocalVariable: Builder<LocalVariable> = (id, params) => {
  return {
    id,
    ...params,
  } satisfies BuilderReturn<LocalVariable> as LocalVariable
}
