import { toNodeId } from "./node.util"

import type { Expression } from "../value/expression"
import type { Node, PrimitiveNode } from "./node"

export const genPrimitiveNode = (
  id: string,
  params?: Partial<PrimitiveNode>,
): PrimitiveNode => ({
  id: toNodeId(id),
  actionInstances: [],
  name: "node",
  ...params,
  config: {
    condition: "true" as Expression,
    ...params?.config,
    loop: {
      ...params?.config?.loop,
      times: 0,
    },
  },
})

export const genNode = (id: string, params?: Partial<Node>): Node => ({
  id: toNodeId(id),
  actionInstances: [],
  name: "node",
  ...params,
  config: {
    condition: "true" as Expression,
    ...params?.config,
    loop: {
      ...params?.config?.loop,
      times: 0,
    },
  },
})
