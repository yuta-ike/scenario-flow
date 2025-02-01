import { display, eq, type ActionSourceIdentifier } from "../action/identifier"
import { mergeActionParameter } from "../action/actionParameter"

import {
  CannnotChangeActionSourceError,
  CannotChangeActionTypeError,
} from "./node.error"
import {
  buildInitialActionInstance,
  type ActionInstance,
  type ActionInstanceId,
  type ResolvedActionInstance,
} from "./actionInstance"

import type { Time } from "../value/time"
import type { BuilderParams, Receiver, StripeSymbol, Transition } from "../type"
import type { ActionType, ResolvedAction } from "../action/action"
import type { Expression } from "../value/expression"
import {
  Id,
  DistributiveOmit,
  Replace,
  OmitId,
  applyUpdate,
  Updater,
} from "@scenario-flow/util"

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
  {
    name,
    ...params
  }: BuilderParams<DistributiveOmit<PrimitiveNode, "name">> & { name?: string },
  // userNames: string[],
) => {
  // const uniqName = getUniqName(name ?? "シナリオ", userNames)
  return {
    id,
    name,
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

const applyActionInstanceInitialValue = (
  ai: ActionInstance,
  actionMap: Map<string, ResolvedAction>,
) => {
  if (ai.type === "rest_call") {
    const action = actionMap.get(display(ai.actionIdentifier))
    if (action == null || action.type !== "rest_call") {
      return ai
    }

    const example = action.schema.examples[0]
    const res = {
      ...ai,
      instanceParameter:
        example != null
          ? mergeActionParameter("rest_call", action.schema.base, example)
          : ai.instanceParameter,
    }
    return res
  } else {
    return ai
  }
}

export const applyInitialValue: Transition<
  PrimitiveNode,
  [Map<string, ResolvedAction>]
> = (node, actionMap) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) =>
      applyActionInstanceInitialValue(ai, actionMap),
    ),
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
  [],
  boolean
> = (node) => {
  return node.config.condition != null && node.config.condition !== ""
}

export const isNodeConfigLoopSet: Receiver<
  PrimitiveNode | Node,
  [],
  boolean
> = (node) => {
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
export const updateActionInstanceParameter: Transition<
  PrimitiveNode,
  [ActionInstanceId, Updater<ActionInstance>]
> = (node, actionInstanceId, actionInstance) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.id === actionInstanceId) {
        const newAi = applyUpdate(actionInstance, ai)
        if (ai.type !== newAi.type) {
          // Typeの変更は許可しない
          throw new CannotChangeActionTypeError()
        }
        if (
          ai.actionIdentifier != null &&
          newAi.actionIdentifier != null &&
          !eq(ai.actionIdentifier, newAi.actionIdentifier)
        ) {
          // Actionの変更は許可しない
          throw new CannnotChangeActionSourceError()
        }

        return newAi
      } else {
        return ai
      }
    }),
  }
}

// actionを入れ替える
export const replaceAction: Transition<
  PrimitiveNode,
  [ActionSourceIdentifier, ActionSourceIdentifier]
> = (node, oldActionIdentifier, newActionIdentifier) => {
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

// actionを入れ替える
export const replaceActionById: Transition<
  PrimitiveNode,
  [ActionInstanceId, ActionSourceIdentifier]
> = (node, actionId, actionIdentifier) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.actionIdentifier != null && ai.id === actionId) {
        return {
          ...ai,
          actionIdentifier,
        }
      } else {
        return ai
      }
    }),
  }
}

export const changeAction: Transition<
  PrimitiveNode,
  [ActionInstanceId, ActionSourceIdentifier, Map<string, ResolvedAction>]
> = (node, actionInstanceId, actionIdentifier, actionMap) => {
  const newNode: PrimitiveNode = {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.id === actionInstanceId && ai.type === "rest_call") {
        const newAi = {
          ...ai,
          actionIdentifier,
        }
        const filledAi = applyActionInstanceInitialValue(newAi, actionMap)
        return filledAi
      } else {
        return ai
      }
    }),
  }
  applyInitialValue(newNode, new Map())
  return newNode
}
