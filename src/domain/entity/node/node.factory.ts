import {
  buildNode,
  buildPrimitiveNode,
  type Node,
  type PrimitiveNode,
} from "./node"

import type { BuilderParams, StripeSymbol } from "../type"
import type { Expression } from "../value/expression"

export const genPrimitiveNode = (
  id: string,
  params?: Partial<StripeSymbol<PrimitiveNode>>,
): PrimitiveNode =>
  buildPrimitiveNode(id, {
    name: "node",
    actionInstances: [],
    ...params,
    config: {
      condition: "true" as Expression,
      ...params?.config,
      loop: {
        ...params?.config?.loop,
        times: 0,
      },
    },
  } satisfies BuilderParams<Omit<PrimitiveNode, "id">>)

export const genNode = (id: string, params?: Partial<Node>): Node =>
  buildNode(id, {
    name: "node",
    actionInstances: [],
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
