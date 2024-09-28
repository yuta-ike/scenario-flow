import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { nodeAtom, primitiveNodeAtom } from "../datasource/node"
import { localVariableToVariable } from "../entity/environment/variable.factory"
import { toLocalVariableId } from "../entity/variable/variable.util"
import {
  dedupeShadowedBind,
  intersectionEnvironment,
  type Bind,
  type Environment,
} from "../entity/environment/environment"

import { getParentByNodeId } from "./getParentByNodeId"

import type { ResolvedEnvironment } from "../entity/environment/environment"
import type { NodeId } from "../entity/node/node"
import type { Variable } from "../entity/environment/variable"

// TODO: 再帰的に求めるよりは、ノードごとに計算していく方が効率が良い
const _getNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<Environment>((get) => {
    // 親ノードのEnvironmentの直積を取得
    const parentNodes = get(getParentByNodeId(nodeId))
    const parentEnvironments = parentNodes.map((nodeId) =>
      get(_getNodeEnvironment(nodeId)),
    )
    const deriveredEnvironments = intersectionEnvironment(parentEnvironments)

    // 現在のノードのEnvironmentを取得
    const node = get(nodeAtom(nodeId))
    const targetEnvironments = node.actionInstances.flatMap((ai) => {
      if (ai.type === "rest_call") {
        // ビルトイン変数の追加
        return {
          variable: {
            id: toLocalVariableId(ai.actionInstanceId),
            name: "step",
            description: "",
            schema: {
              type: "object",
              properties: {
                [node.name]: "any",
              },
            },
            boundIn: node.id,
          } as Variable,
        } satisfies Bind
      } else if (ai.type === "binder") {
        // ローカル宣言変数の追加
        const assignments = node.actionInstances
          .filter((ai) => ai.type === "binder")
          .flatMap((ai) => ai.instanceParameter.assignments)

        return assignments.map(({ variable }) => ({
          variable: localVariableToVariable(variable, node.id),
        }))
      } else {
        return []
      }
    })

    return dedupeShadowedBind([...deriveredEnvironments, ...targetEnvironments])
  })

  return newAtom
})

const getNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<Environment>((get) => {
    // 親ノードのEnvironmentの直積を取得
    const parentNodes = get(getParentByNodeId(nodeId))
    const parentEnvironments = parentNodes.map((nodeId) =>
      get(_getNodeEnvironment(nodeId)),
    )
    const deriveredEnvironments = intersectionEnvironment(parentEnvironments)

    // 現在のノードのEnvironmentを取得
    const node = get(nodeAtom(nodeId))
    const targetEnvironments = node.actionInstances.flatMap((ai) => {
      if (ai.type === "rest_call") {
        // ビルトイン変数の追加
        return [
          {
            variable: {
              id: toLocalVariableId(ai.actionInstanceId),
              name: "current",
              description: "",
              schema: "any",
              boundIn: node.id,
            } as Variable,
          } satisfies Bind,
        ]
      } else {
        return []
      }
    })

    return dedupeShadowedBind([...deriveredEnvironments, ...targetEnvironments])
  })

  return newAtom
})

export const getResolvedNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<ResolvedEnvironment>((get) =>
    get(getNodeEnvironment(nodeId)).map(({ variable }) => ({
      variable: {
        ...variable,
        boundIn:
          variable.boundIn === "global"
            ? "global"
            : get(primitiveNodeAtom(variable.boundIn)),
      },
    })),
  )
  newAtom.debugLabel = `getResolvedNodeEnvironment(${nodeId})`
  return newAtom
})
