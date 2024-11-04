import { createContext, useContext } from "react"

import type { ProjectEntry } from "@/injector/injector"

type ProjectEntryContextType = {
  projectEntry: ProjectEntry
}

const ProjectEntryContext = createContext<ProjectEntryContextType | null>(null)

type Props = {
  value: ProjectEntry
  children: React.ReactNode
}

export const ProjectEntryProvider = ({ value, children }: Props) => {
  return (
    <ProjectEntryContext.Provider value={{ projectEntry: value }}>
      {children}
    </ProjectEntryContext.Provider>
  )
}

export const useProjectEntry = () => {
  const context = useContext(ProjectEntryContext)
  if (context == null) {
    throw new Error()
  }
  return context.projectEntry
}
