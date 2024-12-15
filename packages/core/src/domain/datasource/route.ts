import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  buildPrimitiveRoute,
  type PrimitiveRoute,
  type Route,
  type RouteId,
} from "../entity/route/route"

import { nodeAtom } from "./node"

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
import { addSetOp } from "@/utils/set"
import { applyUpdate } from "@/ui/utils/applyUpdate"

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

      _primitiveRouteAtom(
        id,
        buildPrimitiveRoute(id, {
          ...param.create,
          color: param.create.color ?? getColor(),
          name:
            param.create.name == null || param.create.name.length === 0
              ? getDefaultName()
              : param.create.name,
        }),
      )
      set(routeIdsAtom, addSetOp(id))
    } else {
      // 更新
      set(_primitiveRouteAtom(id), (prevValue) =>
        buildPrimitiveRoute(id, applyUpdate(param.update, prevValue)),
      )
    }
  },
})

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
