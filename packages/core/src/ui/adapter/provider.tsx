import "jotai-devtools/styles.css"

import { Provider as JotaiProvider } from "jotai"
import { DevTools } from "jotai-devtools"
import { useEffect, useRef } from "react"

import { projectContextAtom, type ProjectContext } from "../context/context"

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
import {
  currentEnginePluginIdAtom,
  supportedEnginePluginsAtom,
} from "@/domain/datasource/plugin"
import { exportPlugins } from "@/plugins"
import { toEnginePluginId } from "@/domain/entity/plugin/toEnginePlugin"

export type ProviderProps = {
  children: React.ReactNode
  context: ProjectContext
}

export const Provider = ({
  children,
  context: { entry, config },
}: ProviderProps) => {
  const initialized = useRef<Map<ProjectEntry, true>>(new Map())

  useEffect(() => {
    const init = async () => {
      if (initialized.current.get(entry)) {
        return
      }
      initialized.current.set(entry, true)

      const enginePlugin = exportPlugins[toEnginePluginId(config.engine)]
      if (enginePlugin == null) {
        throw new Error("Unknown plugin name")
      }

      // context
      store.set(projectContextAtom, { entry, config })

      // plugin
      store.set(currentEnginePluginIdAtom, toEnginePluginId(config.engine))
      // TODO: プラグインの設定
      store.set(
        supportedEnginePluginsAtom,
        new Map([[toEnginePluginId(config.engine), enginePlugin]]),
      )

      const entities = await load(entry, enginePlugin.deserialize)

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
  }, [config, config.engine, entry])

  return (
    <JotaiProvider store={store.store}>
      {children}
      <DevTools />
    </JotaiProvider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const context = buildContext(store)
