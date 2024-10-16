import { Context, Effect, Option, pipe } from "effect"

import {
  updateActionInstanceParameter,
  replaceAction as replaceActionEntity,
  updateNodeConfig as updateNodeConfigEntity,
  resolvePrimitveNode,
  buildPrimitiveNode,
  applyInitialValue,
} from "../entity/node/node"
import { toNodeId } from "../entity/node/node.util"
import { appendNodeToRoute, removeNodeFromRoute } from "../entity/route/route"
import { toRouteId } from "../entity/route/route.util"
import {
  display,
  type ActionSourceIdentifier,
} from "../entity/action/identifier"
import {
  getIdentifier,
  type ActionId,
  type ResolvedAction,
} from "../entity/action/action"

import { _genId } from "./common"

import type { StripeSymbol } from "../entity/type"
import type { GenId } from "./common"
import type { LocalVariableId } from "../entity/variable/variable"
import type {
  ActionInstance,
  ActionInstanceId,
} from "../entity/node/actionInstance"
import type {
  NodeId,
  PrimitiveNode,
  NodeConfig,
  RawPrimitiveNode,
} from "../entity/node/node"
import type {
  Route,
  RouteId,
  PrimitiveRoute,
  RawPrimitiveRoute,
} from "../entity/route/route"
import type { Id, OmitId } from "@/utils/idType"
import type { PartialDict } from "@/utils/typeUtil"
import type { ContextOf } from "@/lib/effect/contextOf"

import { dedupeArrays, sliceFormer } from "@/lib/array/utils"
import { associateWithList } from "@/utils/set"

export type GetUniqName = (name: string) => string
export const GetUniqName = Context.GenericTag<GetUniqName>("GetUniqName")
const _getUniqName = (name: string) =>
  GetUniqName.pipe(Effect.map((getUniqName) => getUniqName(name)))

export type GetChildrenByNodeId = (id: NodeId) => NodeId[]
export const GetChildrenByNodeId = Context.GenericTag<GetChildrenByNodeId>(
  "GetChildrenByNodeId",
)
const _getChildrenByNodeId = (nodeId: NodeId) =>
  GetChildrenByNodeId.pipe(
    Effect.map((getChildrenByNodeId) => getChildrenByNodeId(nodeId)),
  )

export type GetRoutesByNodeId = (id: NodeId) => PrimitiveRoute[]
export const GetRoutesByNodeId =
  Context.GenericTag<GetRoutesByNodeId>("GetRoutesByNodeId")
const _getRoutesByNodeId = (nodeId: NodeId) =>
  GetRoutesByNodeId.pipe(
    Effect.map((getRoutesByNodeId) => getRoutesByNodeId(nodeId)),
  )

export type UpdateRoute = (
  id: RouteId,
  routeParam: OmitId<PrimitiveRoute>,
) => void
export const UpdateRoute = Context.GenericTag<UpdateRoute>("UpdateRoute")
const _updateRoute = (id: RouteId, route: OmitId<PrimitiveRoute>) =>
  UpdateRoute.pipe(Effect.map((updateRoute) => updateRoute(id, route)))

export type AddRoute = (
  routeParam: PartialDict<RawPrimitiveRoute, "name" | "color">,
) => void
export const AddRoute = Context.GenericTag<AddRoute>("AddRoute")
const _addRoute = (route: PartialDict<RawPrimitiveRoute, "name" | "color">) =>
  AddRoute.pipe(Effect.map((addRoute) => addRoute(route)))

export type AddNode = (node: PrimitiveNode) => void
export const AddNode = Context.GenericTag<AddNode>("AddNode")
const _addNode = (node: PrimitiveNode) =>
  AddNode.pipe(Effect.map((addNode) => addNode(node)))

export type GetNode = (nodeId: NodeId) => PrimitiveNode
export const GetNode = Context.GenericTag<GetNode>("GetNode")
const _getNode = (nodeId: NodeId) =>
  GetNode.pipe(Effect.map((getNode) => getNode(nodeId)))

export type SetNode = (nodeId: NodeId, node: PrimitiveNode) => void
export const SetNode = Context.GenericTag<SetNode>("SetNode")
const _setNode = (nodeId: NodeId, node: PrimitiveNode) =>
  SetNode.pipe(Effect.map((setNode) => setNode(nodeId, node)))

export type GetNodes = () => PrimitiveNode[]
export const GetNodes = Context.GenericTag<GetNodes>("GetNodes")
const _getNodes = () => GetNodes.pipe(Effect.map((getNodes) => getNodes()))

export type GetDefaultNodeName = () => string
export const GetDefaultNodeName =
  Context.GenericTag<GetDefaultNodeName>("GetDefaultNodeName")
const _getDefaultNodeName = () =>
  GetDefaultNodeName.pipe(
    Effect.map((getDefaultNodeName) => getDefaultNodeName()),
  )

export type GetParentNodesById = (id: NodeId) => NodeId[]
export const GetParentNodesById =
  Context.GenericTag<GetParentNodesById>("GetParentNodesById")
const _getParentNodesById = (nodeId: NodeId) =>
  GetParentNodesById.pipe(
    Effect.map((getParentNodesById) => getParentNodesById(nodeId)),
  )

export type RemoveRoute = (routeId: RouteId) => void
export const RemoveRoute = Context.GenericTag<RemoveRoute>("RemoveRoute")
const _removeRoute = (routeId: RouteId) =>
  RemoveRoute.pipe(Effect.map((removeRoute) => removeRoute(routeId)))

export type DeleteNode = (nodeId: NodeId) => void
export const DeleteNode = Context.GenericTag<DeleteNode>("DeleteNode")
const _deleteNode = (nodeId: NodeId) =>
  DeleteNode.pipe(Effect.map((deleteNode) => deleteNode(nodeId)))

export type UpsertVariable = (
  id: LocalVariableId,
  name: string,
  boundIn: NodeId,
) => void
export const UpsertVariable =
  Context.GenericTag<UpsertVariable>("UpsertVariable")
const _upsertVariable = (id: LocalVariableId, name: string, boundIn: NodeId) =>
  UpsertVariable.pipe(
    Effect.map((upsertVariable) => upsertVariable(id, name, boundIn)),
  )

export type GetResolvedAction = (
  actionIdentifier: ActionSourceIdentifier,
) => ResolvedAction
export const GetResolvedAction =
  Context.GenericTag<GetResolvedAction>("GetResolvedAction")
const _getResolvedAction = (actionIdentifier: ActionSourceIdentifier) =>
  GetResolvedAction.pipe(
    Effect.map((getResolvedAction) => getResolvedAction(actionIdentifier)),
  )

const _resolveActionInstances = (
  actionInstances: StripeSymbol<ActionInstance[]>,
): Effect.Effect<Map<string, ResolvedAction>, never, GetResolvedAction> =>
  pipe(
    Effect.succeed(actionInstances),
    Effect.flatMap((_) =>
      Effect.all(
        _.map((_) => _.actionIdentifier as ActionSourceIdentifier | undefined)
          .filter((_) => _ != null)
          .map((_) => _getResolvedAction(_)),
      ),
    ),
    Effect.map((_) =>
      associateWithList(_, (action) => getIdentifier(action))
        .entries()
        .map(([key, values]) => [display(key), values[0]] as const),
    ),
    Effect.map((_) => new Map(_)),
    Effect.tap((_) => console.log(_)),
  )

const _buildNode = (
  id: NodeId,
  nodeParam: StripeSymbol<OmitId<PrimitiveNode, "name">>,
) =>
  Effect.Do.pipe(
    Effect.bind("actionMap", () =>
      _resolveActionInstances(nodeParam.actionInstances),
    ),
    Effect.bind("nameCandidate", ({ actionMap }) =>
      Option.fromNullable(
        actionMap.values().toArray()[0]?.schema.jsonSchema?.operationId,
      ).pipe(
        Option.map((_) => Effect.succeed(_)),
        (_) => Option.getOrElse(_, () => _getDefaultNodeName()),
      ),
    ),
    Effect.bind("name", ({ nameCandidate }) => _getUniqName(nameCandidate)),
    Effect.map(({ name, actionMap }) =>
      resolvePrimitveNode(
        buildPrimitiveNode(id, { name, ...nodeParam }),
        actionMap,
        new Map(),
      ),
    ),
    Effect.map((_) => applyInitialValue(_)),
  )

// 新しいノードを追加
export const _createAndAddNode = (
  nodeParam: OmitId<RawPrimitiveNode, "name">,
): Effect.Effect<
  PrimitiveNode,
  never,
  GenId | AddNode | GetResolvedAction | GetUniqName
> =>
  pipe(
    _genId(),
    Effect.map((_) => toNodeId(_)),
    Effect.flatMap((_) => _buildNode(_, nodeParam)),
    Effect.tap((_) => _addNode(_)),
  )

// ノードをルートに追加する
const _appendNodeToRoutePath = (
  id: NodeId,
  parentNodeId: NodeId,
): Effect.Effect<
  void,
  never,
  ContextOf<
    | typeof _getChildrenByNodeId
    | typeof _getRoutesByNodeId
    | typeof _updateRoute
    | typeof _createAndAddRoute
  >
> =>
  Effect.Do.pipe(
    Effect.let("id", () => id),
    Effect.bind("sibilingNodes", () => _getChildrenByNodeId(parentNodeId)),
    Effect.flatMap(({ id, sibilingNodes }) =>
      Effect.if(sibilingNodes.length === 0, {
        onTrue: () =>
          pipe(
            Effect.succeed(parentNodeId),
            Effect.flatMap((_) => _getRoutesByNodeId(_)),
            Effect.flatMap(
              Effect.forEach((route) =>
                pipe(
                  Effect.succeed(route),
                  Effect.map((_) => appendNodeToRoute(_, id)),
                  Effect.tap((_) => _updateRoute(_.id, _)),
                ),
              ),
            ),
          ),
        onFalse: () =>
          pipe(
            _getRoutesByNodeId(parentNodeId),
            Effect.flatMap(
              Effect.forEach(({ path }) =>
                Effect.succeed(sliceFormer(path, parentNodeId)),
              ),
            ),
            Effect.map((_) => dedupeArrays(_)),
            Effect.flatMap(
              Effect.forEach((path) =>
                pipe(
                  Effect.succeed(path),
                  Effect.map((path) => ({
                    path: [...path, parentNodeId, id],
                    page: 0,
                  })),
                  Effect.flatMap((_) => _createAndAddRoute(_)),
                ),
              ),
            ),
          ),
      }),
    ),
    Effect.asVoid,
  )

// ノードを追加する
export const appendNode = (
  nodeParam: OmitId<RawPrimitiveNode, "name">,
  parentNodeId: NodeId,
): Effect.Effect<
  void,
  never,
  ContextOf<typeof _createAndAddNode | typeof _appendNodeToRoutePath>
> =>
  pipe(
    // ノードの作成と追加
    _createAndAddNode(nodeParam),
    // 親ノードの最後にノードを追加する
    Effect.tap((_) => _appendNodeToRoutePath(_.id, parentNodeId)),
    Effect.asVoid,
  )

// 途中にノードを追加する
export const insertNode = (
  nodeParam: OmitId<PrimitiveNode>,
  parentNodeId: NodeId,
): Effect.Effect<
  NodeId,
  never,
  ContextOf<
    typeof _createAndAddNode | typeof _getRoutesByNodeId | typeof _updateRoute
  >
> =>
  pipe(
    // ノードの作成と追加
    _createAndAddNode(nodeParam),
    Effect.map((_) => _.id),
    // ルートにノードを追加する
    Effect.tap((nodeId) =>
      pipe(
        _getRoutesByNodeId(parentNodeId),
        Effect.flatMap(
          Effect.forEach((route) =>
            pipe(
              Effect.succeed(route),
              Effect.map((_) => appendNodeToRoute(_, nodeId)),
              Effect.map((_) => _updateRoute(_.id, _)),
            ),
          ),
        ),
      ),
    ),
  )

// ノードの設定を更新する
export const updateNodeConfig = (
  nodeId: NodeId,
  config: NodeConfig,
): Effect.Effect<
  PrimitiveNode,
  never,
  ContextOf<typeof _getNode | typeof _setNode>
> =>
  pipe(
    _getNode(nodeId),
    Effect.map(
      (_: PrimitiveNode): PrimitiveNode => updateNodeConfigEntity(_, config),
    ),
    Effect.tap((_) => _setNode(nodeId, _)),
  )

// 全てのルートからノードを削除する
const _removeNodeFromAllRoutes = (
  nodeId: NodeId,
): Effect.Effect<
  void,
  never,
  ContextOf<
    | typeof _getRoutesByNodeId
    | typeof _getParentNodesById
    | typeof _removeRoute
    | typeof _updateRoute
  >
> =>
  pipe(
    _getRoutesByNodeId(nodeId),
    Effect.flatMap((routes) =>
      Effect.forEach(routes, (route) =>
        Effect.Do.pipe(
          // TODO: この呼び出しをオプショナルにしたい
          Effect.bind("parentRoutes", () => _getParentNodesById(nodeId)),
          Effect.flatMap(({ parentRoutes }) =>
            Effect.if(
              // NOTE: リーフノードであり、かつ親ノードが複数の子を持つ
              route.path.at(-1) === nodeId && 1 < parentRoutes.length,
              {
                onTrue: () => _removeRoute(route.id),
                onFalse: () =>
                  pipe(
                    Effect.succeed(route),
                    Effect.map((_) => removeNodeFromRoute(_, nodeId)),
                    Effect.map((_) => _updateRoute(_.id, _)),
                    Effect.asVoid,
                  ),
              },
            ),
          ),
        ),
      ),
    ),
    Effect.asVoid,
  )

// ノードを削除する
export const deleteNode = (
  nodeId: NodeId,
): Effect.Effect<
  NodeId,
  never,
  ContextOf<typeof _removeNodeFromAllRoutes | typeof _deleteNode>
> =>
  pipe(
    Effect.succeed(nodeId),
    Effect.tap((_) => _removeNodeFromAllRoutes(_)),
    Effect.tap((_) => _deleteNode(_)),
  )

// ノードを移動する
export const moveNode = (
  nodeId: NodeId,
  newParentNodeId: NodeId,
): Effect.Effect<
  void,
  never,
  ContextOf<typeof _removeNodeFromAllRoutes | typeof _appendNodeToRoutePath>
> =>
  Effect.Do.pipe(
    Effect.tap(_removeNodeFromAllRoutes(nodeId)),
    Effect.tap(_appendNodeToRoutePath(nodeId, newParentNodeId)),
    Effect.asVoid,
  )

type ConnectNodesContext = {
  getRoutesByNodeId: (id: NodeId) => Route[]
  addRoute: (route: PartialDict<RawPrimitiveRoute, "name" | "color">) => void
  genId: () => Id
}

// ノード間を接続する
export const connectNodes = (
  fromNodeId: NodeId,
  toNodeId: NodeId,
  context: ConnectNodesContext,
) => {
  const { getRoutesByNodeId, addRoute, genId } = context

  const routes = getRoutesByNodeId(fromNodeId)

  const representRoute = routes[0]!

  const formerSubpaths = routes.map((route) => {
    const pathNodeIds = route.path.map((node) => node.id)
    return sliceFormer(pathNodeIds, fromNodeId)
  })
  const dedupedFormerSubpaths = dedupeArrays(formerSubpaths)

  const latterSubpaths = routes.map((route) => {
    const pathNodeIds = route.path.map((node) => node.id)
    return sliceFormer(pathNodeIds, toNodeId)
  })
  const dedupedLatterSubpaths = dedupeArrays(latterSubpaths)

  const newRoutepaths = dedupedFormerSubpaths.flatMap((formerSubpath) =>
    dedupedLatterSubpaths.map((latterSubpath) => [
      ...formerSubpath,
      fromNodeId,
      toNodeId,
      ...latterSubpath,
    ]),
  )

  newRoutepaths.forEach((routePath) => {
    const id = genId()
    addRoute({
      id: toRouteId(id),
      name: "",
      path: routePath,
      page: representRoute.page,
    })
  })
}

// 新しいルートを作成する
const _createAndAddRoute = (
  routeParam: PartialDict<OmitId<RawPrimitiveRoute>, "name" | "color">,
): Effect.Effect<RouteId, never, ContextOf<typeof _genId | typeof _addRoute>> =>
  pipe(
    _genId(),
    Effect.map((id) => toRouteId(id)),
    Effect.tap((id) => _addRoute({ ...routeParam, id })),
  )

// ルートノードを作成する
export const createRootNode = (node: OmitId<RawPrimitiveNode, "name">) =>
  pipe(
    _createAndAddNode(node),
    Effect.map((_) => _.id),
    Effect.flatMap((_) =>
      _createAndAddRoute({
        path: [_],
        page: 0,
      }),
    ),
  )

// 指定したActionInstanceのParameterを更新する
export const updateActionInstancesParameter = (
  nodeId: NodeId,
  actionInstanceId: ActionInstanceId,
  params: ActionInstance,
): Effect.Effect<void, never, ContextOf<typeof _getNode | typeof _setNode>> =>
  pipe(
    _getNode(nodeId),
    Effect.map((_) =>
      updateActionInstanceParameter(_, actionInstanceId, params),
    ),
    Effect.tap((_) => console.log(_)),
    Effect.tap((node) => _setNode(nodeId, node)),
  )

// Variableのアップデート
export const upsertVariables = (
  data: { id: LocalVariableId; name: string; boundIn: NodeId }[],
) =>
  pipe(
    Effect.succeed(data),
    Effect.flatMap((_) =>
      Effect.forEach(_, (_) => _upsertVariable(_.id, _.name, _.boundIn)),
    ),
    Effect.asVoid,
  )

// Actionを差し替える
export const replaceAction = (oldActionId: ActionId, newActionId: ActionId) =>
  pipe(
    _getNodes(),
    Effect.map((nodes) =>
      nodes.map((node) => replaceActionEntity(node, oldActionId, newActionId)),
    ),
    Effect.tap((_) => console.log(_)),
    Effect.flatMap((_) => Effect.forEach(_, (node) => _setNode(node.id, node))),
  )
