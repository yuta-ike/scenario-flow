import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { nodeAtom, primitiveNodeAtom } from "../datasource/node"
import {
  dedupeEnvironmentBinds,
  intersect,
  type Bind,
  type Environment,
} from "../entity/environment/environment"
import { buildLocalVariable } from "../entity/variable/variable"
import { nonRef } from "../openapi/isNotRef"
import { getResponseSchema } from "../openapi/response"
import { primitiveRouteAtom } from "../datasource/route"
import { variableAtom } from "../datasource/variable"
import { resolveVariable } from "../entity/environment/variable"

import { getParentByNodeId } from "./getParentByNodeId"
import { getRouteIdsByNodeId } from "./getRouteIdsByNodeId"

import type { ResolvedEnvironment } from "../entity/environment/environment"
import type { NodeId } from "../entity/node/node"

import { nonNull } from "@scenario-flow/util"
import { dedupe } from "@scenario-flow/util/lib"

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
              variable: buildLocalVariable(`${nodeId}-${index}-steps-status`, {
                namespace: "steps",
                name: `${node.name}.res.status`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps-headers`, {
                namespace: "steps",
                name: `${node.name}.res.headers`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps-cookies`, {
                namespace: "steps",
                name: `${node.name}.res.cookies`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps-body`, {
                namespace: "steps",
                name: `${node.name}.res.body`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps-rawBody`, {
                namespace: "steps",
                name: `${node.name}.res.rawBody`,
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
              variable: buildLocalVariable(
                `${nodeId}-${index}-current-res-status`,
                {
                  name: "current.res.status",
                  description: "",
                  schema: "any",
                  boundIn: node.id,
                },
              ),
              inherit: false,
            },
            {
              variable: buildLocalVariable(
                `${nodeId}-${index}-current-res-headers`,
                {
                  name: "current.res.headers",
                  description: "",
                  schema: "any",
                  boundIn: node.id,
                },
              ),
              inherit: false,
            },
            {
              variable: buildLocalVariable(
                `${nodeId}-${index}-current-res-cookies`,
                {
                  name: "current.res.headers",
                  description: "",
                  schema: "any",
                  boundIn: node.id,
                },
              ),
              inherit: false,
            },
            {
              variable: buildLocalVariable(
                `${nodeId}-${index}-current-res-rawBody`,
                {
                  name: "current.res.headers",
                  description: "",
                  schema: "any",
                  boundIn: node.id,
                },
              ),
              inherit: false,
            },
            {
              variable: buildLocalVariable(
                `${nodeId}-${index}-current-res-body-data`,
                {
                  name: "current.res.body",
                  description: "",
                  schema:
                    getResponseSchema(
                      nonRef(ai.action.schema.jsonSchema?.responses),
                    )[0] ?? "any",
                  boundIn: node.id,
                },
              ),
              inherit: false,
            },
          ].filter(nonNull)
        } else if (ai.type === "db") {
          return [
            {
              variable: buildLocalVariable(`${nodeId}-${index}-steps-rows`, {
                namespace: "steps",
                name: `${node.name}.rows[]`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: true,
            },
            {
              variable: buildLocalVariable(`${nodeId}-${index}-current-rows`, {
                name: `current.rows[]`,
                description: "",
                schema: "any",
                boundIn: node.id,
              }),
              inherit: false,
            },
          ]
        } else if (ai.type === "binder") {
          // ローカル宣言変数の追加
          const assignments = node.actionInstances
            .filter((ai) => ai.type === "binder")
            .flatMap((ai) => ai.instanceParameter.assignments)

          return assignments.map(({ variable }) => ({
            variable,
            inherit: true,
          }))
        } else {
          return []
        }
      },
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
    const routeVariableIds = dedupe(
      get(getRouteIdsByNodeId(nodeId)).flatMap((routeId) =>
        get(primitiveRouteAtom(routeId)).variables.map(({ id }) => id),
      ),
    )

    const routeVariables = routeVariableIds
      .map((variableId) => get(variableAtom(variableId)))
      .map((variable) => ({
        variable: {
          ...variable,
          namespace: "vars" as const,
        },
        inherit: true,
      }))
      .filter(({ variable }) => variable.name !== "")

    const res = [...routeVariables, ...get(getNodeEnvironment(nodeId))].map(
      ({ variable, ...rest }) => ({
        variable: resolveVariable(variable, {
          getRoute: (routeId) => get(primitiveRouteAtom(routeId)),
          getNode: (nodeId) => get(primitiveNodeAtom(nodeId)),
        }),
        ...rest,
      }),
    )

    return res
  })
  newAtom.debugLabel = `getResolvedNodeEnvironment(${nodeId})`
  return newAtom
})

export const getResolvedParentNodeEnvironment = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<ResolvedEnvironment>((get) => {
    const routeVariableIds = dedupe(
      get(getRouteIdsByNodeId(nodeId)).flatMap((routeId) =>
        get(primitiveRouteAtom(routeId)).variables.map(({ id }) => id),
      ),
    )

    const routeVariables = routeVariableIds
      .map((variableId) => get(variableAtom(variableId)))
      .map((variable) => ({
        variable: {
          ...variable,
          namespace: "vars" as const,
        },
        inherit: true,
      }))
      .filter(({ variable }) => variable.name !== "")

    const nodeIds = get(getParentByNodeId(nodeId))
    const environments = nodeIds.map((nodeId) =>
      get(getNodeEnvironment(nodeId)).filter((bind) => bind.inherit),
    )

    const res = [...routeVariables, ...intersect(environments)].map(
      ({ variable, ...rest }) => ({
        variable: resolveVariable(variable, {
          getRoute: (routeId) => get(primitiveRouteAtom(routeId)),
          getNode: (nodeId) => get(primitiveNodeAtom(nodeId)),
        }),
        ...rest,
      }),
    )
    return res
  })
  newAtom.debugLabel = `getResolvedNodeEnvironment(${nodeId})`
  return newAtom
})
