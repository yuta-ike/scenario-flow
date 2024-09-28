import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { resolveActionInstance } from "../selector/resolveActionInstance"

import { resolvedActionAtom } from "./actions"

import type { ParameterLocation, ParameterObject } from "openapi3-ts/oas31"
import type { PrimitiveNode, Node, NodeId } from "../entity/node/node"
import type { Atom } from "jotai"
import type { OmitId } from "@/utils/idType"
import type { RestCallActionInstanceParameter } from "../entity/node/actionInstance"
import type { KVItem } from "@/ui/lib/kv"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { associateBy, updateSetOp } from "@/utils/set"
import { genId } from "@/utils/uuid"
import { emptyJson } from "@/utils/json"
import {
  getExample,
  getResponseExampleForFormData,
  getResponseExampleForJson,
} from "@/lib/openapi-utils/retrieveFromSpec"
import {
  genResponseFormDataSampleFromSchema,
  genResponseJsonSampleFromSchema,
} from "@/lib/json-schema/genJsonFromSchema"

// primitive atom
export const _primitiveNodeAtom = atomWithId<PrimitiveNode>(
  "primitiveNodeAtom/private",
)

/**
 * NodeIdのリストを返す
 */
export const nodeIdsAtom = atomSet<NodeId>([])
nodeIdsAtom.debugLabel = "nodeIdsAtom"

export const nodeNameUniqCache = atomSet<string>([])

export const primitiveNodeAtom = atomFamily((nodeId: NodeId) => {
  const newAtom = atom(
    (get) => {
      return get(_primitiveNodeAtom(nodeId))
    },
    (
      get,
      set,
      param:
        | { create: OmitId<PrimitiveNode, "name">; update?: undefined }
        | { create?: undefined; update: OmitId<PrimitiveNode> },
    ) => {
      if (param.update != null) {
        // 更新
        set(_primitiveNodeAtom(nodeId), (prev) => ({
          ...prev,
          ...param.update,
        }))
        return
      }

      const restCallActions = param.create.actionInstances
        .filter((ai) => ai.type === "rest_call")
        .map((ai) => get(resolvedActionAtom(ai.actionRef.actionId)))

      const actionMap = associateBy(restCallActions, "id")

      const name = (() => {
        const name =
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          restCallActions.find((action) => action.type === "rest_call")
            ?.parameter.operationObject?.operationId ??
          `ブロック${get(nodeIdsAtom).size + 1}`

        if (!get(nodeNameUniqCache).has(name)) {
          return name
        }
        // 名前に被りがある場合は採番する
        for (let i = 2; i < 999; i++) {
          const altName = `${name} (${i})`
          if (!get(nodeNameUniqCache).has(altName)) {
            return altName
          }
        }
        return genId()
      })()

      // 名前のキャッシュ更新
      set(
        nodeNameUniqCache,
        updateSetOp((prev) => [...prev, name]),
      )

      const initialNode = {
        id: nodeId,
        name,
        ...param.create,
        actionInstances: param.create.actionInstances.map((ai) => {
          if (ai.type === "rest_call") {
            const presetParameters = actionMap.get(
              ai.actionRef.actionId,
            )?.parameter

            const operationObject = presetParameters?.operationObject
            if (operationObject == null) {
              return ai
            }

            // operation objectが存在する場合は、デフォルトのパラメータをセットする
            const parametersMap = operationObject.parameters
              ?.filter(
                (paramObj): paramObj is ParameterObject =>
                  !("$ref" in paramObj),
              )
              .reduce((map, { name, in: location, example, examples }) => {
                map.set(location, [
                  ...(map.get(location) ?? []),
                  {
                    id: genId(), // TODO: genId here
                    key: name,
                    value: getExample(example, examples),
                  },
                ])
                return map
              }, new Map<ParameterLocation, KVItem[]>())

            return {
              ...ai,
              instanceParameter: {
                headers: parametersMap?.get("header") ?? [],
                queryParams: parametersMap?.get("query") ?? [],
                pathParams: parametersMap?.get("path") ?? [],
                cookies: parametersMap?.get("cookie") ?? [],
                body: {
                  "application/json":
                    getResponseExampleForJson(operationObject.responses) ??
                    genResponseJsonSampleFromSchema(
                      operationObject.responses,
                    ) ??
                    emptyJson,
                  "application/form-data":
                    getResponseExampleForFormData(operationObject.responses) ??
                    genResponseFormDataSampleFromSchema(
                      operationObject.responses,
                    ) ??
                    [],
                },
                description:
                  actionMap.get(ai.actionRef.actionId)?.description ?? "",
              } satisfies RestCallActionInstanceParameter,
            }
          } else {
            return ai
          }
        }),
      }

      _primitiveNodeAtom(nodeId, initialNode)
      set(
        nodeIdsAtom,
        updateSetOp((prev) => [...prev, nodeId]),
      )
    },
  )
  newAtom.debugLabel = `primitiveNodeAtom/${nodeId}/wrapper`

  return newAtom
})

/**
 * PrimitiveNodeにactionInstanceを加えたNodeを返す
 */
export const nodeAtom = atomFamily<NodeId, Atom<Node>>((id: NodeId) => {
  const newAtom = atom((get) => {
    const primitiveNode = get(primitiveNodeAtom(id))

    const actionInstances = primitiveNode.actionInstances.map(
      (actionInstance) => resolveActionInstance(get, actionInstance),
    )

    return {
      ...primitiveNode,
      actionInstances,
    }
  })
  newAtom.debugLabel = `nodeAtom(${id})`
  return newAtom
})

/**
 * Nodeのリストを返す
 */
export const nodesAtom = atom((get) => {
  const ids = get(nodeIdsAtom).values()
  return new Set(ids.map((id) => get(primitiveNodeAtom(id))))
})
nodesAtom.debugLabel = "nodesAtom"
