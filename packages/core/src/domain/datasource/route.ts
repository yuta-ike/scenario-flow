import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  buildPrimitiveRoute,
  type PrimitiveRoute,
  type Route,
  type RouteId,
} from "../entity/route/route"

import { nodeAtom, nodeIdsAtom, primitiveNodeAtom } from "./node"
import { variableAtom } from "./variable"

import type { NodeId } from "../entity/node/node"
import type { StripeSymbol } from "../entity/type"
import type { Atom, SetStateAction } from "jotai"
import type { PartialDict } from "@/utils/typeUtil"
import type { CreateOrUpdate } from "@/lib/jotai/util"
import type { OmitId } from "@/utils/idType"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { count } from "@/utils/array"
import { COLORS } from "@/utils/pcss"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"
import { addSetOp, deleteSetOp } from "@/utils/set"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { applyDiff, decrement, increment } from "@/utils/counterMap"
import { addListMap, deleteListMap } from "@/utils/listMap"

type Page = string

// route name cache
export const routeNamesCache = atom(new Set<string>())
export const nodeIdRouteIdCache = atom(new Map<NodeId, RouteId[]>())
export const nodeIdCountCache = atom(new Map<NodeId, number>())
export const routePageCache = atom(new Map<Page, Set<RouteId>>())

// atoms
export const routeIdsAtom = atomSet<RouteId>([])
routeIdsAtom.debugLabel = "routeIdsAtom"

const _primitiveRouteAtom = atomWithId<PrimitiveRoute>("primitiveRouteAtom")
export const primitiveRouteAtom = wrapAtomFamily(_primitiveRouteAtom, {
  write: (
    id,
    get,
    set,
    param: CreateOrUpdate<
      PartialDict<StripeSymbol<PrimitiveRoute>, "name" | "color">,
      SetStateAction<OmitId<StripeSymbol<PrimitiveRoute>>>
    >,
  ) => {
    if (param.create != null) {
      // 作成
      const getDefaultName = () => `シナリオ${get(routeIdsAtom).size + 1}`
      const getColor = () => get(routeColorCache)

      const name =
        param.create.name == null || param.create.name.length === 0
          ? getDefaultName()
          : param.create.name

      const route = buildPrimitiveRoute(id, {
        ...param.create,
        color: param.create.color ?? getColor(),
        name,
      })

      _primitiveRouteAtom(id, route)
      set(routeIdsAtom, addSetOp(id))

      // Cache
      set(routeNamesCache, addSetOp(name))
      // Cache
      set(nodeIdRouteIdCache, (prev) => {
        const newMap = new Map(prev)
        route.path.forEach((nodeId) => {
          newMap.set(nodeId, [...(newMap.get(nodeId) ?? []), id])
        })
        return newMap
      })
      // Cache
      set(nodeIdCountCache, increment(route.path))
      // Cache
      set(routePageCache, addListMap(route.page, [id]))
    } else {
      // 更新
      set(_primitiveRouteAtom(id), (prevValue) => {
        const newRoute = buildPrimitiveRoute(
          id,
          applyUpdate(param.update, prevValue),
        )

        // Cache
        if (newRoute.name !== prevValue.name) {
          set(routeNamesCache, (prev) => {
            const newSet = new Set(prev)
            newSet.delete(prevValue.name)
            newSet.add(newRoute.name)
            return newSet
          })
        }
        // Cache
        set(nodeIdRouteIdCache, (prev) => {
          const newMap = new Map(prev)
          prevValue.path.forEach((nodeId) => {
            const routeIds = newMap.get(nodeId)
            if (routeIds != null) {
              newMap.set(
                nodeId,
                routeIds.filter((routeId) => routeId !== id),
              )
            }
          })
          newRoute.path.forEach((nodeId) => {
            newMap.set(nodeId, [...(newMap.get(nodeId) ?? []), id])
          })
          return newMap
        })
        // Cache
        set(
          nodeIdCountCache,
          applyDiff(prevValue.path, newRoute.path, {
            whenZero: (nodeId) => {
              set(nodeIdsAtom, deleteSetOp(nodeId))
              set(primitiveNodeAtom.removeAtom, nodeId)
            },
          }),
        )

        return newRoute
      })
    }
  },
  onRemove: (get, set, { id: routeId }) => {
    const route = get(_primitiveRouteAtom(routeId))
    // Cache
    set(routeNamesCache, (prev) => {
      const newSet = new Set(prev)
      newSet.delete(route.name)
      return newSet
    })
    // Cache
    set(nodeIdRouteIdCache, (prev) => {
      const newMap = new Map(prev)
      route.path.forEach((nodeId) => {
        const routeIds = newMap.get(nodeId)
        if (routeIds != null) {
          const ids = routeIds.filter((routeId) => routeId !== routeId)
          if (0 < ids.length) {
            newMap.set(nodeId, ids)
          } else {
            newMap.delete(nodeId)
          }
        }
      })
      return newMap
    })
    // Cache
    set(
      nodeIdCountCache,
      decrement(route.path, {
        whenZero: (nodeId) => {
          set(nodeIdsAtom, deleteSetOp(nodeId))
          set(primitiveNodeAtom.removeAtom, nodeId)
        },
      }),
    )
    // Cache
    set(routePageCache, deleteListMap(route.page, [routeId]))
  },
})

// selectors
export const routeAtom = atomFamily<RouteId, Atom<Route>>((id: RouteId) => {
  const newAtom = atom((get) => {
    const { variables, path, ...primitiveRoute } = get(primitiveRouteAtom(id))

    return {
      ...primitiveRoute,
      path: path.map((nodeId) => get(nodeAtom(nodeId))),
      variables: variables.map(({ id: variableId, value }) => ({
        variable: get(variableAtom(variableId)),
        value,
      })),
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
