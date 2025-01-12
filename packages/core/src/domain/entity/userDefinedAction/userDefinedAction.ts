import { parseExpressionInPath } from "../value/expression"

import type {
  BinderActionParameterSchema,
  RestCallActionParameterSchema,
  UnknownActionParameterSchema,
  ValidatorActionParameterSchema,
} from "../action/action"
import type { BuilderParams, BuilderReturn } from "../type"
import type { Id } from "@/utils/idType"
import type { DistributivePartial } from "@/utils/typeUtil"

import { genId } from "@/utils/uuid"
import { dedupe } from "@/ui/lib/kv"

declare const _userDefinedAction: unique symbol
export type UserDefinedActionId = Id & { [_userDefinedAction]: never }

export type UserDefinedAction = {
  [_userDefinedAction]: never
  id: UserDefinedActionId
  name: string
  description: string
} & (
  | {
      type: "rest_call"
      schema: RestCallActionParameterSchema
    }
  | {
      type: "validator"
      schema: ValidatorActionParameterSchema
    }
  | {
      type: "binder"
      schema: BinderActionParameterSchema
    }
  | {
      type: "unknown"
      schema: UnknownActionParameterSchema
    }
)

const modifyUserDefinedAction = (
  params: BuilderParams<DistributivePartial<UserDefinedAction, "name">>,
): BuilderParams<UserDefinedAction> => {
  if (params.type === "rest_call") {
    const path = params.schema.base.path
    if (path == null) {
      return {
        name: "",
        ...params,
      }
    }
    const [modifiedPath, pathParams] = parseExpressionInPath(path)
    return {
      name: `${params.schema.base.method} ${modifiedPath}`,
      ...params,
      schema: {
        ...params.schema,
        base: {
          ...params.schema.base,
          path: modifiedPath,
          pathParams: dedupe([
            ...pathParams.map(({ name, value }) => ({
              id: genId(),
              key: name,
              value: `{{ ${value} }}`,
            })),
            ...(params.schema.base.pathParams ?? []),
          ]),
        },
      },
    }
  } else {
    return {
      name: "",
      ...params,
    }
  }
}

export const buildUserDefinedAction = (
  id: string,
  params: BuilderParams<DistributivePartial<UserDefinedAction, "name">>,
): UserDefinedAction => {
  return {
    id,
    ...modifyUserDefinedAction(params),
  } satisfies BuilderReturn<UserDefinedAction> as UserDefinedAction
}

export const buildEmptyUserDefinedAction = (id: string) =>
  buildUserDefinedAction(id, {
    name: "get_example",
    description: "",
    type: "rest_call",
    schema: {
      base: {
        method: "GET",
        path: "/example",
      },
      examples: [],
    },
  })

export const getMethodPath = (action: UserDefinedAction) => {
  if (action.type === "rest_call") {
    const method = action.schema.base.method
    const path = action.schema.base.path
    if (method == null || path == null) {
      return null
    }
    return `${method} ${path}`
  }
  return null
}
