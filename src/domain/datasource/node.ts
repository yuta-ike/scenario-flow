import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { resolveActionInstance } from "../selector/resolveActionInstance"

import type { PrimitiveNode, Node, NodeId } from "../entity/node/node"
import type { Atom } from "jotai"
import type { OmitId } from "@/utils/idType"
import type { CreateOrUpdate } from "@/lib/jotai/util"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { updateSetOp } from "@/utils/set"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"

// cache
export const nodeNameUniqCache = atomSet<string>([])
nodeNameUniqCache.debugLabel = "nodeNameUniqCache"

export const nodeDefaultNameCal = atom((get) => {
  const nodeCount = get(nodeIdsAtom).size
  return `ブロック ${nodeCount + 1}`
})

// primitive atom
export const _primitiveNodeAtom = atomWithId<PrimitiveNode>(
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
    _,
    set,
    param: CreateOrUpdate<PrimitiveNode, OmitId<PrimitiveNode>>,
  ) => {
    console.log("PRIMITIVENODE!!!!!!!!!")
    if (param.update != null) {
      // 更新
      set(_primitiveNodeAtom(nodeId), (prev) => {
        console.log(prev, param.update)
        return {
          ...prev,
          ...param.update,
        }
      })
    } else {
      // 作成
      _primitiveNodeAtom(nodeId, param.create)
      set(
        nodeIdsAtom,
        updateSetOp((prev) => [...prev, nodeId]),
      )
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
