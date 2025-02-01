import "@xyflow/react/dist/style.css"
import "./flow.css"

import { memo, useCallback, useMemo, useState } from "react"
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
import { Resizable } from "re-resizable"

import { BasicEdge } from "./edges/BasicEdge"
import { StartNode } from "./nodes/StartNode"
import { ApiCallNode } from "./nodes/ApiCallNode"
import { RoutePanel } from "./components/RoutePanel"
import { PagePanel } from "./components/PagePanel"
import { getEdges } from "./utils/getEdges"
import { DetailPanel } from "./components/DetailPanel"
import { RunButton } from "./components/RunButton"
import { FlowProvider } from "./FlowProvider"
import { ListViewOpenButton } from "./ListView"
import { NodePanel } from "./components/NodePanel/NodePanel"
import { CreateNode } from "./nodes/CreateNode"
import { SkleltonEdge } from "./edges/SkeltonEdge"
import { useShowListView } from "./ListView/showListViewAtom"

import { ErrorBoundary, ErrorDisplay } from "@scenario-flow/ui"
import { uniq, nonNull, useMapState } from "@scenario-flow/util"
import { useStore } from "../provider"
import { primitiveRoutesAtom } from "../../../domain/datasource/route"
import { toNodeId, NodeId } from "../../../domain/entity"
import { getLayout } from "../../../lib/incremental-auto-layout/getLayout"
import { connectNodes } from "../../adapter/command"
import { useFocusedNodeExists } from "../../state/focusedNodeId"
import { useSwitchFocusedRouteId } from "../../state/focusedRouteId"
import { useReleaseHighlight } from "../../state/highlightedNodeId"
import { currentPageAtom } from "../../state/page"

const nodeTypes: NodeTypes = {
  startNode: StartNode,
  // @ts-expect-error よくわからないエラー
  generalNode: ApiCallNode,
  // @ts-expect-error よくわからないエラー
  createNode: CreateNode,
}

const edgeTypes: EdgeTypes = {
  basicEdge: BasicEdge,
  skeltonEdge: SkleltonEdge,
}

const initialNodeId = toNodeId("$root")

const currentPageRoutes = atom((get) => {
  const page = get(currentPageAtom)
  return get(primitiveRoutesAtom).filter((route) => route.page === page)
})
export const Flow = memo(() => {
  const store = useStore()
  const [reactFlow, setReactFlow] = useState<ReactFlowInstance | null>(null)
  const [nodeSize, { updateItem }] = useMapState<{
    width: number
    height: number
  }>()

  const routes = useAtomValue(currentPageRoutes, { store: store.store })
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
  const virtualNodeIds = useMemo(
    () => routes.map((route) => route.path.at(-1)).filter(nonNull),
    [routes],
  )

  const switchFocusedRouteId = useSwitchFocusedRouteId()

  useReleaseHighlight()

  const handleConnect = useAtomCallback(
    useCallback((get, _, connection: Connection) => {
      connectNodes(
        store,
        connection.source as NodeId,
        connection.target as NodeId,
        get(currentPageAtom),
      )
    }, []),
    { store: store.store },
  )

  const showDetailPanel = useFocusedNodeExists()

  return (
    <FlowProvider reactFlow={reactFlow} updateNodeSize={updateItem}>
      <div className="absolute inset-0 h-full w-full grow">
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
            ...virtualNodeIds
              .map((originalNodeId) => {
                const nodeId = `${originalNodeId}_virtual`
                const position = layout?.node.get(nodeId)
                if (position == null) {
                  return null
                }
                return {
                  id: nodeId,
                  type: "createNode",
                  position,
                  data: {
                    originalNodeId,
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
      <div className="absolute inset-y-0 left-0">
        {/* Left Panel */}
        <Resizable defaultSize={{ width: 300, height: "100%" }} minWidth={200}>
          <div className="flex h-full w-full flex-col gap-4 border-r border-r-slate-200 bg-white">
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
        </Resizable>

        {/* Left Second Panel */}
        <div className="absolute left-full top-0 flex h-max flex-col p-2">
          <ListViewOpenButton />
        </div>
      </div>
      {/* Right Panel */}
      {showDetailPanel && (
        <div className="absolute inset-y-0 right-0">
          <Resizable
            defaultSize={{ width: 400, height: "100%" }}
            minWidth={350}
          >
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <div className="z-10 h-full w-full shrink-0 overflow-hidden overflow-y-auto border-0 border-l border-l-slate-200 bg-white">
                <DetailPanel />
              </div>
            </ErrorBoundary>
          </Resizable>
        </div>
      )}
    </FlowProvider>
  )
})
