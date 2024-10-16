import { display, eq, type ActionSourceIdentifier } from "../action/identifier"
import { mergeActionParameter } from "../action/actionParameter"

import { CannotChangeActionTypeError } from "./node.error"
import {
  buildUnknownActionInstance,
  resolveBinderActionInstance,
  resolveRestCallActionInstance,
  resolveValidatorActionInstance,
  type ActionInstance,
  type ActionInstanceId,
  type RawResolvedActionInstance,
  type ResolvedActionInstance,
} from "./actionInstance"

import type { LocalVariable, LocalVariableId } from "../variable/variable"
import type { StripeSymbol, Transition } from "../type"
import type { ResolvedAction } from "../action/action"
import type { Expression } from "../value/expression"
import type { Id, OmitId } from "@/utils/idType"
import type { Replace } from "@/utils/typeUtil"

export type LoopConfig = {
  times: number
}

export type NodeConfig = {
  condition: Expression
  loop: LoopConfig
}

declare const _node: unique symbol
export type NodeId = Id & { [_node]: never }
export type PrimitiveNode = {
  [_node]: never
  id: NodeId
  name: string
  actionInstances: ActionInstance[]
  config: NodeConfig
}
export type RawPrimitiveNode = StripeSymbol<PrimitiveNode>

export const buildPrimitiveNode = (
  id: string,
  params: OmitId<RawPrimitiveNode>,
) => {
  return {
    id,
    ...params,
  } as PrimitiveNode
}

export type Node = Replace<
  PrimitiveNode,
  "actionInstances",
  ResolvedActionInstance[]
>
export type RawNode = Replace<
  RawPrimitiveNode,
  "actionInstances",
  RawResolvedActionInstance[]
>
export const buildNode = (id: string, params: OmitId<RawNode>) => {
  return {
    id,
    ...params,
  } as Node
}

export const resolvePrimitveNode = (
  primitiveNode: PrimitiveNode,
  actionMap: Map<string, ResolvedAction>,
  variableMap: Map<LocalVariableId, LocalVariable>,
): Node => {
  return buildNode(primitiveNode.id, {
    ...primitiveNode,
    actionInstances: primitiveNode.actionInstances.map((ai) => {
      if (ai.type === "rest_call") {
        const action = actionMap.get(display(ai.actionIdentifier))
        if (action == null) {
          throw new Error("action not found")
        }
        return resolveRestCallActionInstance(
          ai,
          action as ResolvedAction<"rest_call">,
        )
      } else if (ai.type === "validator") {
        return resolveValidatorActionInstance(ai)
      } else if (ai.type === "binder") {
        return resolveBinderActionInstance(ai, variableMap)
      } else {
        return buildUnknownActionInstance(ai.id, ai)
      }
    }),
  })
}

export const applyInitialValue = (node: Node) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.type === "rest_call" && ai.action.type === "rest_call") {
        const example = ai.action.schema.examples[0]
        return {
          ...ai,
          instanceParameter:
            example != null
              ? mergeActionParameter(
                  "rest_call",
                  example,
                  ai.action.schema.base,
                )
              : ai.instanceParameter,
        }
      } else {
        return ai
      }
    }),
  }
}

// NodeConfigを更新する
export const updateNodeConfig: Transition<PrimitiveNode> = (
  node: PrimitiveNode,
  config: NodeConfig,
) => {
  return {
    ...node,
    config,
  }
}

// action instance parameterを更新する
export const updateActionInstanceParameter: Transition<PrimitiveNode> = (
  node: PrimitiveNode,
  actionInstanceId: ActionInstanceId,
  actionInstance: ActionInstance,
) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.id === actionInstanceId) {
        if (ai.type !== actionInstance.type) {
          // Typeの変更は許可しない
          throw new CannotChangeActionTypeError()
        }
        return actionInstance
      } else {
        return ai
      }
    }),
  }
}

// actionを入れ替える
export const replaceAction: Transition<PrimitiveNode> = (
  node: PrimitiveNode,
  oldActionIdentifier: ActionSourceIdentifier,
  newActionIdentifier: ActionSourceIdentifier,
) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (
        ai.actionIdentifier != null &&
        eq(ai.actionIdentifier, oldActionIdentifier)
      ) {
        return {
          ...ai,
          actionIdentifier: newActionIdentifier,
        }
      } else {
        return ai
      }
    }),
  }
}
