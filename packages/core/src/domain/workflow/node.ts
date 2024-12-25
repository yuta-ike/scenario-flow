import { Array, Context, Effect, Option, pipe } from "effect"

import {
  updateActionInstanceParameter,
  replaceAction as replaceActionEntity,
  updateNodeConfig as updateNodeConfigEntity,
  appendActionInstance as appendActionInstanceEntity,
  buildPrimitiveNode,
  applyInitialValue,
} from "../entity/node/node"
import { toNodeId } from "../entity/node/node.util"
import {
  appendNodesToRoute,
  insertNodeToRoute,
  removeNodeFromRoute,
  sliceRoute,
} from "../entity/route/route"
import { toRouteId } from "../entity/route/route.util"
import {
  display,
  type ActionSourceIdentifier,
} from "../entity/action/identifier"
import {
  getIdentifier,
  updateRestCallActionParameter,
  type ActionId,
  type ResolvedAction,
} from "../entity/action/action"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { buildUserDefinedAction } from "../entity/userDefinedAction/userDefinedAction"
import { toExpression } from "../entity/value/expression.util"

import { _genId } from "./common"
import { deleteRoute } from "./route"

import type { RestCallActionParameter } from "../entity/action/actionParameter"
import type { UserDefinedActionIdentifier } from "../entity/action/identifier"
import type { UserDefinedAction } from "../entity/userDefinedAction/userDefinedAction"
import type { ActionType } from "../entity/action/action"
import type {
  BuilderParams,
  StripeSymbol,
  StripeSymbol as StripSymbol,
} from "../entity/type"
import type { GenId } from "./common"
import type { LocalVariableId } from "../entity/variable/variable"
import type {
  ActionInstance,
  ActionInstanceId,
  IncludeActionInstance,
} from "../entity/node/actionInstance"
import type { NodeId, PrimitiveNode, NodeConfig } from "../entity/node/node"
import type { RouteId, PrimitiveRoute } from "../entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { DistributiveOmit, PartialDict } from "@/utils/typeUtil"
import type { ContextOf } from "@/lib/effect/contextOf"

import { dedupeArrays, sliceFormer, sliceLatter } from "@/lib/array/utils"
import { associateWithList } from "@/utils/set"
import { matrixArr, matrixEff } from "@/utils/matrix"
import { uniq } from "@/utils/array"
import { nonNull } from "@/utils/assert"
import { genId } from "@/utils/uuid"

// export type GetUniqName = (name: string) => string
// export const GetUniqName = Context.GenericTag<GetUniqName>("GetUniqName")
// const _getUniqName = (name: string) =>
//   GetUniqName.pipe(Effect.map((getUniqName) => getUniqName(name)))

export type GetUsedNodeNames = () => string[]
export const GetUsedNodeNames =
  Context.GenericTag<GetUsedNodeNames>("GetUsedNodeNames")
export const _getUsedNodeNames = () =>
  GetUsedNodeNames.pipe(Effect.map((getUsedNodeNames) => getUsedNodeNames()))

export type GetChildrenByNodeId = (id: NodeId, page?: string) => NodeId[]
export const GetChildrenByNodeId = Context.GenericTag<GetChildrenByNodeId>(
  "GetChildrenByNodeId",
)
const _getChildrenByNodeId = (nodeId: NodeId, page?: string) =>
  GetChildrenByNodeId.pipe(
    Effect.map((getChildrenByNodeId) => getChildrenByNodeId(nodeId, page)),
  )

export type GetRoutesByNodeId = (id: NodeId, page?: string) => PrimitiveRoute[]
export const GetRoutesByNodeId =
  Context.GenericTag<GetRoutesByNodeId>("GetRoutesByNodeId")
export const _getRoutesByNodeId = (nodeId: NodeId, page?: string) =>
  GetRoutesByNodeId.pipe(
    Effect.map((getRoutesByNodeId) =>
      getRoutesByNodeId(nodeId).filter(
        (route) => page == null || route.page === page,
      ),
    ),
  )

export type GetRoutes = (routeIds: RouteId[]) => PrimitiveRoute[]
export const GetRoutes = Context.GenericTag<GetRoutes>("GetRoutes")
export const _getRoutes = (routeIds: RouteId[]) =>
  GetRoutes.pipe(Effect.map((_) => _(routeIds)))

export const _getRoute = (routeId: RouteId) =>
  pipe(
    _getRoutes([routeId]),
    Effect.map((routes) => routes[0]!),
  )

export type GetAllRoutes = () => PrimitiveRoute[]
export const GetAllRoutes = Context.GenericTag<GetAllRoutes>("GetAllRoutes")
export const _getAllRoutes = () =>
  GetAllRoutes.pipe(Effect.map((getAllRoutes) => getAllRoutes()))

export type UpdateRoute = (
  id: RouteId,
  routeParam: OmitId<PrimitiveRoute>,
) => void
export const UpdateRoute = Context.GenericTag<UpdateRoute>("UpdateRoute")
export const _updateRoute = (id: RouteId, route: OmitId<PrimitiveRoute>) =>
  UpdateRoute.pipe(Effect.map((updateRoute) => updateRoute(id, route)))

export type AddRoute = (
  routeParam: PartialDict<StripSymbol<PrimitiveRoute>, "name" | "color">,
) => void
export const AddRoute = Context.GenericTag<AddRoute>("AddRoute")
export const _addRoute = (
  route: PartialDict<StripSymbol<PrimitiveRoute>, "name" | "color">,
) => AddRoute.pipe(Effect.map((addRoute) => addRoute(route)))

export type AddNode = (node: PrimitiveNode) => void
export const AddNode = Context.GenericTag<AddNode>("AddNode")
const _addNode = (node: PrimitiveNode) =>
  AddNode.pipe(Effect.map((addNode) => addNode(node)))

export type GetNode = (nodeId: NodeId) => PrimitiveNode
export const GetNode = Context.GenericTag<GetNode>("GetNode")
export const _getNode = (nodeId: NodeId) =>
  GetNode.pipe(Effect.map((getNode) => getNode(nodeId)))

export type SetNode = (nodeId: NodeId, node: PrimitiveNode) => void
export const SetNode = Context.GenericTag<SetNode>("SetNode")
const _setNode = (nodeId: NodeId, node: PrimitiveNode) =>
  SetNode.pipe(Effect.map((setNode) => setNode(nodeId, node)))

export type GetNodes = () => PrimitiveNode[]
export const GetNodes = Context.GenericTag<GetNodes>("GetNodes")
const _getNodes = () => GetNodes.pipe(Effect.map((getNodes) => getNodes()))

export type GetNodeIds = () => NodeId[]
export const GetNodeIds = Context.GenericTag<GetNodeIds>("GetNodeIds")
export const _getNodeIds = () => GetNodeIds.pipe(Effect.map((_) => _()))

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
export const _removeRoute = (routeId: RouteId) =>
  RemoveRoute.pipe(Effect.map((removeRoute) => removeRoute(routeId)))

export type DeleteNode = (nodeId: NodeId) => void
export const DeleteNode = Context.GenericTag<DeleteNode>("DeleteNode")
export const _deleteNode = (nodeId: NodeId) =>
  DeleteNode.pipe(Effect.map((deleteNode) => deleteNode(nodeId)))

export type AddAction = (action: StripSymbol<UserDefinedAction>) => void
export const AddAction = Context.GenericTag<AddAction>("AddAction")
export const _addAction = (params: StripSymbol<UserDefinedAction>) =>
  AddAction.pipe(Effect.map((addAction) => addAction(params)))

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

export type UpdateActionParameter = (
  actionIdentifier: UserDefinedActionIdentifier,
  action: ResolvedAction,
) => void
export const UpdateActionParameter = Context.GenericTag<UpdateActionParameter>(
  "UpdateActionParameter",
)
const _updateActionParameter = (
  actionIdentifier: UserDefinedActionIdentifier,
  action: ResolvedAction,
) =>
  UpdateActionParameter.pipe(
    Effect.map((updateActionParameter) =>
      updateActionParameter(actionIdentifier, action),
    ),
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
  actionInstances: StripSymbol<ActionInstance[]>,
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
  )

const _buildNode = (
  id: NodeId,
  nodeParam: StripSymbol<OmitId<PrimitiveNode, "name">>,
): Effect.Effect<
  PrimitiveNode,
  never,
  GetUsedNodeNames | GetRoutes | GetDefaultNodeName | GetResolvedAction
> =>
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
    // Effect.bind("name", ({ nameCandidate }) => _getUniqName(nameCandidate)),
    Effect.bind("usedNames", () => _getUsedNodeNames()),
    Effect.bind("routesMap", () =>
      pipe(
        Effect.succeed(
          nodeParam.actionInstances
            .filter((ai): ai is IncludeActionInstance => ai.type === "include")
            .map((ai) => ai.instanceParameter.ref),
        ),
        Effect.map((routeIds) => uniq(routeIds)),
        Effect.flatMap(Effect.forEach((routeId) => _getRoutes([routeId]))),
        Effect.map((routes) => routes.map((r) => r[0]).filter(nonNull)),
        Effect.map((routes) => new Map(routes.map((r) => [r.id, r]))),
      ),
    ),
    Effect.map(({ usedNames, actionMap, nameCandidate }) =>
      pipe(
        buildPrimitiveNode(
          id,
          { name: nameCandidate, ...nodeParam },
          usedNames,
        ),
        (primitiveNode) => applyInitialValue(primitiveNode, actionMap),
      ),
    ),
  )

// 新しいノードを追加
export const _createAndAddNode = (
  nodeParam: BuilderParams<DistributiveOmit<PrimitiveNode, "name">>,
) =>
  pipe(
    _genId(),
    Effect.flatMap((id) => _buildNode(toNodeId(id), nodeParam)),
    Effect.tap((_) => _addNode(_)),
  )

// ノードをルートに追加する
const _appendNodeToRoutePath = (
  id: NodeId,
  parentNodeId: NodeId,
  page: string,
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
                  Effect.map((_) => appendNodesToRoute(_, id)),
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
                    page,
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
  nodeParam: StripSymbol<OmitId<PrimitiveNode, "name">>,
  parentNodeId: NodeId,
  page: string,
): Effect.Effect<
  NodeId,
  never,
  ContextOf<typeof _createAndAddNode | typeof _appendNodeToRoutePath>
> =>
  pipe(
    // ノードの作成と追加
    _createAndAddNode(nodeParam),
    Effect.map((node) => node.id),
    // 親ノードの最後にノードを追加する
    Effect.tap((_) => _appendNodeToRoutePath(_, parentNodeId, page)),
  )

// 途中にノードを追加する
export const insertNode = (
  nodeParam: OmitId<StripSymbol<PrimitiveNode>, "name">,
  fromNodeId: NodeId,
  toNodeId: NodeId,
  page: string,
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
      Effect.Do.pipe(
        Effect.bind("fromRoutes", () => _getRoutesByNodeId(fromNodeId, page)),
        Effect.bind("toRoutes", () => _getRoutesByNodeId(toNodeId, page)),
        Effect.let("routes", ({ fromRoutes, toRoutes }) => {
          const targetIds = new Set(toRoutes.map((_) => _.id)).intersection(
            new Set(fromRoutes.map((_) => _.id)),
          )
          return fromRoutes.filter((route) => targetIds.has(route.id))
        }),
        Effect.flatMap(({ routes }) =>
          Effect.forEach(routes, (route) =>
            pipe(
              Effect.succeed(insertNodeToRoute(route, nodeId, fromNodeId)),
              Effect.flatMap((_) => _updateRoute(_.id, _)),
            ),
          ),
        ),
      ),
    ),
  )

export const unshiftNode = (
  nodeParam: OmitId<StripSymbol<PrimitiveNode>, "name">,
  routeId: RouteId,
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
        _getRoutes([routeId]),
        Effect.map((routes) => routes[0]!),
        Effect.map((route) => insertNodeToRoute(route, nodeId, null)),
        Effect.flatMap((_) => _updateRoute(_.id, _)),
      ),
    ),
  )

export const createUserDefinedRestCallRootNode = (
  page: string,
): Effect.Effect<
  NodeId,
  never,
  | GenId
  | AddAction
  | GetUsedNodeNames
  | GetRoutes
  | GetDefaultNodeName
  | GetResolvedAction
  | AddNode
  | AddRoute
> =>
  Effect.Do.pipe(
    Effect.bind("id", () => _genId()),
    Effect.bind("action", ({ id }) =>
      pipe(
        Effect.succeed(id),
        Effect.map((id) =>
          buildUserDefinedAction(id, {
            name: "",
            description: "",
            type: "rest_call",
            schema: {
              base: {
                method: "GET",
                path: "/example",
              },
              examples: [],
            },
          }),
        ),
        Effect.tap((action) => _addAction(action)),
      ),
    ),
    Effect.flatMap(({ action }) =>
      _createAndAddNode({
        description: "",
        actionInstances: [
          {
            id: toActionInstanceId(genId()),
            type: "rest_call",
            description: "",
            instanceParameter: {},
            config: {
              followRedirect: false,
              useCookie: false,
            },
            actionIdentifier: {
              resourceType: "user_defined",
              resourceIdentifier: {
                userDefinedActionId: action.id,
              },
            },
          },
          {
            id: toActionInstanceId(genId()),
            type: "validator",
            instanceParameter: {
              contents: toExpression(""),
            },
          },
          {
            id: toActionInstanceId(genId()),
            type: "binder",
            instanceParameter: {
              assignments: [],
            },
          },
        ],
        config: {},
      }),
    ),
    Effect.map((_) => _.id),
    Effect.tap((_) =>
      _createAndAddRoute({
        path: [_],
        page,
      }),
    ),
  )

export const appendUserDefinedRestCallNode = (nodeId: NodeId, page: string) =>
  pipe(
    _genId(),
    Effect.map((id) =>
      buildUserDefinedAction(id, {
        name: "",
        description: "",
        type: "rest_call",
        schema: {
          base: {
            method: "GET",
            path: "/example",
          },
          examples: [],
        },
      }),
    ),
    Effect.tap((action) => _addAction(action)),
    Effect.flatMap((action) =>
      appendNode(
        {
          description: "",
          actionInstances: [
            {
              id: toActionInstanceId(genId()),
              type: "rest_call",
              description: "",
              instanceParameter: {},
              config: {
                followRedirect: false,
                useCookie: false,
              },
              actionIdentifier: {
                resourceType: "user_defined",
                resourceIdentifier: {
                  userDefinedActionId: action.id,
                },
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "validator",
              instanceParameter: {
                contents: toExpression(""),
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "binder",
              instanceParameter: {
                assignments: [],
              },
            },
          ],
          config: {},
        },
        nodeId,
        page,
      ),
    ),
  )

export const insertUserDefinedRestCallNode = (
  fromNodeId: NodeId,
  toNodeId: NodeId,
  page: string,
) =>
  pipe(
    _genId(),
    Effect.map((id) =>
      buildUserDefinedAction(id, {
        name: "",
        description: "",
        type: "rest_call",
        schema: {
          base: {
            method: "GET",
            path: "/example",
          },
          examples: [],
        },
      }),
    ),
    Effect.tap((action) => _addAction(action)),
    Effect.flatMap((action) =>
      insertNode(
        {
          description: "",
          actionInstances: [
            {
              id: toActionInstanceId(genId()),
              type: "rest_call",
              description: "",
              instanceParameter: {},
              config: {
                followRedirect: false,
                useCookie: false,
              },
              actionIdentifier: {
                resourceType: "user_defined",
                resourceIdentifier: {
                  userDefinedActionId: action.id,
                },
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "validator",
              instanceParameter: {
                contents: toExpression(""),
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "binder",
              instanceParameter: {
                assignments: [],
              },
            },
          ],
          config: {},
        },
        fromNodeId,
        toNodeId,
        page,
      ),
    ),
  )

export const unshiftUserDefinedRestCallNode = (routeId: RouteId) =>
  pipe(
    _genId(),
    Effect.map((id) =>
      buildUserDefinedAction(id, {
        name: "",
        description: "",
        type: "rest_call",
        schema: {
          base: {
            method: "GET",
            path: "/example",
          },
          examples: [],
        },
      }),
    ),
    Effect.tap((action) => _addAction(action)),
    Effect.flatMap((action) =>
      unshiftNode(
        {
          description: "",
          actionInstances: [
            {
              id: toActionInstanceId(genId()),
              type: "rest_call",
              description: "",
              instanceParameter: {},
              config: {
                followRedirect: false,
                useCookie: false,
              },
              actionIdentifier: {
                resourceType: "user_defined",
                resourceIdentifier: {
                  userDefinedActionId: action.id,
                },
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "validator",
              instanceParameter: {
                contents: toExpression(""),
              },
            },
            {
              id: toActionInstanceId(genId()),
              type: "binder",
              instanceParameter: {
                assignments: [],
              },
            },
          ],
          config: {},
        },
        routeId,
      ),
    ),
  )

// ノードを更新する
export const updateNode = (
  nodeId: NodeId,
  param: Partial<Pick<PrimitiveNode, "name" | "description">>,
): Effect.Effect<void, never, SetNode> =>
  pipe(
    _getNode(nodeId),
    Effect.map((_) => ({
      ..._,
      name: param.name ?? _.name,
      description: param.description ?? _.description,
    })),
    Effect.tap((node) => _setNode(nodeId, node)),
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

// Actionを更新する
export const updateUserDefinedAction = (
  identifier: UserDefinedActionIdentifier,
  param: Partial<RestCallActionParameter>,
) =>
  pipe(
    _getResolvedAction(identifier),
    Effect.map((action) => updateRestCallActionParameter(action, param)),
    Effect.flatMap((action) => _updateActionParameter(identifier, action)),
  )

// 新しいActionを作成し、既存のインスタンスの向き先を変更する
export const changeToNewAction = (
  nodeId: NodeId,
  actionInstanceId: ActionInstanceId,
  param: RestCallActionParameter,
) =>
  pipe(
    _genId(),
    Effect.flatMap((id) =>
      pipe(
        Effect.succeed(id),
        Effect.map((id) =>
          buildUserDefinedAction(id, {
            name: `${param.method} ${param.path}`,
            description: "",
            type: "rest_call",
            schema: {
              base: param,
              examples: [],
            },
          }),
        ),
        Effect.tap((action) => _addAction(action)),
      ),
    ),
    Effect.flatMap((action) =>
      pipe(
        _getNode(nodeId),
        Effect.map((node) =>
          updateActionInstanceParameter(node, actionInstanceId, {
            ...node.actionInstances.find((ai) => ai.id === actionInstanceId)!,
            actionIdentifier: {
              resourceType: "user_defined",
              resourceIdentifier: {
                userDefinedActionId: action.id,
              },
            },
          }),
        ),
        Effect.tap((node) => _setNode(nodeId, node)),
      ),
    ),
  )

/**
 * 兄弟ノードに関してループして処理を実行する
 */
const _forEachSibilingNodeIds = <A, E, R>(
  nodeId: NodeId,
  effect: (
    parentNodeId: NodeId,
    sibilingNodeIds: NodeId[],
  ) => Effect.Effect<A, E, R>,
) =>
  pipe(
    _getParentNodesById(nodeId),
    Effect.flatMap((parentNodeIds) =>
      Effect.forEach(parentNodeIds, (parentNodeId) =>
        pipe(
          _getChildrenByNodeId(parentNodeId),
          Effect.flatMap((sibilingNodeIds) =>
            effect(parentNodeId, sibilingNodeIds),
          ),
        ),
      ),
    ),
  )

const _isLeafNode = <A1, E1, R1, A2, E2, R2>(
  nodeId: NodeId,
  {
    onTrue,
    onFalse,
  }: {
    onTrue: () => Effect.Effect<A1, E1, R1>
    onFalse: () => Effect.Effect<A2, E2, R2>
  },
) =>
  pipe(
    _getChildrenByNodeId(nodeId),
    Effect.flatMap((children) =>
      Effect.if(children.length === 0, {
        onTrue,
        onFalse,
      }),
    ),
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
        Effect.if(route.path[0] === nodeId, {
          // NOTE: ルートノードの場合
          onTrue: () =>
            Effect.if(route.path.length === 1, {
              onTrue: () => _removeRoute(route.id),
              onFalse: () =>
                pipe(
                  Effect.succeed(route),
                  Effect.map((_) => removeNodeFromRoute(_, nodeId)),
                  Effect.flatMap((_) => _updateRoute(route.id, _)),
                ),
            }),
          onFalse: () =>
            _forEachSibilingNodeIds(nodeId, (_, sibilingNodeIds) =>
              Effect.if(
                route.path.at(-1) === nodeId && 1 < sibilingNodeIds.length,
                {
                  // NOTE: リーフノードであり、かつ親ノードが複数の子を持つ
                  onTrue: () => _removeRoute(route.id),
                  onFalse: () =>
                    pipe(
                      Effect.succeed(route),
                      Effect.map((_) => removeNodeFromRoute(_, nodeId)),
                      Effect.flatMap((_) => _updateRoute(_.id, _)),
                      Effect.asVoid,
                    ),
                },
              ),
            ),
        }),
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
  Effect.Do.pipe(
    Effect.flatMap(() => _removeNodeFromAllRoutes(nodeId)),
    Effect.flatMap(() => _deleteNode(nodeId)),
    Effect.as(nodeId),
  )

// ノードの接続を削除する
export const disconnectNodes = ({
  fromNodeId,
  toNodeId,
}: {
  fromNodeId: NodeId
  toNodeId: NodeId
}) =>
  Effect.Do.pipe(
    Effect.bind("fromRoutes", () => _getRoutesByNodeId(fromNodeId)),
    Effect.bind("toRouteIds", () =>
      _getRoutesByNodeId(toNodeId).pipe(
        Effect.map((routes) => routes.map((route) => route.id)),
      ),
    ),
    Effect.flatMap(({ fromRoutes, toRouteIds }) =>
      Effect.if(fromRoutes.length === 1, {
        onTrue: () =>
          pipe(
            Effect.succeed(fromRoutes[0]),
            Effect.map((_) => sliceRoute(_!, toNodeId)),
            Effect.flatMap((_) => _updateRoute(_.id, _)),
          ),
        onFalse: () =>
          pipe(
            Effect.succeed(
              new Set(fromRoutes.map((route) => route.id)).intersection(
                new Set(toRouteIds),
              ),
            ),
            Effect.flatMap((routeIds) =>
              Effect.forEach(routeIds, (routeId) => deleteRoute(routeId)),
            ),
          ),
      }),
    ),
    Effect.asVoid,
  )

// ノードを移動する
export const moveNode = (
  nodeId: NodeId,
  newParentNodeId: NodeId,
  page: string,
): Effect.Effect<
  void,
  never,
  ContextOf<typeof _removeNodeFromAllRoutes | typeof _appendNodeToRoutePath>
> =>
  Effect.Do.pipe(
    Effect.tap(_removeNodeFromAllRoutes(nodeId)),
    Effect.tap(_appendNodeToRoutePath(nodeId, newParentNodeId, page)),
    Effect.asVoid,
  )

// ノード間を接続する
export const connectNodes = (
  fromNodeId: NodeId,
  toNodeId: NodeId,
  page: string,
) =>
  pipe(
    _isLeafNode(fromNodeId, {
      onTrue: () =>
        Effect.Do.pipe(
          Effect.bind("formerRoutes", () =>
            pipe(
              Effect.succeed(fromNodeId),
              Effect.flatMap((_) => _getRoutesByNodeId(_)),
            ),
          ),
          Effect.bind("latterSubpaths", () =>
            pipe(
              Effect.succeed(toNodeId),
              Effect.flatMap((_) => _getRoutesByNodeId(_)),
              Effect.map(
                Array.map((route) => sliceLatter(route.path, toNodeId)),
              ),
              Effect.map(dedupeArrays),
            ),
          ),
          Effect.flatMap(({ formerRoutes, latterSubpaths }) =>
            matrixEff(formerRoutes, latterSubpaths, (baseRoute, latter) =>
              pipe(
                Effect.succeed(
                  appendNodesToRoute(baseRoute, toNodeId, ...latter),
                ),
                Effect.flatMap((_) => _updateRoute(_.id, _)),
              ),
            ),
          ),
          Effect.tap((_) => _),
        ),
      onFalse: () =>
        Effect.Do.pipe(
          Effect.bind("formerSubpaths", () =>
            pipe(
              Effect.succeed(fromNodeId),
              Effect.flatMap((_) => _getRoutesByNodeId(_)),
              Effect.map(
                Array.map((route) => sliceFormer(route.path, fromNodeId)),
              ),
              Effect.map(dedupeArrays),
            ),
          ),
          Effect.bind("latterSubpaths", () =>
            pipe(
              Effect.succeed(toNodeId),
              Effect.flatMap((_) => _getRoutesByNodeId(_)),
              Effect.map(
                Array.map((route) => sliceLatter(route.path, toNodeId)),
              ),
              Effect.map(dedupeArrays),
            ),
          ),
          Effect.map(({ formerSubpaths, latterSubpaths }) =>
            matrixArr(formerSubpaths, latterSubpaths, (former, latter) => [
              ...former,
              fromNodeId,
              toNodeId,
              ...latter,
            ]),
          ),
          Effect.tap((routePaths) =>
            Effect.forEach(routePaths, (routePath) =>
              _genId().pipe(
                Effect.map(toRouteId),
                Effect.flatMap((_) =>
                  _addRoute({
                    id: _,
                    name: "",
                    path: routePath,
                    page,
                  }),
                ),
              ),
            ),
          ),
        ),
    }),
  )

// 新しいルートを作成する
const _createAndAddRoute = (
  routeParam: PartialDict<
    StripSymbol<OmitId<PrimitiveRoute>>,
    "name" | "color"
  >,
): Effect.Effect<RouteId, never, ContextOf<typeof _genId | typeof _addRoute>> =>
  pipe(
    _genId(),
    Effect.map((id) => toRouteId(id)),
    Effect.tap((id) => _addRoute({ ...routeParam, id })),
  )

// ルートノードを作成する
export const createRootNode = (
  node: OmitId<StripeSymbol<PrimitiveNode>, "name">,
  page: string,
): Effect.Effect<
  NodeId,
  unknown,
  ContextOf<typeof _createAndAddNode | typeof _createAndAddRoute>
> =>
  pipe(
    _createAndAddNode(node),
    Effect.map((_) => _.id),
    Effect.tap((_) =>
      _createAndAddRoute({
        path: [_],
        page,
      }),
    ),
  )

// ActionInstanceを追加する
export const appendActionInstance = (
  nodeId: NodeId,
  type: Exclude<ActionType, "unknown">,
): Effect.Effect<ActionInstanceId, never, GenId | GetNode | SetNode> =>
  Effect.Do.pipe(
    Effect.bind("id", () => _genId().pipe(Effect.map(toActionInstanceId))),
    Effect.tap(({ id }) =>
      pipe(
        _getNode(nodeId),
        Effect.map((node) => appendActionInstanceEntity(node, type, id)),
        Effect.tap((node) => _setNode(nodeId, node)),
      ),
    ),
    Effect.map(({ id }) => id),
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
    Effect.flatMap((_) => Effect.forEach(_, (node) => _setNode(node.id, node))),
  )
