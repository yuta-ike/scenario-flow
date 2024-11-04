import type { Empty } from "@/utils/typeUtil"
import type { NodeId } from "@/domain/entity/node/node"

export type UiNodeType = "generalNode" | "startNode"

export type GeneralUiNode = {
  id: string
  type: "generalNode"
  position: { x: number; y: number }
  data: {
    nodeId: NodeId
  }
}

export type StartUiNode = {
  id: string
  type: "startNode"
  position: { x: number; y: number }
  data: Empty
}

export type UiNode = GeneralUiNode | StartUiNode

export type UiEdgeType = "basicEdge"

export type UiEdge = {
  id: string
  type: UiEdgeType
  source: string
  target: string
}
