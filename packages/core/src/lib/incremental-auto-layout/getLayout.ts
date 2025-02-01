import { graphlib, layout } from "@dagrejs/dagre"
import { dedupe } from "@scenario-flow/util/lib"

type Pos = {
  x: number
  y: number
}

export const getLayout = (
  baseNodeId: string,
  nodeSize: Map<string, { width: number; height: number }>,
  conns: [string, string][],
): { node: Map<string, Pos>; edge: Map<string, Pos[]> } => {
  if (conns.length === 0) {
    return { node: new Map(), edge: new Map() }
  }

  const graph = new graphlib.Graph()
  graph.setGraph({
    nodesep: 100,
    ranksep: 100,
  })
  graph.setDefaultEdgeLabel(function () {
    return {}
  })

  dedupe(conns.flat()).forEach((node) => {
    graph.setNode(
      node,
      nodeSize.get(node) ?? {
        width: 240,
        height: node === baseNodeId ? 76 : 140,
      },
    )
  })

  conns.forEach(([source, target]) => {
    graph.setEdge(source, target)
  })

  layout(graph)

  const basePos = graph.node(baseNodeId)

  const nodeMap = graph.nodes().reduce((map, nodeId) => {
    const node = graph.node(nodeId)
    map.set(nodeId, {
      x: node.x - (nodeSize.get(nodeId)?.width ?? 240) / 2 - basePos.x,
      y: node.y - (nodeSize.get(nodeId)?.height ?? 76) / 2 - basePos.y,
    })
    return map
  }, new Map<string, Pos>())

  const edgeMap = graph.edges().reduce((map, edge) => {
    const points = graph.edge(edge).points
    map.set(
      `${edge.v}-${edge.w}`,
      points.map(({ x, y }) => ({ x: x, y: y })),
    )
    return map
  }, new Map<string, Pos[]>())

  return { node: nodeMap, edge: edgeMap }
}
