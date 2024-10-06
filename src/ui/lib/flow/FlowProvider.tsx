import { createContext, useContext } from "react"
import React from "react"

import type { ReactFlowInstance } from "@xyflow/react"

const FlowContext = createContext<ReactFlowInstance | null>(null)

type Props = {
  reactFlow: ReactFlowInstance | null
  children: React.ReactNode
}

export const FlowProvider = ({ children, reactFlow }: Props) => {
  return (
    <FlowContext.Provider value={reactFlow}>{children}</FlowContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReactFlow = () => {
  const reactFlow = useContext(FlowContext)
  return reactFlow
}
