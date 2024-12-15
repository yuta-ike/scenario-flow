import { Context } from "effect"

import type { Store } from "@/lib/jotai/store"

import {
  AddNode,
  AddRoute,
  DeleteNode,
  GetAllRoutes,
  GetChildrenByNodeId,
  GetDefaultNodeName,
  GetNode,
  GetNodeIds,
  GetNodes,
  GetParentNodesById,
  GetResolvedAction,
  GetRoutes,
  GetRoutesByNodeId,
  GetUniqName,
  RemoveRoute,
  SetNode,
  UpdateRoute,
  UpsertVariable,
} from "@/domain/workflow/node"
import { genId } from "@/utils/uuid"
import { getChildrenByNodeId } from "@/domain/selector/getChildrenByNodeId"
import { getRouteIdsByNodeId } from "@/domain/selector/getRouteIdsByNodeId"
import {
  primitiveRouteAtom,
  primitiveRoutesAtom,
  routeIdsAtom,
} from "@/domain/datasource/route"
import {
  nodeDefaultNameCal,
  nodeIdsAtom,
  nodeNameUniqCache,
  nodesAtom,
  primitiveNodeAtom,
} from "@/domain/datasource/node"
import { getParentByNodeId } from "@/domain/selector/getParentByNodeId"
import { addSetOp, updateSetOp } from "@/utils/set"
import { variableAtom } from "@/domain/datasource/variable"
import { resolvedActionAtom } from "@/domain/datasource/actions"
import { GenId } from "@/domain/workflow/common"
import {
  AddGlobalVariable,
  AddGlobalVariableBind as AddGlobalVariableBind,
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
import { buildGlobalVariableBind } from "@/domain/entity/globalVariable/globalVariable"
import { GetNodeStates, SetNodeStates } from "@/domain/workflow/nodeStates"
import { nodeStatesAtom } from "@/domain/datasource/nodeStates"
import { toRouteId } from "@/domain/entity/route/route.util"

export type Context =
  ReturnType<typeof buildContext> extends Context.Context<infer T> ? T : never

export const buildContext = (store: Store) =>
  Context.empty()
    // Node
    .pipe(
      Context.add(AddNode, (node) => {
        store.set(primitiveNodeAtom(node.id), {
          create: node,
        })
      }),
      Context.add(GetNode, (nodeId) => store.get(primitiveNodeAtom(nodeId))),
      Context.add(SetNode, (nodeId, nodeParam) =>
        store.set(primitiveNodeAtom(nodeId), { update: nodeParam }),
      ),
      Context.add(GetNodeIds, () => store.get(nodeIdsAtom).values().toArray()),
      Context.add(GetNodes, () => store.get(nodesAtom).values().toArray()),
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
      Context.add(DeleteNode, (nodeId) => {
        console.log("DELETE node: ", nodeId)
        store.update(
          nodeIdsAtom,
          updateSetOp((prev) => prev.filter((id) => id !== nodeId)),
        )
        primitiveNodeAtom.remove(nodeId)
      }),
      Context.add(GetResolvedAction, (actionId) =>
        store.get(resolvedActionAtom(actionId)),
      ),
    )
    // Route
    .pipe(
      Context.add(AddRoute, (routeParam) => {
        store.set(primitiveRouteAtom(toRouteId(routeParam.id)), {
          create: routeParam,
        })
        store.update(
          routeIdsAtom,
          updateSetOp((prev) => [...prev, toRouteId(routeParam.id)]),
        )
      }),
      Context.add(UpdateRoute, (routeId, param) =>
        store.set(primitiveRouteAtom(routeId), {
          update: param,
        }),
      ),
      Context.add(UpsertVariable, (variableId, variableName, boundIn) =>
        store.set(variableAtom(variableId), {
          create: {
            id: variableId,
            name: variableName,
            description: "",
            schema: "any",
            boundIn,
          },
          update: {
            name: variableName,
            description: "",
            schema: "any",
            boundIn,
          },
          upsert: true,
        }),
      ),
      Context.add(GetRoutes, (routeIds) =>
        routeIds.map((routeId) => store.get(primitiveRouteAtom(routeId))),
      ),
      Context.add(GetAllRoutes, () => store.get(primitiveRoutesAtom)),
      Context.add(RemoveRoute, (routeId) => {
        console.log("DELETE Route: ", routeId)
        primitiveRouteAtom.remove(routeId)
        store.update(
          routeIdsAtom,
          updateSetOp((prev) => prev.filter((id) => id !== routeId)),
        )
      }),
    )
    // global variables
    .pipe(
      Context.add(AddGlobalVariable, (params) => {
        store.set(globalVariableAtom(params.id, params), params)
        store.update(globalVariableIdsAtom, addSetOp(params.id))

        // global variable value の初期化
        const patternIds = store.get(patternIdsAtom)
        patternIds.forEach((patternId) => {
          const globalVariableValueId = toGlobalVariableValueId(
            `${params.id}-${patternId}`,
          )
          globalVariableValueAtom(
            globalVariableValueId,
            buildGlobalVariableBind(globalVariableValueId, {
              globalVariableId: params.id,
              patternId,
              value: { type: "string", value: "" },
            }),
          )
          store.update(
            globalVariableValueIdsAtom,
            addSetOp(globalVariableValueId),
          )
        })
      }),
      Context.add(AddGlobalVariableBind, (params) => {
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
    )
    // NodeStates
    .pipe(
      Context.add(GetNodeStates, (nodeId) => store.get(nodeStatesAtom(nodeId))),
      Context.add(SetNodeStates, (nodeId, nodeStates) =>
        store.set(nodeStatesAtom(nodeId), nodeStates),
      ),
    )
    // Selector
    .pipe(
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
    )
