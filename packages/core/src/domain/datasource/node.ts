import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { resolveActionInstance } from "../selector/resolveActionInstance"
import {
  type PrimitiveNode,
  type Node,
  type NodeId,
  buildPrimitiveNode,
} from "../entity/node/node"

import type { StripeSymbol } from "../entity/type"
import type { Atom } from "jotai"
import type { OmitId } from "@/utils/idType"
import type { CreateOrUpdate } from "@/lib/jotai/util"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { addSetOp, updateSetOp } from "@/utils/set"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"

// cache
export const nodeNameUniqCache = atomSet<string>([])
nodeNameUniqCache.debugLabel = "nodeNameUniqCache"

export const nodeDefaultNameCal = atom((get) => {
  const nodeCount = get(nodeIdsAtom).size
  return `ブロック ${nodeCount + 1}`
})

// primitive atom
const _primitiveNodeAtom = atomWithId<PrimitiveNode>(
  "primitiveNodeAtom/private",
)

/**
 * NodeIdのリストを返す
 */
export const nodeIdsAtom = atomSet<NodeId>([])
nodeIdsAtom.debugLabel = "nodeIdsAtom"

export const primitiveNodeAtom = wrapAtomFamily(_primitiveNodeAtom, {
  write: (
    nodeId,
    get,
    set,
    param: CreateOrUpdate<
      StripeSymbol<PrimitiveNode>,
      StripeSymbol<OmitId<PrimitiveNode>>
    >,
  ) => {
    if (param.create != null) {
      // 作成
      _primitiveNodeAtom(
        nodeId,
        buildPrimitiveNode(
          nodeId,
          param.create,
          get(nodeNameUniqCache).values().toArray(),
        ),
      )
      set(
        nodeIdsAtom,
        updateSetOp((prev) => [...prev, nodeId]),
      )

      // cache
      set(nodeNameUniqCache, addSetOp(param.create.name))
    } else {
      // 更新
      set(_primitiveNodeAtom(nodeId), (prev) => {
        // cache
        if (prev.name !== param.update.name) {
          set(
            nodeNameUniqCache,
            updateSetOp((prevSet) => {
              const newSet = new Set(prevSet)
              newSet.delete(prev.name)
              newSet.add(param.update.name)
              return newSet
            }),
          )
        }

        return {
          ...prev,
          ...param.update,
        } as PrimitiveNode
      })
    }
  },
})

/**
 * PrimitiveNodeにactionInstanceを加えたNodeを返す
 */
export const nodeAtom = atomFamily<NodeId, Atom<Node>>((id: NodeId) => {
  const newAtom = atom((get) => {
    const primitiveNode = get(primitiveNodeAtom(id))

    const actionInstances = primitiveNode.actionInstances.map(
      (actionInstance) => resolveActionInstance(get, actionInstance),
    )

    return {
      ...primitiveNode,
      actionInstances,
    }
  })
  newAtom.debugLabel = `nodeAtom(${id})`
  return newAtom
})

/**
 * Nodeのリストを返す
 */
export const nodesAtom = atom((get) => {
  const ids = get(nodeIdsAtom).values()
  return new Set(ids.map((id) => get(primitiveNodeAtom(id))))
})
nodesAtom.debugLabel = "nodesAtom"
