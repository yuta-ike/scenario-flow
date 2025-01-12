import { Context, Effect, pipe } from "effect"

import {
  swapRoutePath as swapRoutePathEntity,
  updateRoute as updateRouteEntity,
  updateRouteVariables as updateRouteVariablesEntity,
} from "../entity/route/route"
import { toRouteId } from "../entity/route/route.util"

import {
  _addRoute,
  _deleteNode,
  _getAllRoutes,
  _getRoute,
  _getRoutes,
  _getRoutesByNodeId,
  _removeRoute,
  _updateRoute,
  _upsertVariable,
} from "./node"
import { _genId } from "./common"

import type { Expression } from "../entity/value/expression"
import type { LocalVariableId } from "../entity/variable/variable"
import type { NodeId } from "../entity/node/node"
import type { StripeSymbol } from "../entity/type"
import type { RouteId, PrimitiveRoute } from "../entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { PartialDict } from "@/utils/typeUtil"

export type GetUsedRouteNames = () => string[]
export const GetUsedRouteNames =
  Context.GenericTag<GetUsedRouteNames>("GetUsedRouteNames")
export const _getUsedRouteNames = () =>
  GetUsedRouteNames.pipe(Effect.map((getRouteNames) => getRouteNames()))

export const addRoute = (
  route: PartialDict<StripeSymbol<OmitId<PrimitiveRoute>>, "name" | "color">,
) =>
  pipe(
    _genId(),
    Effect.map((_) => toRouteId(_)),
    Effect.flatMap((id) => _addRoute({ id, ...route })),
  )

export const updateRoute = (
  routeId: RouteId,
  update: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
) =>
  Effect.Do.pipe(
    Effect.bind("route", () => _getRoute(routeId)),
    Effect.bind("names", () => _getUsedRouteNames()),
    Effect.map(({ route, names }) => updateRouteEntity(route, update, names)),
    Effect.flatMap((newRoute) => _updateRoute(routeId, newRoute)),
  )

export const updatePageName = ({
  prevPage,
  newPage,
}: {
  prevPage: string
  newPage: string
}) =>
  pipe(
    _getAllRoutes(),
    Effect.map((routes) => routes.filter((route) => route.page === prevPage)),
    Effect.map((routes) => routes.map((route) => route.id)),
    Effect.flatMap(
      Effect.forEach((routeId) => updateRoute(routeId, { page: newPage })),
    ),
  )

export const swapRoutePath = (
  routeId: RouteId,
  nodeIdA: NodeId,
  nodeIdB: NodeId,
) =>
  pipe(
    _getRoutes([routeId]),
    Effect.map((routes) => routes[0]!),
    Effect.map((route) => swapRoutePathEntity(route, nodeIdA, nodeIdB)),
    Effect.flatMap((newRoute) => _updateRoute(routeId, newRoute)),
  )

export const deleteRoute = (routeId: RouteId) =>
  pipe(
    _getRoutes([routeId]),
    Effect.map((routes) => routes[0]!.path),
    Effect.flatMap(
      Effect.forEach((nodeId) =>
        pipe(
          _getRoutesByNodeId(nodeId),
          Effect.flatMap((routes) =>
            Effect.if(0 < routes.length, {
              onTrue: () => Effect.void,
              onFalse: () => _deleteNode(nodeId),
            }),
          ),
        ),
      ),
    ),
    Effect.flatMap((_) => _removeRoute(routeId)),
  )

export const updateRouteVariables = (
  routeId: RouteId,
  variables: { id: LocalVariableId; name: string; value: Expression }[],
) =>
  pipe(
    _getRoute(routeId),
    Effect.tap(() =>
      Effect.allSuccesses(
        variables.map(({ id, name }) =>
          _upsertVariable(id, name, { type: "route", routeId }),
        ),
      ),
    ),
    Effect.map((route) => updateRouteVariablesEntity(route, variables)),
    Effect.tap((route) => _updateRoute(routeId, route)),
  )
