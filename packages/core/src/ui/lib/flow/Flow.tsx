import "@xyflow/react/dist/style.css"
import "./flow.css"

import { useCallback, useMemo, useState } from "react"
import { atom, useAtomValue } from "jotai"
import { useAtomCallback } from "jotai/utils"
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { BasicEdge } from "./edges/BasicEdge"
import { StartNode } from "./nodes/StartNode"
import { ApiCallNode } from "./nodes/ApiCallNode"
import { RoutePanel } from "./components/RoutePanel"
import { PagePanel } from "./components/PagePanel"
import { getEdges } from "./utils/getEdges"
import { DetailPanel } from "./components/DetailPanel"
import { RunButton } from "./components/RunButton"
import { FlowProvider } from "./FlowProvider"
import { ListView, ListViewOpenButton, showListViewAtom } from "./ListView"
import { NodePanel } from "./components/NodePanel/NodePanel"

import type { NodeId } from "@/domain/entity/node/node"

import { toNodeId } from "@/domain/entity/node/node.util"
import { getLayout } from "@/lib/incremental-auto-layout/getLayout"
import { ErrorBoundary } from "@/ui/components/ErrorBoundary"
import { ErrorDisplay } from "@/ui/components/ErrorDisplay"
import { useReleaseHighlight } from "@/ui/state/highlightedNodeId"
import { connectNodes } from "@/ui/adapter/command"
import { useMapState } from "@/ui/utils/useMapState"
import { useSwitchFocusedRouteId } from "@/ui/state/focusedRouteId"
import { currentPageAtom } from "@/ui/state/page"
import { primitiveRoutesAtom } from "@/domain/datasource/route"
import { uniq } from "@/utils/array"
import { nonNull } from "@/utils/assert"
import { useFocusedNodeExists } from "@/ui/state/focusedNodeId"

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  // @ts-expect-error よくわからないエラー
  generalNode: ApiCallNode,
}

const edgeTypes: EdgeTypes = {
  basicEdge: BasicEdge,
}

const initialNodeId = toNodeId("$root")

const currentPageRoutes = atom((get) => {
  const page = get(currentPageAtom)
  return get(primitiveRoutesAtom).filter((route) => route.page === page)
})
export const Flow = () => {
  const [reactFlow, setReactFlow] = useState<ReactFlowInstance | null>(null)
  const [nodeSize, { updateItem }] = useMapState<{
    width: number
    height: number
  }>()

  const routes = useAtomValue(currentPageRoutes)
  const edges = useMemo(() => getEdges(routes, initialNodeId), [routes])

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

  const nodeIds = useMemo(
    () => uniq(routes.flatMap((route) => route.path)),
    [routes],
  )

  const switchFocusedRouteId = useSwitchFocusedRouteId()

  useReleaseHighlight()

  const handleConnect = useAtomCallback(
    useCallback((get, _, connection: Connection) => {
      connectNodes(
        connection.source as NodeId,
        connection.target as NodeId,
        get(currentPageAtom),
      )
    }, []),
  )

  const showListView = useAtomValue(showListViewAtom)
  const showDetailPanel = useFocusedNodeExists()

  return (
    <FlowProvider reactFlow={reactFlow} updateNodeSize={updateItem}>
      <PanelGroup direction="horizontal" className="flex h-full w-full">
        <Panel id="sidebar" order={1} defaultSize={15} minSize={5}>
          <div className="z-10 flex h-full w-full shrink-0 flex-col gap-4 border-r border-r-slate-200 bg-white">
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <PagePanel />
            </ErrorBoundary>
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <RoutePanel />
            </ErrorBoundary>
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <NodePanel />
            </ErrorBoundary>
          </div>
        </Panel>
        <PanelResizeHandle />
        <Panel id="flowview" order={2} defaultSize={45} minSize={5}>
          <div className="relative h-full w-full grow">
            {showListView ? (
              <div className="absolute inset-y-0 left-0 z-10 h-full w-[500px] max-w-full grow border-r border-r-slate-200 bg-white empty:hidden">
                <ListView />
              </div>
            ) : (
              <div className="absolute left-2 top-2 z-10">
                <ListViewOpenButton />
              </div>
            )}
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
              defaultViewport={{
                zoom: 1,
                x: window.innerWidth / 2 - 120,
                y: 100,
              }}
              onConnect={handleConnect}
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
          </div>
        </Panel>
        {showDetailPanel && (
          <>
            <PanelResizeHandle />
            <Panel defaultSize={25} minSize={5} order={3}>
              <ErrorBoundary fallback={<ErrorDisplay />}>
                <div className="z-10 h-full w-full shrink-0 overflow-hidden overflow-y-auto border-0 border-l border-l-slate-200">
                  <DetailPanel />
                </div>
              </ErrorBoundary>
            </Panel>
          </>
        )}
      </PanelGroup>
    </FlowProvider>
  )
}
