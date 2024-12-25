import React from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { NodePanel } from "./components/NodePanel/NodePanel"
import { PagePanel } from "./components/PagePanel"
import { RoutePanel } from "./components/RoutePanel"
import { DetailPanel } from "./components/DetailPanel"
import { ListView } from "./ListView"

import { ErrorDisplay } from "@/ui/components/ErrorDisplay"
import { ErrorBoundary } from "@/ui/components/ErrorBoundary"

export const List = () => {
  return (
    <PanelGroup direction="horizontal" className="relative">
      {/* Left Panel */}
      <Panel
        defaultSize={25}
        className="flex h-full w-full flex-col gap-4 border-r border-r-slate-200 bg-white"
      >
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <PagePanel />
        </ErrorBoundary>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <RoutePanel />
        </ErrorBoundary>
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <NodePanel />
        </ErrorBoundary>
      </Panel>
      <PanelResizeHandle />
      <Panel
        defaultSize={55}
        className="h-full w-full border-r border-r-slate-200"
      >
        <ListView />
      </Panel>
      <PanelResizeHandle />
      <Panel
        defaultSize={30}
        className="h-full w-full shrink-0 overflow-hidden overflow-y-auto border-0 border-l border-l-slate-200 bg-white"
      >
        <DetailPanel />
      </Panel>
    </PanelGroup>
  )
}
