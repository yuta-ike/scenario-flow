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
import type { UserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction"

import {
  OmitId,
  updateSetOp,
  addSetOp,
  increment,
  nonNull,
  applyDiff,
  deleteSetOp,
  decrement,
} from "@scenario-flow/util"
import {
  atomSet,
  atomWithId,
  wrapAtomFamily,
  CreateOrUpdate,
} from "@scenario-flow/util/lib"

// cache
export const nodeNameUniqCache = atomSet<string>([])

export const nodeDefaultNameCal = atom((get) => {
  const nodeCount = get(nodeIdsAtom).size
  return `ブロック ${nodeCount + 1}`
})

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
          id: nodeId,
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

        console.log(node)
        return node
      })
    }
  },
  onRemove: (_, set, { value: node }) => {
    set(nodeIdsAtom, deleteSetOp(node.id))
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
  return new Set(ids.map((id) => get(primitiveNodeAtom(id)))).values().toArray()
})
nodesAtom.debugLabel = "nodesAtom"
