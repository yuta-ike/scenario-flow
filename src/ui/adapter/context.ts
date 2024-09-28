import { Context } from "effect"

import type { Store } from "@/lib/jotai/store"

import {
  AddNode,
  AddRoute,
  GenId,
  GetChildrenByNodeId,
  GetNode,
  GetParentNodesById,
  GetRoutesByNodeId,
  SetNode,
  UpdateRoute,
  UpsertVariable,
} from "@/domain/workflow/node"
import { genId } from "@/utils/uuid"
import { getChildrenByNodeId } from "@/domain/selector/getChildrenByNodeId"
import { getRouteIdsByNodeId } from "@/domain/selector/getRouteIdsByNodeId"
import { primitiveRouteAtom, routeIdsAtom } from "@/domain/datasource/route"
import { primitiveNodeAtom } from "@/domain/datasource/node"
import { getParentByNodeId } from "@/domain/selector/getParentByNodeId"
import { updateSetOp } from "@/utils/set"
import { resolvedActionAtom } from "@/domain/datasource/actions"
import { variableAtom } from "@/domain/datasource/variable"

export type Context =
  ReturnType<typeof buildContext> extends Context.Context<infer T> ? T : never

export const buildContext = (store: Store) =>
  Context.empty().pipe(
    // Node
    Context.add(AddNode, (nodeId, nodeParam) => {
      // NOTE: actionが存在する場合、actionを参照してデフォルト値を設定する
      // TODO: primitiveNodeのwriteAtomに移動する
      // NOTE: rest_callのみに絞ってる
      const actionIds = nodeParam.actionInstances.flatMap((ai) =>
        ai.type === "rest_call" ? ai.actionRef.actionId : [],
      )
      const actions = actionIds.map((actionId) =>
        store.get(resolvedActionAtom(actionId)),
      )

      const name = (() => {
        const restCallAction = actions.find(
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          (action) => action.type === "rest_call",
        )
        if (restCallAction == null) {
          return "<empty>"
        }
        // NOTE: 名前被りが発生する可能性があるのでその対応
        return (
          restCallAction.parameter.operationObject?.operationId ??
          `${restCallAction.parameter.method} ${restCallAction.parameter.path}`
        )
      })()

      store.set(primitiveNodeAtom(nodeId), {
        create: {
          id: nodeId,
          name,
          ...nodeParam,
        },
      })
    }),
    Context.add(GetNode, (nodeId) => store.get(primitiveNodeAtom(nodeId))),
    Context.add(SetNode, (nodeId, nodeParam) =>
      store.set(primitiveNodeAtom(nodeId), { update: nodeParam }),
    ),
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
  )
