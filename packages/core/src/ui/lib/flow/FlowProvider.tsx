import { createContext, useContext, useMemo } from "react"
import React from "react"

import type { ReactFlowInstance } from "@xyflow/react"

const FlowContext = createContext<{
  reactFlow: ReactFlowInstance | null
  updateNodeSize: (id: string, size: { width: number; height: number }) => void
} | null>(null)

type Props = {
  reactFlow: ReactFlowInstance | null
  updateNodeSize: (id: string, size: { width: number; height: number }) => void
  children: React.ReactNode
}

export const FlowProvider = ({
  children,
  reactFlow,
  updateNodeSize,
}: Props) => {
  return (
    <FlowContext.Provider
      value={useMemo(
        () => ({ reactFlow, updateNodeSize }),
        [reactFlow, updateNodeSize],
      )}
    >
      {children}
    </FlowContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReactFlow = () => {
  const context = useContext(FlowContext)
  if (context == null) {
    throw new Error("useReactFlow must be used inside FlowProvider")
  }
  return context.reactFlow
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUpdateNodeSize = () => {
  const context = useContext(FlowContext)
  if (context == null) {
    throw new Error("useUpdateNodeSize must be used inside FlowProvider")
  }
  return context.updateNodeSize
}
