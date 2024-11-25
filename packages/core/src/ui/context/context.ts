import { atom, useAtomValue } from "jotai"

import type { ProjectEntry } from "@/injector"
import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"

export type ProjectContext = {
  entry: ProjectEntry
  config: ConfigFormat
}

export const projectContextAtom = atom<ProjectContext>()
projectContextAtom.debugLabel = "project context"

export const useProjectContext = () => {
  const value = useAtomValue(projectContextAtom)
  if (value == null) {
    throw new Error("Context is not set.")
  }

  return value
}
