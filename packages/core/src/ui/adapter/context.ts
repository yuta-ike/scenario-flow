import { Context } from "effect"

import { updateSetOp, addSetOp, genId } from "@scenario-flow/util"
import { Store } from "@scenario-flow/util/lib"
import { resolvedActionAtom } from "../../domain/datasource/actions"
import {
  globalVariableAtom,
  globalVariableIdsAtom,
  patternIdsAtom,
  globalVariableValueAtom,
  globalVariableValueIdsAtom,
} from "../../domain/datasource/globalVariable"
import {
  primitiveNodeAtom,
  nodeIdsAtom,
  nodesAtom,
  nodeDefaultNameCal,
  nodeNameUniqCache,
} from "../../domain/datasource/node"
import { nodeStatesAtom } from "../../domain/datasource/nodeStates"
import {
  primitiveRouteAtom,
  routeIdsAtom,
  primitiveRoutesAtom,
  routeNamesCache,
} from "../../domain/datasource/route"
import { userDefinedActionAtom } from "../../domain/datasource/userDefinedAction"
import { variableAtom } from "../../domain/datasource/variable"
import { getChildrenByNodeId } from "../../domain/selector/getChildrenByNodeId"
import { getParentByNodeId } from "../../domain/selector/getParentByNodeId"
import { getRouteIdsByNodeId } from "../../domain/selector/getRouteIdsByNodeId"
import { GenId } from "../../domain/workflow/common"
import {
  AddGlobalVariable,
  AddGlobalVariableBind,
  UpdateGlobalVariable,
  UpdateGlobalVariableValue,
} from "../../domain/workflow/globalVariable"
import {
  AddNode,
  GetNode,
  SetNode,
  GetNodeIds,
  GetNodes,
  GetDefaultNodeName,
  GetUsedNodeNames,
  DeleteNode,
  AddAction,
  GetResolvedAction,
  AddRoute,
  UpdateRoute,
  UpsertVariable,
  GetRoutes,
  GetAllRoutes,
  RemoveRoute,
  GetChildrenByNodeId,
  GetRoutesByNodeId,
  GetParentNodesById,
  UpdateActionParameter as UpdateActionParameter,
} from "../../domain/workflow/node"
import { GetNodeStates, SetNodeStates } from "../../domain/workflow/nodeStates"
import { GetUsedRouteNames } from "../../domain/workflow/route"
import {
  toUserDefinedActionId,
  toRouteId,
  toGlobalVariableValueId,
  buildGlobalVariableBind,
} from "../../domain/entity"

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
      Context.add(GetUsedNodeNames, () =>
        store.get(nodeNameUniqCache).values().toArray(),
      ),
      Context.add(DeleteNode, (nodeId) => {
        store.update(
          nodeIdsAtom,
          updateSetOp((prev) => prev.filter((id) => id !== nodeId)),
        )
        console.log("REMOVE")
        store.remove(primitiveNodeAtom, nodeId)
      }),
      Context.add(AddAction, (action) => {
        store.set(userDefinedActionAtom(toUserDefinedActionId(action.id)), {
          create: action,
        })
      }),
      Context.add(UpdateActionParameter, (identifier, action) => {
        store.set(
          userDefinedActionAtom(
            identifier.resourceIdentifier.userDefinedActionId,
          ),
          {
            update: action,
          },
        )
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
      Context.add(GetUsedRouteNames, () =>
        store.get(routeNamesCache).values().toArray(),
      ),
      Context.add(RemoveRoute, (routeId) => {
        console.log("DELETE Route: ", routeId)
        store.remove(primitiveRouteAtom, routeId)
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
