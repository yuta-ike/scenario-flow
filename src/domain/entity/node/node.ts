import { SwitchActionInstanceTypeError } from "./node.error"

import type { ActionId, ResolvedAction } from "../action/action"
import type { Expression } from "../value/expression"
import type {
  ActionInstance,
  ActionInstanceId,
  ResolvedActionInstance,
  RestCallActionInstanceParameter,
} from "./actionInstance"
import type { Id, OmitId } from "@/utils/idType"
import type { Replace } from "@/utils/typeUtil"
import type { Receiver } from "@/lib/receiver"

export type LoopConfig = {
  times: number
}

export type NodeConfig = {
  condition: Expression
  loop: LoopConfig
}

export type NodeId = Id & { __nodeId: never }
export type PrimitiveNode = {
  id: NodeId
  name: string
  actionInstances: ActionInstance[]
  config: NodeConfig
}

export type Node = Replace<
  PrimitiveNode,
  "actionInstances",
  ResolvedActionInstance[]
>

// レシーバーの要件を満たすか微妙
export const createNode = (node: OmitId<PrimitiveNode, "name">) => {
  return node
}
export const buildNode = (
  id: NodeId,
  name: string,
  nodeParam: OmitId<PrimitiveNode, "name">,
  actionMap: Map<ActionId, ResolvedAction>,
): PrimitiveNode => {
  return {
    id,
    name,
    ...nodeParam,
    actionInstances: nodeParam.actionInstances.map((ai) => {
      if (ai.type === "rest_call") {
        const action = actionMap.get(ai.actionRef.actionId)

        return {
          ...ai,
          instanceParameter: {
            ...action?.parameter?.example,
            description:
              actionMap.get(ai.actionRef.actionId)?.description ?? "",
          } satisfies RestCallActionInstanceParameter,
        }
      } else {
        return ai
      }
    }),
  }
}

// NodeConfigを更新する
export const updateNodeConfig = ((node: PrimitiveNode, config: NodeConfig) => {
  return {
    ...node,
    config,
  }
}) satisfies Receiver<PrimitiveNode>

// action instance parameterを更新する
export const updateActionInstanceParameter = ((
  node: PrimitiveNode,
  actionInstanceId: ActionInstanceId,
  actionInstance: ActionInstance,
) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.actionInstanceId === actionInstanceId) {
        if (ai.type !== actionInstance.type) {
          // Typeの変更は許可しない
          throw new SwitchActionInstanceTypeError()
        }
        return actionInstance
      } else {
        return ai
      }
    }),
  }
}) satisfies Receiver<PrimitiveNode>

// actionを入れ替える
export const replaceAction = ((
  node: PrimitiveNode,
  oldActionId: ActionId,
  newActionId: ActionId,
) => {
  return {
    ...node,
    actionInstances: node.actionInstances.map((ai) => {
      if (ai.actionRef != null && ai.actionRef.actionId == oldActionId) {
        return {
          ...ai,
          actionRef: {
            ...ai.actionRef,
            actionId: newActionId,
          },
        }
      } else {
        return ai
      }
    }),
  }
}) satisfies Receiver<PrimitiveNode>
