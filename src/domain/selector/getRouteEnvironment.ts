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
import { globalVariablesAtom } from "../datasource/globalVariable"

import { getParentByNodeId } from "./getParentByNodeId"

import type { ResolvedEnvironment } from "../entity/environment/environment"
import type { NodeId } from "../entity/node/node"
import type { Variable } from "../entity/environment/variable"

const getNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<Environment>((get) => {
    // 親ノードのEnvironmentの直積を取得
    const parentNodes = get(getParentByNodeId(nodeId))
    const parentEnvironments = parentNodes.map((nodeId) =>
      get(getNodeEnvironment(nodeId)),
    )
    const inheritedEnvironment = intersectionEnvironment(parentEnvironments)

    // 現在のノードのEnvironmentを取得
    const node = get(nodeAtom(nodeId))
    const targetEnvironments = node.actionInstances.flatMap<Bind>((ai) => {
      if (ai.type === "rest_call") {
        // ビルトイン変数の追加
        return [
          {
            namespace: "steps",
            variable: {
              id: toLocalVariableId(ai.actionInstanceId + "-steps"),
              name: node.name,
              description: "",
              schema: "any",
              boundIn: node.id,
            },
            inherit: true,
          },
          {
            variable: {
              id: toLocalVariableId(ai.actionInstanceId + "-request"),
              name: "request",
              description: "",
              schema: "any", // TODO: スキーマ反映する
              boundIn: node.id,
            } as Variable,
            inherit: false,
          },
          {
            variable: {
              id: toLocalVariableId(ai.actionInstanceId + "-current"),
              name: "current",
              description: "",
              schema: "any", // TODO: スキーマ反映する
              boundIn: node.id,
            } as Variable,
            inherit: false,
          },
        ]
      } else if (ai.type === "binder") {
        // ローカル宣言変数の追加
        const assignments = node.actionInstances
          .filter((ai) => ai.type === "binder")
          .flatMap((ai) => ai.instanceParameter.assignments)

        return assignments.map(({ variable }) => ({
          namespace: "vars",
          variable: localVariableToVariable(variable, node.id),
          inherit: true,
        }))
      } else {
        return []
      }
    })

    return dedupeShadowedBind([...inheritedEnvironment, ...targetEnvironments])
  })

  return newAtom
})

export const getResolvedNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<ResolvedEnvironment>((get) => {
    const globalVariables: Environment = get(globalVariablesAtom).map(
      (variable) => ({
        namespace: "vars",
        variable: {
          ...variable,
          boundIn: "global",
        },
        inherit: false,
      }),
    )

    const variables = [
      ...globalVariables,
      ...get(getNodeEnvironment(nodeId)),
    ].map(({ variable, namespace, inherit }) => ({
      namespace,
      variable: {
        ...variable,
        boundIn:
          variable.boundIn === "global"
            ? ("global" as const)
            : get(primitiveNodeAtom(variable.boundIn)),
      },
      inherit,
    }))
    return variables
  })
  newAtom.debugLabel = `getResolvedNodeEnvironment(${nodeId})`
  return newAtom
})

export const getResolvedParentNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<ResolvedEnvironment>((get) => {
    const globalVariables: Environment = get(globalVariablesAtom).map(
      (variable) => ({
        namespace: "vars",
        variable: {
          ...variable,
          boundIn: "global",
        },
        inherit: false,
      }),
    )

    const nodeIds = get(getParentByNodeId(nodeId))
    const environments = nodeIds.map((nodeId) =>
      get(getNodeEnvironment(nodeId)).filter((bind) => bind.inherit),
    )
    return [...globalVariables, ...intersectionEnvironment(environments)].map(
      ({ variable, namespace, inherit }) => ({
        namespace,
        inherit,
        variable: {
          ...variable,
          boundIn:
            variable.boundIn === "global"
              ? "global"
              : get(primitiveNodeAtom(variable.boundIn)),
        },
      }),
    )
  })
  newAtom.debugLabel = `getResolvedNodeEnvironment(${nodeId})`
  return newAtom
})
