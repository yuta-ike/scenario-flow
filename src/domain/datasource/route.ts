import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { nodeAtom } from "./node"

import type { PrimitiveRoute, Route, RouteId } from "../entity/route/route"
import type { Atom, SetStateAction } from "jotai"
import type { PartialDict } from "@/utils/typeUtil"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { count } from "@/utils/array"
import { COLORS } from "@/utils/pcss"

// atoms
export const routeIdsAtom = atomSet<RouteId>([])
routeIdsAtom.debugLabel = "routeIdsAtom"

const _primitiveRouteAtom = atomWithId<PrimitiveRoute>("primitiveRouteAtom")
export const primitiveRouteAtom = (id: RouteId) => {
  const newAtom = atom(
    (get) => get(_primitiveRouteAtom(id)),
    (
      get,
      set,
      update: SetStateAction<PartialDict<PrimitiveRoute, "name" | "color">>,
    ) => {
      const getDefaultName = () => `シナリオ${get(routeIdsAtom).size + 1}`
      const getColor = () => get(routeColorCache)
      const initValue =
        typeof update === "function"
          ? undefined
          : {
              ...update,
              color: update.color ?? getColor(),
              name:
                update.name == null || update.name.length === 0
                  ? getDefaultName()
                  : update.name,
            }

      set(_primitiveRouteAtom(id, initValue), (prevValue) => {
        const newValue =
          typeof update === "function" ? update(prevValue) : update

        return {
          ...newValue,
          color: newValue.color ?? getColor(),
          name:
            newValue.name == null || newValue.name.length === 0
              ? getDefaultName()
              : newValue.name,
        }
      })
    },
  )
  newAtom.debugLabel = `primitiveRouteAtom(${id})/wrapper`
  return newAtom
}

// selectors
export const routeAtom = atomFamily<RouteId, Atom<Route>>((id: RouteId) => {
  const newAtom = atom((get) => {
    const primitiveRoute = get(primitiveRouteAtom(id))
    const path = primitiveRoute.path.map((nodeId) => get(nodeAtom(nodeId)))

    return {
      ...primitiveRoute,
      path,
    }
  })
  newAtom.debugLabel = `routeAtom(${id})`
  return newAtom
})

export const primitiveRoutesAtom = atom((get) => {
  const ids = get(routeIdsAtom).values()
  return ids.map((id) => get(primitiveRouteAtom(id))).toArray()
})
primitiveRoutesAtom.debugLabel = "primitiveRoutesAtom"

export const routesAtom = atom((get) => {
  const ids = get(routeIdsAtom).values()
  return ids.map((id) => get(routeAtom(id))).toArray()
})

// cache
// TODO: color周りはここで管理するのは微妙な気がする
const routeColorCache = atom((get) => {
  const routes = get(routeIdsAtom)
    .values()
    .map((routeId) => get(primitiveRouteAtom(routeId)))
    .toArray()
  const colors = routes.map((route) => route.color)
  const colorCountMap = count(colors)

  COLORS.map((color) => {
    if (!colorCountMap.has(color)) {
      colorCountMap.set(color, 0)
    }
  })

  const leastUsedColor = Array.from(colorCountMap.entries()).reduce(
    (prev, curr) => (prev[1] < curr[1] ? prev : curr),
  )[0]
  return leastUsedColor
})
