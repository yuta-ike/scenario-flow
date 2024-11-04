import { updateRoute as updateRouteEntity } from "../entity/route/route"

import type { RouteId, PrimitiveRoute } from "../entity/route/route"
import type { OmitId } from "@/utils/idType"

type UpdateRouteContext = {
  getRoute: (routeId: RouteId) => PrimitiveRoute
  updateRoute: (routeId: RouteId, route: OmitId<PrimitiveRoute>) => void
}

export const updateRoute = (
  routeId: RouteId,
  update: Partial<Pick<PrimitiveRoute, "name" | "color" | "page">>,
  context: UpdateRouteContext,
) => {
  const { updateRoute, getRoute } = context

  const route = getRoute(routeId)
  const newRoute = updateRouteEntity(route, update)

  updateRoute(routeId, newRoute)
}
