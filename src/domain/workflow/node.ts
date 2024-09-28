import { Context, Effect, pipe } from "effect"

import { createNode, updateActionInstanceParameter } from "../entity/node/node"
import { toNodeId } from "../entity/node/node.util"
import { appendNodeToRoute, removeNodeFromRoute } from "../entity/route/route"
import { toRouteId } from "../entity/route/route.util"
import { updateNodeConfig as updateNodeConfigEntity } from "../entity/node/node"

import type { LocalVariableId } from "../entity/variable/variable"
import type {
  ActionInstance,
  ActionInstanceId,
} from "../entity/node/actionInstance"
import type { NodeId, PrimitiveNode, NodeConfig } from "../entity/node/node"
import type { Route, RouteId, PrimitiveRoute } from "../entity/route/route"
import type { Id, OmitId } from "@/utils/idType"
import type { PartialDict } from "@/utils/typeUtil"
import type { ContextOf } from "@/lib/effect/contextOf"

import { dedupeArrays, sliceFormer } from "@/lib/array/utils"

export type GenId = () => Id
export const GenId = Context.GenericTag<GenId>("GenId")
const _genId = () => GenId.pipe(Effect.map((genId) => genId()))

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
  routeParam: PartialDict<PrimitiveRoute, "name" | "color">,
) => void
export const AddRoute = Context.GenericTag<AddRoute>("AddRoute")
const _addRoute = (route: PartialDict<PrimitiveRoute, "name" | "color">) =>
  AddRoute.pipe(Effect.map((addRoute) => addRoute(route)))

export type AddNode = (
  nodeId: NodeId,
  node: OmitId<PrimitiveNode, "name">,
) => void
export const AddNode = Context.GenericTag<AddNode>("AddNode")
const _addNode = (nodeId: NodeId, node: OmitId<PrimitiveNode, "name">) =>
  AddNode.pipe(Effect.map((addNode) => addNode(nodeId, node)))

export type GetNode = (nodeId: NodeId) => PrimitiveNode
export const GetNode = Context.GenericTag<GetNode>("GetNode")
const _getNode = (nodeId: NodeId) =>
  GetNode.pipe(Effect.map((getNode) => getNode(nodeId)))

export type SetNode = (nodeId: NodeId, node: PrimitiveNode) => void
export const SetNode = Context.GenericTag<SetNode>("SetNode")
const _setNode = (nodeId: NodeId, node: PrimitiveNode) =>
  SetNode.pipe(Effect.map((setNode) => setNode(nodeId, node)))

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

export type UpsertVariable = (id: LocalVariableId, name: string) => void
export const UpsertVariable =
  Context.GenericTag<UpsertVariable>("UpsertVariable")
const _upsertVariable = (id: LocalVariableId, name: string) =>
  UpsertVariable.pipe(Effect.map((upsertVariable) => upsertVariable(id, name)))

// 新しいノードを追加
export const _createAndAddNode = (
  nodeParam: OmitId<PrimitiveNode, "name">,
): Effect.Effect<NodeId, never, GenId | AddNode> =>
  pipe(
    _genId(),
    Effect.map((_) => toNodeId(_)),
    Effect.tap((_) => _addNode(_, createNode(nodeParam))),
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
  nodeParam: OmitId<PrimitiveNode, "name">,
  parentNodeId: NodeId,
): Effect.Effect<
  void,
  never,
  GenId | AddNode | ContextOf<typeof _appendNodeToRoutePath>
> =>
  pipe(
    // ノードの作成と追加
    _createAndAddNode(nodeParam),
    // 親ノードの最後にノードを追加する
    Effect.tap((_) => _appendNodeToRoutePath(_, parentNodeId)),
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
  addRoute: (route: PartialDict<PrimitiveRoute, "name" | "color">) => void
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
  routeParam: PartialDict<OmitId<PrimitiveRoute>, "name" | "color">,
): Effect.Effect<RouteId, never, ContextOf<typeof _genId | typeof _addRoute>> =>
  pipe(
    _genId(),
    Effect.map((id) => toRouteId(id)),
    Effect.tap((id) => _addRoute({ ...routeParam, id })),
  )

// ルートノードを作成する
export const createRootNode = (node: OmitId<PrimitiveNode, "name">) =>
  pipe(
    _createAndAddNode(node),
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
  actionInstance: ActionInstance,
): Effect.Effect<void, never, ContextOf<typeof _getNode | typeof _setNode>> =>
  pipe(
    _getNode(nodeId),
    Effect.map((_) =>
      updateActionInstanceParameter(_, actionInstanceId, actionInstance),
    ),
    Effect.tap((node) => _setNode(nodeId, node)),
  )

// Variableのアップデート
export const upsertVariables = (
  data: { id: LocalVariableId; name: string }[],
) =>
  pipe(
    Effect.succeed(data),
    Effect.flatMap((_) =>
      Effect.forEach(_, (_) => _upsertVariable(_.id, _.name)),
    ),
    Effect.asVoid,
  )
