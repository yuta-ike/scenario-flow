import { Context } from "effect"

import type { Store } from "@/lib/jotai/store"
import type { ActionId } from "@/domain/entity/action/action"

import {
  AddNode,
  AddRoute,
  GetChildrenByNodeId,
  GetDefaultNodeName,
  GetNode,
  GetParentNodesById,
  GetResolvedAction,
  GetRoutesByNodeId,
  GetUniqName,
  SetNode,
  UpdateRoute,
  UpsertVariable,
} from "@/domain/workflow/node"
import { genId } from "@/utils/uuid"
import { getChildrenByNodeId } from "@/domain/selector/getChildrenByNodeId"
import { getRouteIdsByNodeId } from "@/domain/selector/getRouteIdsByNodeId"
import { primitiveRouteAtom, routeIdsAtom } from "@/domain/datasource/route"
import {
  nodeDefaultNameCal,
  nodeNameUniqCache,
  primitiveNodeAtom,
} from "@/domain/datasource/node"
import { getParentByNodeId } from "@/domain/selector/getParentByNodeId"
import { addSetOp, updateSetOp } from "@/utils/set"
import { variableAtom } from "@/domain/datasource/variable"
import { resolvedActionAtom } from "@/domain/datasource/actions"
import { GenId } from "@/domain/workflow/common"
import {
  AddGlobalVariable,
  AddGlobalVariableValue,
  UpdateGlobalVariable,
  UpdateGlobalVariableValue,
} from "@/domain/workflow/globalVariable"
import {
  globalVariableAtom,
  globalVariableIdsAtom,
  globalVariableValueAtom,
  globalVariableValueIdsAtom,
  patternIdsAtom,
} from "@/domain/datasource/globalVariable"
import { toGlobalVariableValueId } from "@/domain/entity/globalVariable/globalVariable.util"

export type Context =
  ReturnType<typeof buildContext> extends Context.Context<infer T> ? T : never

export const buildContext = (store: Store) =>
  Context.empty().pipe(
    // Node
    Context.add(AddNode, (node) => {
      store.set(primitiveNodeAtom(node.id), {
        create: node,
      })
    }),
    Context.add(GetNode, (nodeId) => store.get(primitiveNodeAtom(nodeId))),
    Context.add(SetNode, (nodeId, nodeParam) =>
      store.set(primitiveNodeAtom(nodeId), { update: nodeParam }),
    ),
    Context.add(GetDefaultNodeName, () => store.get(nodeDefaultNameCal)),
    Context.add(GetUniqName, (rawName) => {
      const usedNames = store.get(nodeNameUniqCache)
      if (!usedNames.has(rawName)) {
        store.set(nodeNameUniqCache, new Set(usedNames).add(rawName))
        return rawName
      }
      for (let i = 1; i < 100; i++) {
        const name = `${rawName}_${i}`
        if (!usedNames.has(name)) {
          store.set(nodeNameUniqCache, new Set(usedNames).add(name))
          return name
        }
      }
      return `${rawName}_99`
    }),
    // Route
    Context.add(AddRoute, (routeParam) => {
      store.set(primitiveRouteAtom(routeParam.id), routeParam)
      store.update(
        routeIdsAtom,
        updateSetOp((prev) => [...prev, routeParam.id]),
      )
    }),
    Context.add(UpdateRoute, (routeId, routeParam) =>
      store.set(primitiveRouteAtom(routeId), (prevRoute) => ({
        ...prevRoute,
        ...routeParam,
      })),
    ),
    Context.add(UpsertVariable, (variableId, variableName) =>
      store.set(
        variableAtom(variableId, {
          id: variableId,
          name: variableName,
          description: "",
          schema: "any",
        }),
        {
          id: variableId,
          name: variableName,
          description: "",
          schema: "any",
        },
      ),
    ),
    // global variables
    Context.add(AddGlobalVariable, (params) => {
      store.set(globalVariableAtom(params.id, params), params)
      store.update(globalVariableIdsAtom, addSetOp(params.id))

      // global variable value の初期化
      const patternIds = store.get(patternIdsAtom)
      patternIds.forEach((patternId) => {
        const globalVariableValueId = toGlobalVariableValueId(
          `${params.id}-${patternId}`,
        )
        globalVariableValueAtom(globalVariableValueId, {
          id: globalVariableValueId,
          globalVariableId: params.id,
          patternId,
          value: { type: "string", value: "" },
        })
        store.update(
          globalVariableValueIdsAtom,
          addSetOp(globalVariableValueId),
        )
      })
    }),
    Context.add(AddGlobalVariableValue, (params) => {
      store.set(globalVariableValueAtom(params.id, params), params)
      store.update(globalVariableValueIdsAtom, addSetOp(params.id))
    }),
    Context.add(UpdateGlobalVariable, (params) => {
      store.set(globalVariableAtom(params.id), params)
    }),
    Context.add(UpdateGlobalVariableValue, (globalVariableValueId, value) => {
      store.set(globalVariableValueAtom(globalVariableValueId), (prev) => ({
        ...prev,
        value,
      }))
    }),
    // Selectors
    Context.add(GenId, () => genId()),
    Context.add(GetChildrenByNodeId, (nodeId) =>
      store.get(getChildrenByNodeId(nodeId)),
    ),
    Context.add(GetRoutesByNodeId, (nodeId) =>
      store
        .get(getRouteIdsByNodeId(nodeId))
        .map((routeId) => store.get(primitiveRouteAtom(routeId))),
    ),
    Context.add(GetParentNodesById, (nodeId) => {
      return store.get(getParentByNodeId(nodeId))
    }),
    // Action
    Context.add(GetResolvedAction, (actionId: ActionId) =>
      store.get(resolvedActionAtom(actionId)),
    ),
  )
