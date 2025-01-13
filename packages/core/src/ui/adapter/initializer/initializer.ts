import { useEffect, useState } from "react"

import { useProjectContext } from "../ProjectContext"
import { store } from "../store"

import type { DirHandle } from "@/injector/parts/io"

import { exportPlugins } from "@/plugins"
import { toEnginePluginId } from "@/domain/entity/plugin/toEnginePlugin"
import {
  currentEnginePluginIdAtom,
  supportedEnginePluginsAtom,
} from "@/domain/datasource/plugin"
import { load } from "@/io/scenario/load"
import { userDefinedActionAtom } from "@/domain/datasource/userDefinedAction"
import { primitiveNodeAtom } from "@/domain/datasource/node"
import { primitiveRouteAtom } from "@/domain/datasource/route"
import { resourceActionAtom, resourcesAtom } from "@/domain/datasource/resource"
import { variableAtom } from "@/domain/datasource/variable"
import { useInjected } from "@/container"

const useInitializer = () => {
  const [initialized, setInitialized] = useState<Map<DirHandle, true>>(
    new Map(),
  )
  const context = useProjectContext()
  const injected = useInjected()

  useEffect(() => {
    const { entry, config } = context

    const init = async () => {
      if (initialized.get(entry)) {
        return
      }
      initialized.set(entry, true)
      setInitialized(new Map(initialized))

      const enginePlugin = exportPlugins[toEnginePluginId(config.engine)]
      if (enginePlugin == null) {
        throw new Error("Unknown plugin name")
      }

      // plugin
      store.set(currentEnginePluginIdAtom, toEnginePluginId(config.engine))
      store.set(
        supportedEnginePluginsAtom,
        new Map([[toEnginePluginId(config.engine), enginePlugin]]),
      )

      const resourceNameMap = new Map(
        store.get(resourcesAtom).map((resource) => [resource.name, resource]),
      )

      const entities = await load(entry, enginePlugin.deserialize, injected, {
        resourceNameMap,
        getResourceAction: (id) => store.get(resourceActionAtom(id)),
      })

      // User defined action
      entities.userDefinedActions.map((action) => {
        store.set(userDefinedActionAtom(action.id), { create: action })
      })

      // variables
      entities.variables.map((variable) => {
        store.set(variableAtom(variable.id), { create: variable })
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
  }, [context, initialized, injected])

  return initialized.get(context.entry) != null
}

export const Initializer = ({ children }: { children: React.ReactNode }) => {
  const initialized = useInitializer()
  if (!initialized) {
    return null
  }
  return children
}
