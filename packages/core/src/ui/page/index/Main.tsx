import React, { useState } from "react"

import { BlockMenu } from "./BlockMenu"
import { Settings } from "./Settings"
import { Sidebar } from "./Sidebar"

import { ErrorBoundary } from "@/ui/components/ErrorBoundary"
import { ErrorDisplay } from "@/ui/components/ErrorDisplay"
import { Code } from "@/ui/lib/code"
import { Flow } from "@/ui/lib/flow"

export type PageContent = "flow" | "code" | "settings"

export const Main = () => {
  const [content, setContent] = useState<PageContent>("flow")
  return (
    <div className="flex h-dvh w-dvw">
      <div className="h-dvh w-[60px] shrink-0 border-r border-slate-200">
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <Sidebar current={content} onChangeContent={setContent} />
        </ErrorBoundary>
      </div>
      {content === "flow" ? (
        <>
          <div className="h-dvh w-[240px] shrink-0 border-r border-slate-200">
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <BlockMenu />
            </ErrorBoundary>
          </div>
          <div className="relative grow">
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <Flow />
            </ErrorBoundary>
          </div>
        </>
      ) : content === "code" ? (
        <div className="relative grow">
          <Code />
        </div>
      ) : (
        <div className="relative grow">
          <Settings />
        </div>
      )}
    </div>
  )
}
