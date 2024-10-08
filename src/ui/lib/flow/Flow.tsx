import "@xyflow/react/dist/style.css"
import "./flow.css"

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  SelectionMode,
} from "@xyflow/react"
import { useMemo } from "react"

import { BasicEdge } from "./edges/BasicEdge"
import { StartNode } from "./nodes/StartNode"
import { ApiCallNode } from "./nodes/ApiCallNode"
import { RoutePanel } from "./components/RoutePanel"
import { DetailPanel } from "./components/DetailPanel"

import type { EdgeTypes, NodeTypes } from "@xyflow/react"

import { useEdges, useNodeIds } from "@/ui/adapter/query"
import { toNodeId } from "@/domain/entity/node/node.util"
import { getLayout } from "@/lib/incremental-auto-layout/getLayout"
import { ErrorBoundary } from "@/ui/functional-components/ErrorBoundary"
import { ErrorDisplay } from "@/ui/functional-components/ErrorDisplay"
import { nonNull } from "@/utils/assert"

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  // @ts-expect-error よくわからないエラー
  generalNode: ApiCallNode,
}

const edgeTypes: EdgeTypes = {
  basicEdge: BasicEdge,
}

const initialNodeId = toNodeId("start")

export const Flow = () => {
  const nodeIds = useNodeIds()
  const edges = useEdges(initialNodeId)

  const layout = useMemo(
    () =>
      getLayout(
        initialNodeId,
        edges.map(({ source, target }) => [source, target]),
      ),
    [edges],
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={[
          {
            id: initialNodeId,
            type: "startNode",
            position: { x: 0, y: 0 },
            data: {},
          },
          ...nodeIds
            .map((nodeId) => {
              const position = layout.get(nodeId)
              if (position == null) {
                return null
              }
              return {
                id: nodeId,
                type: "generalNode",
                position,
                data: {
                  nodeId,
                },
              }
            })
            .filter(nonNull),
        ]}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[16, 16]}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        panOnScrollSpeed={1.5}
      >
        <Controls />
        <MiniMap />
        <Background
          variant={BackgroundVariant.Lines}
          color="#F7F7F7"
          gap={12}
          size={1}
        />
      </ReactFlow>
      <ErrorBoundary fallback={<ErrorDisplay />}>
        <div className="absolute left-2 top-2 w-[240px]">
          <RoutePanel />
        </div>
      </ErrorBoundary>
      <ErrorBoundary fallback={<ErrorDisplay />}>
        <div className="absolute bottom-0 right-0 top-0 w-[400px] overflow-hidden border-0 border-l border-l-slate-200 bg-white">
          <DetailPanel />
        </div>
      </ErrorBoundary>
    </div>
  )
}
