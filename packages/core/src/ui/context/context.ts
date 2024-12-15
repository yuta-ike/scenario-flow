import { atom, useAtomValue } from "jotai"

import type { ConfigFormat } from "@/schemas/configFormat/type/configFormat"
import type { DirHandle } from "@/injector/parts/io"

export type ProjectContext = {
  entry: DirHandle
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
