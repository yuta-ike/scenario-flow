import "jotai-devtools/styles.css"

import { Provider as JotaiProvider } from "jotai"
import { DevTools } from "jotai-devtools"
import { useEffect, useRef } from "react"

import { buildContext } from "./context"
import { store } from "./store"

import type { ProjectEntry } from "@/injector"

import { load } from "@/io/scenario/load"
import { primitiveNodeAtom } from "@/domain/datasource/node"
import { primitiveRouteAtom } from "@/domain/datasource/route"
import {
  DEFAULT_PATTERN_ID,
  globalVariableAtom,
  globalVariableIdsAtom,
  globalVariableValueAtom,
} from "@/domain/datasource/globalVariable"
import { genId } from "@/utils/uuid"
import { toGlobalVariableValueId } from "@/domain/entity/globalVariable/globalVariable.util"
import { buildGlobalVariableBind } from "@/domain/entity/globalVariable/globalVariable"
import { userDefinedActionAtom } from "@/domain/datasource/userDefinedAction"

export type ProviderProps = {
  children: React.ReactNode
  projectEntry: ProjectEntry
}

export const Provider = ({ children, projectEntry }: ProviderProps) => {
  const initialized = useRef<Map<ProjectEntry, true>>(new Map())

  useEffect(() => {
    const init = async () => {
      if (initialized.current.get(projectEntry)) {
        return
      }
      initialized.current.set(projectEntry, true)

      const entities = await load(projectEntry)

      // User defined action
      entities.userDefinedActions.map((action) => {
        store.set(userDefinedActionAtom(action.id), { create: action })
      })

      // global variable
      const globalVariableIds = entities.globalVariables.map(
        (variable) => variable.id,
      )
      store.set(globalVariableIdsAtom, new Set(globalVariableIds))
      entities.globalVariables.map((variable) => {
        globalVariableAtom(variable.id, variable)
        const id = toGlobalVariableValueId(genId())
        globalVariableValueAtom(
          id,
          buildGlobalVariableBind(id, {
            globalVariableId: variable.id,
            value: variable.value,
            patternId: DEFAULT_PATTERN_ID,
          }),
        )
      })

      // primitive node
      entities.nodes.map((node) => {
        store.set(primitiveNodeAtom(node.id), { create: node })
      })

      // route
      entities.routes.map((route) => {
        store.set(primitiveRouteAtom(route.id), { create: route })
      })
    }

    void init()
  }, [projectEntry])

  return (
    <JotaiProvider store={store.store}>
      {children}
      <DevTools />
    </JotaiProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const context = buildContext(store)
