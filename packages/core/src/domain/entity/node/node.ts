import { display, eq, type ActionSourceIdentifier } from "../action/identifier"
import { mergeActionParameter } from "../action/actionParameter"

import { CannotChangeActionTypeError } from "./node.error"
import {
  buildInitialActionInstance,
  type ActionInstance,
  type ActionInstanceId,
  type ResolvedActionInstance,
} from "./actionInstance"

import type { Time } from "../value/time"
import type { Receiver, StripeSymbol, Transition } from "../type"
import type { ActionType, ResolvedAction } from "../action/action"
import type { Expression } from "../value/expression"
import type { Id, OmitId } from "@/utils/idType"
import type { Replace } from "@/utils/typeUtil"

export type LoopConfig = {
  interval?: Time
  maxRetries?: number
  maxElapsedTime?: Time
}

export type NodeConfig = {
  condition?: Expression
  loop?: LoopConfig
}

declare const _node: unique symbol
export type NodeId = Id & { [_node]: never }
export type PrimitiveNode = {
  [_node]: never
  id: NodeId
  name: string
  description: string
  actionInstances: ActionInstance[]
  config: NodeConfig
}

export const buildPrimitiveNode = (
  id: string,
  params: OmitId<StripeSymbol<PrimitiveNode>>,
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
  StripeSymbol<PrimitiveNode>,
  "actionInstances",
  StripeSymbol<ResolvedActionInstance>[]
>
export const buildNode = (id: string, params: OmitId<RawNode>) => {
  return {
    id,
    ...params,
  } as Node
}

export const applyInitialValue: Transition<PrimitiveNode> = (
  node: PrimitiveNode,
  actionMap: Map<string, ResolvedAction>,
) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.type === "rest_call") {
        const action = actionMap.get(display(ai.actionIdentifier))
        if (action == null || action.type !== "rest_call") {
          return ai
        }

        const example = action.schema.examples[0]
        return {
          ...ai,
          instanceParameter:
            example != null
              ? mergeActionParameter("rest_call", action.schema.base, example)
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

// NodeConfigが初期状態か判定する
export const isNodeConfigConditionSet: Receiver<
  PrimitiveNode | Node,
  boolean
> = (node) => {
  return node.config.condition != null && node.config.condition !== ""
}

export const isNodeConfigLoopSet: Receiver<PrimitiveNode | Node, boolean> = (
  node,
) => {
  return (
    (node.config.loop?.interval != null &&
      0 < node.config.loop.interval.value) ||
    (node.config.loop?.maxRetries != null && 0 < node.config.loop.maxRetries) ||
    (node.config.loop?.maxElapsedTime != null &&
      0 < node.config.loop.maxElapsedTime.value)
  )
}

// action instanceを追加する
export const appendActionInstance: Transition<
  PrimitiveNode,
  [type: Exclude<ActionType, "unknown">, id: string]
> = (node, type, id) => {
  return {
    ...node,
    actionInstances: [
      ...node.actionInstances,
      buildInitialActionInstance(type, id),
    ],
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
