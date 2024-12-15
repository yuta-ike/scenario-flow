import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { atomFamily, useAtomCallback } from "jotai/utils"
import { useCallback, useMemo } from "react"

import { routeIdsBetweenAtom } from "../adapter/query"

import type { SetStateAction } from "jotai"
import type { RouteId } from "@/domain/entity/route/route"
import type { NodeId } from "@/domain/entity/node/node"

import { primitiveRouteAtom, routeAtom } from "@/domain/datasource/route"

const focusedRouteIdAtom = atom<RouteId | null>(null)
export const useFocusedRouteId = () => useAtomValue(focusedRouteIdAtom)
const isFocusedRouteAtom = atomFamily((routeId: RouteId) =>
  atom(
    (get) => get(focusedRouteIdAtom) === routeId,
    (_, set, _newValue: SetStateAction<boolean>) => {
      set(focusedRouteIdAtom, (prevValue) => {
        const newValue =
          typeof _newValue === "function"
            ? _newValue(prevValue === routeId)
            : _newValue
        return newValue ? routeId : null
      })
    },
  ),
)
export const useIsFocusedRouteId = (routeId: RouteId) => {
  const [isFocused, setState] = useAtom(isFocusedRouteAtom(routeId))
  const toggle = useCallback(() => setState((prev) => !prev), [setState])
  const setTrue = useCallback(() => setState(true), [setState])
  const setFalse = useCallback(() => setState(false), [setState])
  return useMemo(
    () => ({ isFocused, toggle, setTrue, setFalse }),
    [isFocused, setFalse, setTrue, toggle],
  )
}

export const useSetFocuseRoute = () => {
  const focusRouteId = useSetAtom(focusedRouteIdAtom)
  return useCallback(
    (routeId: RouteId) => focusRouteId(routeId),
    [focusRouteId],
  )
}

const hasFocusedRouteAtom = atomFamily((routeIds: RouteId[]) =>
  atom((get) => routeIds.find((routeId) => get(isFocusedRouteAtom(routeId)))),
)
export const useHasFocusedRouteIdsValue = (routeIds: RouteId[]) =>
  useAtomValue(hasFocusedRouteAtom(routeIds))

const isNodeInFocusedRouteAtom = atomFamily((nodeId: NodeId) => {
  const newAtom = atom((get) => {
    const focusedRouteId = get(focusedRouteIdAtom)
    if (focusedRouteId == null) {
      return null
    }
    const route = get(primitiveRouteAtom(focusedRouteId))
    const isFocused = route.path.some((_nodeId) => _nodeId === nodeId)
    if (isFocused) {
      return route
    } else {
      return null
    }
  })
  newAtom.debugLabel = `isNodeInFocusedRoute(${nodeId})`
  return newAtom
})

export const useFocusedRouteByNodeId = (nodeId: NodeId) =>
  useAtomValue(isNodeInFocusedRouteAtom(nodeId))

export const useSwitchFocusedRouteId = () => {
  return useAtomCallback(
    useCallback((get, set, source: NodeId, target: NodeId) => {
      const currentFocusedRouteId = get(focusedRouteIdAtom)
      const routeIds = get(
        routeIdsBetweenAtom({
          source: source === "$root" ? null : source,
          target,
        }),
      )
      const index =
        currentFocusedRouteId == null
          ? -1
          : routeIds.indexOf(currentFocusedRouteId)

      const nextFocusedRouteID =
        index < 0 || routeIds.length === index + 1
          ? routeIds[0]
          : routeIds[index + 1]

      if (nextFocusedRouteID != null) {
        set(focusedRouteIdAtom, nextFocusedRouteID)
      }
    }, []),
  )
}

const focusedRouteAtom = atom((get) => {
  const routeId = get(focusedRouteIdAtom)
  if (routeId == null) {
    return null
  }
  return get(routeAtom(routeId))
})
focusedRouteAtom.debugLabel = "focusedRouteAtom"

export const useFocusedRoute = () => useAtomValue(focusedRouteAtom)
