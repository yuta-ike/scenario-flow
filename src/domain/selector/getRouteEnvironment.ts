import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { nodeAtom, primitiveNodeAtom } from "../datasource/node"
import {
  dedupeEnvironmentBinds,
  intersect,
  type Bind,
  type Environment,
} from "../entity/environment/environment"
import { globalVariablesAtom } from "../datasource/globalVariable"
import { buildLocalVariable } from "../entity/variable/variable"
import { nonRef } from "../openapi/isNotRef"
import { getResponseSchema } from "../openapi/response"

import { getParentByNodeId } from "./getParentByNodeId"

import type { ResolvedEnvironment } from "../entity/environment/environment"
import type { NodeId } from "../entity/node/node"

import { nonNull } from "@/utils/assert"

const getNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<Environment>((get) => {
    // 親ノードのEnvironmentの直積を取得
    const parentNodes = get(getParentByNodeId(nodeId))
    const parentEnvironments = parentNodes.map((nodeId) =>
      get(getNodeEnvironment(nodeId)),
    )
    const inheritedEnvironment = intersect(parentEnvironments)

    // 現在のノードのEnvironmentを取得
    const node = get(nodeAtom(nodeId))
    const targetEnvironments = node.actionInstances.flatMap<Bind>(
      (ai, index) => {
        if (ai.type === "rest_call") {
          const requestBody = ai.instanceParameter.body
          // ビルトイン変数の追加
          return [
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps`, {
                namespace: "steps",
                name: node.name,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            requestBody?.selected == null
              ? null
              : {
                  variable: buildLocalVariable(`${nodeId}-${index}-request`, {
                    name: "request",
                    description: "",
                    schema:
                      nonRef(ai.action.schema.jsonSchema?.requestBody)?.content[
                        requestBody.selected
                      ]?.schema ?? "any",
                    boundIn: node.id,
                  }),
                  inherit: false,
                },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-current`, {
                name: "current",
                description: "",
                schema:
                  getResponseSchema(
                    nonRef(ai.action.schema.jsonSchema?.responses),
                  )[0] ?? "any",
                boundIn: node.id,
              }),
              inherit: false,
            },
          ].filter(nonNull)
        } else if (ai.type === "binder") {
          // ローカル宣言変数の追加
          const assignments = node.actionInstances
            .filter((ai) => ai.type === "binder")
            .flatMap((ai) => ai.instanceParameter.assignments)

          return assignments.map(({ variable }) => ({
            namespace: "vars",
            variable,
            inherit: true,
          }))
        } else {
          return []
        }
      },
    )

    console.log(
      JSON.stringify(parentNodes),
      JSON.stringify(inheritedEnvironment),
      JSON.stringify(targetEnvironments),
    )

    return dedupeEnvironmentBinds([
      ...inheritedEnvironment,
      ...targetEnvironments,
    ])
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
    ].map(({ variable, inherit }) => ({
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
    return [...globalVariables, ...intersect(environments)].map(
      ({ variable, inherit }) => ({
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
