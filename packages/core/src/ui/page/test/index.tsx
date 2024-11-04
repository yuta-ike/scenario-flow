import React from "react"

import { getDynamicLayout } from "@/lib/incremental-auto-layout"

export const TestPage = () => {
  const layout = getDynamicLayout([
    { from: "1", to: "2" },
    { from: "1", to: "3" },
    { from: "1", to: "4" },
    { from: "2", to: "5" },
    { from: "3", to: "6" },
    { from: "3", to: "7" },
    { from: "3", to: "8" },
    { from: "3", to: "9" },
  ])
  return <div>index</div>
}
