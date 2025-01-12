import {
  buildNode,
  buildPrimitiveNode,
  type Node,
  type PrimitiveNode,
} from "./node"

import type { BuilderParams, StripeSymbol } from "../type"

export const genPrimitiveNode = (
  id: string,
  params?: Partial<StripeSymbol<PrimitiveNode>>,
): PrimitiveNode =>
  buildPrimitiveNode(id, {
    name: "node",
    description: "",
    actionInstances: [],
    ...params,
    config: {
      ...params?.config,
    },
  } satisfies BuilderParams<Omit<PrimitiveNode, "id">>)

export const genNode = (id: string, params?: Partial<Node>): Node =>
  buildNode(id, {
    name: "node",
    description: "",
    actionInstances: [],
    ...params,
    config: {
      ...params?.config,
    },
  })
