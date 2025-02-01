import { Empty } from "@scenario-flow/util"
import { NodeId } from "../../../domain/entity"

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

export type CreateNode = {
  id: string
  type: "createNode"
  position: { x: number; y: number }
  data: {
    nodeId: NodeId
    originalNodeId: NodeId
  }
}

export type UiNode = GeneralUiNode | StartUiNode | CreateNode

export type UiEdgeType = "basicEdge"

export type UiEdge = {
  id: string
  type: UiEdgeType
  source: string
  target: string
}
