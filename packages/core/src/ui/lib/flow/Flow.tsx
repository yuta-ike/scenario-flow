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
import { useMemo, useState } from "react"

import { BasicEdge } from "./edges/BasicEdge"
import { StartNode } from "./nodes/StartNode"
import { ApiCallNode } from "./nodes/ApiCallNode"
import { RoutePanel } from "./components/RoutePanel"
import { DetailPanel } from "./components/DetailPanel"
import { FlowProvider } from "./FlowProvider"
import { RunButton } from "./components/RunButton"

import type { EdgeTypes, NodeTypes, ReactFlowInstance } from "@xyflow/react"
import type { NodeId } from "@/domain/entity/node/node"

import { useEdges, useNodeIds } from "@/ui/adapter/query"
import { toNodeId } from "@/domain/entity/node/node.util"
import { getLayout } from "@/lib/incremental-auto-layout/getLayout"
import { ErrorBoundary } from "@/ui/components/ErrorBoundary"
import { ErrorDisplay } from "@/ui/components/ErrorDisplay"
import { nonNull } from "@/utils/assert"
import { useReleaseHighlight } from "@/ui/state/highlightedNodeId"
import { connectNodes } from "@/ui/adapter/command"
import { useMapState } from "@/ui/utils/useMapState"
import { useSwitchFocusedRouteId } from "@/ui/state/focusedRouteId"

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  // @ts-expect-error よくわからないエラー
  generalNode: ApiCallNode,
}

const edgeTypes: EdgeTypes = {
  basicEdge: BasicEdge,
}

const initialNodeId = toNodeId("$root")

export const Flow = () => {
  const [reactFlow, setReactFlow] = useState<ReactFlowInstance | null>(null)
  const [nodeSize, { updateItem }] = useMapState<{
    width: number
    height: number
  }>()

  const nodeIds = useNodeIds()
  const edges = useEdges(initialNodeId)

  const layout = useMemo(() => {
    try {
      return getLayout(
        initialNodeId,
        nodeSize,
        edges.map(({ source, target }) => [source, target]),
      )
    } catch (e) {
      console.error(e)
      return undefined
    }
  }, [edges, nodeSize])

  const switchFocusedRouteId = useSwitchFocusedRouteId()

  useReleaseHighlight()

  return (
    <div className="flex h-full w-full">
      <FlowProvider reactFlow={reactFlow} updateNodeSize={updateItem}>
        <ReactFlow
          className="grow"
          onInit={setReactFlow}
          nodes={[
            {
              id: initialNodeId,
              type: "startNode",
              position: {
                x: layout?.node.get(initialNodeId)?.x ?? 0,
                y: layout?.node.get(initialNodeId)?.y ?? 0,
              },
              data: {},
            },
            ...nodeIds
              .map((nodeId) => {
                const position = layout?.node.get(nodeId)
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
          edges={useMemo(
            () =>
              edges.map((edge) => ({
                ...edge,
                data: {
                  points:
                    layout?.edge.get(`${edge.source}-${edge.target}`) ?? [],
                },
              })),
            [edges, layout?.edge],
          )}
          onConnect={(connection) =>
            connectNodes(
              connection.source as NodeId,
              connection.target as NodeId,
            )
          }
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid
          snapGrid={[16, 16]}
          panOnScroll
          selectionOnDrag
          panOnDrag={[1, 2]}
          selectionMode={SelectionMode.Partial}
          panOnScrollSpeed={1.5}
          onEdgesChange={(changes) => {
            const selectChange = changes.findLast(
              ({ type }) => type === "select",
            )
            if (selectChange?.type === "select" && selectChange.selected) {
              const [source, target] = selectChange.id.split("-")
              if (source == null || target == null) {
                return
              }
              switchFocusedRouteId(source as NodeId, target as NodeId)
            }
          }}
        >
          <Controls />
          <MiniMap />
          <Background
            variant={BackgroundVariant.Lines}
            color="#F7F7F7"
            gap={12}
            size={1}
          />
          <ErrorBoundary fallback={null}>
            <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
              <RunButton />
            </div>
          </ErrorBoundary>
        </ReactFlow>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <div className="absolute left-2 top-2 w-[240px]">
            <RoutePanel />
          </div>
        </ErrorBoundary>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <div className="z-10 max-w-[600px] shrink-0 overflow-hidden">
            <DetailPanel />
          </div>
        </ErrorBoundary>
      </FlowProvider>
    </div>
  )
}
