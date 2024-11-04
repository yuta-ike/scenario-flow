import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import {
  getRecentlyResult,
  type NodeStates,
} from "../entity/nodeStates/nodeStates"

import { routeAtom } from "./route"

import type { NodeId } from "../entity/node/node"

export const nodeStatesAtom = atomFamily((nodeId: NodeId) => {
  const newAtom = atom<NodeStates>({ results: [] })
  newAtom.debugLabel = `nodeStates(${nodeId})`
  return newAtom
})

export const latestResolvedNodeRunResultAtom = atomFamily((nodeId: NodeId) => {
  const newAtom = atom((get) => {
    const result = getRecentlyResult(get(nodeStatesAtom(nodeId)))
    if (result == null) {
      return null
    }
    if (!("results" in result)) {
      return result
    } else {
      return {
        ...result,
        results: result.results.map(({ routeId, ...rest }) => ({
          routeId,
          route: get(routeAtom(routeId)),
          ...rest,
        })),
      }
    }
  })
  newAtom.debugLabel = `nodeStates(${nodeId})`
  return newAtom
})
