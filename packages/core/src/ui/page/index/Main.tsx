import { useState } from "react"

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
    <div className="flex h-full">
      <div className="w-[60px] shrink-0">
        <ErrorBoundary fallback={<ErrorDisplay />}>
          <Sidebar current={content} onChangeContent={setContent} />
        </ErrorBoundary>
      </div>
      <div className="relative flex grow flex-col gap-4 overflow-hidden rounded-tl-lg border-l border-t border-slate-200 bg-white shadow-sm">
        {content === "flow" ? (
          <div className="relative h-full grow">
            <ErrorBoundary fallback={<ErrorDisplay />}>
              <Flow />
            </ErrorBoundary>
          </div>
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
    </div>
  )
}
