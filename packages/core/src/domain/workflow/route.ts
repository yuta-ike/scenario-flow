import { Effect, pipe } from "effect"

import { updateRoute as updateRouteEntity } from "../entity/route/route"
import { toRouteId } from "../entity/route/route.util"

import {
  _addRoute,
  _deleteNode,
  _getAllRoutes,
  _getRoutes,
  _getRoutesByNodeId,
  _removeRoute,
  _updateRoute,
} from "./node"
import { _genId } from "./common"

import type { StripeSymbol } from "../entity/type"
import type { RouteId, PrimitiveRoute } from "../entity/route/route"
import type { OmitId } from "@/utils/idType"
import type { PartialDict } from "@/utils/typeUtil"

type UpdateRouteContext = {
  getRoute: (routeId: RouteId) => PrimitiveRoute
  updateRoute: (routeId: RouteId, route: OmitId<PrimitiveRoute>) => void
}

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
  pipe(
    _getRoutes([routeId]),
    Effect.map((routes) => routes[0]!),
    Effect.map((route) => updateRouteEntity(route, update)),
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
