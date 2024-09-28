import { atom, useAtom, useAtomValue } from "jotai"
import { atomFamily } from "jotai/utils"
import { useCallback, useMemo } from "react"

import type { SetStateAction } from "jotai"
import type { RouteId } from "@/domain/entity/route/route"
import type { NodeId } from "@/domain/entity/node/node"

import { primitiveRouteAtom } from "@/domain/datasource/route"

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
