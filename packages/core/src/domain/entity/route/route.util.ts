import type { PrimitiveRoute, Route, RouteId } from "./route"

export const toRouteId = (id: string) => id as RouteId

export const toPrimitiveRoute = (route: Route): PrimitiveRoute => ({
  ...route,
  path: route.path.map(({ id }) => id),
  variables: route.variables.map(({ variable: { id }, value }) => ({
    id,
    value,
  })),
})
