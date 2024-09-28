/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { stratify, tree } from "d3-hierarchy"

import type { HierarchyNode } from "d3-hierarchy"

type Conn = [string, string]

const stratifyFun = stratify()
const treeLayout = tree()
  .nodeSize([240 + 10, 114 + 80])
  .separation((a, b) => (a.parent === b.parent ? 1.2 : 1.4))

export const getLayout = (
  rootNodeId: string,
  conns: Conn[],
): Map<string, Pos> => {
  if (conns.length === 0) {
    return new Map()
  }
  const input = [
    { id: rootNodeId },
    ...conns.map(([source, target]) => ({
      id: target,
      parentId: source,
    })),
  ]
  const node = stratifyFun(input)
  const layouted = treeLayout(node)
  const positions = getPosRec(layouted)
  return positions
}

type Pos = {
  x: number
  y: number
}

const getPosRec = (
  tree: HierarchyNode<unknown>,
  acc = new Map<string, Pos>(),
) => {
  const pos = {
    x: tree.x!,
    y: tree.y!,
  } satisfies Pos

  acc.set(tree.id!, pos)
  tree.children?.forEach((child) => {
    getPosRec(child, acc)
  })
  return acc
}
