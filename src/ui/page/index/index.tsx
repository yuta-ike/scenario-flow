import { useState } from "react"

import { BlockMenu } from "./BlockMenu"
import { Sidebar } from "./Sidebar"
import { Settings } from "./Settings"

import { ErrorBoundary } from "@/ui/functional-components/ErrorBoundary"
import { ErrorDisplay } from "@/ui/functional-components/ErrorDisplay"
import { Flow } from "@/ui/lib/flow"
import { Code } from "@/ui/lib/code"

export type PageContent = "flow" | "code" | "settings"

export const IndexPage = () => {
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
