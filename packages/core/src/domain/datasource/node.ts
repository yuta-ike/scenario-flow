import { atom } from "jotai"
import { atomFamily } from "jotai/utils"

import { resolveActionInstance } from "../selector/resolveActionInstance"
import {
  type PrimitiveNode,
  type Node,
  type NodeId,
  buildPrimitiveNode,
} from "../entity/node/node"
import { getUserDefinedActionIdOrNull } from "../entity/action/identifier"

import {
  userDefinedActionAtom,
  userDefinedActionIdsAtom,
} from "./userDefinedAction"

import type { StripeSymbol } from "../entity/type"
import type { Atom } from "jotai"
import type { OmitId } from "@/utils/idType"
import type { CreateOrUpdate } from "@/lib/jotai/util"
import type { UserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction"

import { atomWithId } from "@/lib/jotai/atomWithId"
import { atomSet } from "@/lib/jotai/atomSet"
import { addSetOp, deleteSetOp, updateSetOp } from "@/utils/set"
import { wrapAtomFamily } from "@/lib/jotai/wrapAtomFamily"
import { applyDiff, decrement, increment } from "@/utils/counterMap"
import { nonNull } from "@/utils/assert"

// cache
export const nodeNameUniqCache = atomSet<string>([])
nodeNameUniqCache.debugLabel = "nodeNameUniqCache"

export const nodeDefaultNameCal = atom((get) => {
  const nodeCount = get(nodeIdsAtom).size
  return `ブロック ${nodeCount + 1}`
})
nodeDefaultNameCal.debugLabel = "nodeDefaultNameCal"

// cache
export const actionIdCountCache = atom<Map<UserDefinedActionId, number>>(
  new Map(),
)

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
    _,
    set,
    param: CreateOrUpdate<
      StripeSymbol<PrimitiveNode>,
      StripeSymbol<OmitId<PrimitiveNode>>
    >,
  ) => {
    if (param.create != null) {
      // 作成
      const node = buildPrimitiveNode(nodeId, param.create)
      _primitiveNodeAtom(nodeId, node)
      set(
        nodeIdsAtom,
        updateSetOp((prev) => [...prev, nodeId]),
      )

      // cache
      set(nodeNameUniqCache, addSetOp(param.create.name))
      // cache
      set(
        actionIdCountCache,
        increment(
          node.actionInstances
            .map((ai) => getUserDefinedActionIdOrNull(ai.actionIdentifier))
            .filter(nonNull),
        ),
      )
    } else {
      // 更新
      set(_primitiveNodeAtom(nodeId), (prev) => {
        const node = {
          ...prev,
          ...param.update,
        } as PrimitiveNode

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
        // cache
        set(
          actionIdCountCache,
          applyDiff(
            prev.actionInstances
              .map((ai) => getUserDefinedActionIdOrNull(ai.actionIdentifier))
              .filter(nonNull),
            node.actionInstances
              .map((ai) => getUserDefinedActionIdOrNull(ai.actionIdentifier))
              .filter(nonNull),
            {
              whenZero: (key) => {
                set(userDefinedActionIdsAtom, deleteSetOp(key))
                set(userDefinedActionAtom.removeAtom, key)
              },
            },
          ),
        )

        return node
      })
    }
  },
  onRemove: (_, set, { value: node }) => {
    // cache
    set(
      nodeNameUniqCache,
      updateSetOp((prevSet) => {
        const newSet = new Set(prevSet)
        newSet.delete(node.name)
        return newSet
      }),
    )
    // cache
    set(
      actionIdCountCache,
      decrement(
        node.actionInstances
          .map((ai) => getUserDefinedActionIdOrNull(ai.actionIdentifier))
          .filter(nonNull),
        {
          whenZero: (key) => {
            set(userDefinedActionIdsAtom, deleteSetOp(key))
            set(userDefinedActionAtom.removeAtom, key)
          },
        },
      ),
    )
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
