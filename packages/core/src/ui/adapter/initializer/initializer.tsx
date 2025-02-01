import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useAtomCallback } from "jotai/utils"

import { DirHandle } from "../../../injector"
import { exportPlugins } from "../../../plugins"
import { useProjectContext, useInjected, useStore } from "../../lib/provider"
import { load, loadDiff } from "../../../io/scenario/load"
import {
  buildPrimitiveNode,
  Decomposed,
  Expression,
  toEnginePluginId,
  toNodeId,
  userDefinedActionEq,
} from "../../../domain/entity"
import {
  actionIdCountCache,
  nodeDefaultNameCal,
  nodeIdsAtom,
  nodeNameUniqCache,
  primitiveNodeAtom,
} from "../../../domain/datasource/node"
import {
  currentEnginePluginIdAtom,
  supportedEnginePluginsAtom,
} from "../../../domain/datasource/plugin"
import {
  resourcesAtom,
  resourceActionAtom,
} from "../../../domain/datasource/resource"
import {
  nodeIdCountCache,
  nodeIdRouteIdCache,
  primitiveRouteAtom,
  routeIdsAtom,
  routeNamesCache,
  routePageCache,
} from "../../../domain/datasource/route"
import { userDefinedActionAtom } from "../../../domain/datasource/userDefinedAction"
import { variableAtom } from "../../../domain/datasource/variable"
import { atomWithIdMap, Store } from "@scenario-flow/util/lib"
import {
  pagesAtom,
  routeIdsInPageAtom,
  routesInPageAtom,
} from "../../state/page"
import { decomposedAtom } from "../../../domain/selector/decomposed"
import { parseDecomposedActionToActionInstance } from "../../../io/scenario/parseToEntities"

const useInitializer = () => {
  const [initialized, setInitialized] = useState<Map<DirHandle, true | null>>(
    new Map(),
  )
  const context = useProjectContext()
  const injected = useInjected()
  const store = useStore()

  useEffect(() => {
    const { entry } = context
    if (initialized.get(entry)) {
      return
    }

    initialized.set(entry, true)
    setInitialized(new Map(initialized))
    void initializeFn(store)
  }, [])

  // 初期化関数
  const initializeFn = useCallback(
    async (store: Store, prevDecomposed?: Decomposed[]) => {
      const { entry, config } = context

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

      if (prevDecomposed == null) {
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
      } else {
        console.log(prevDecomposed)
        const diff = await loadDiff(
          entry,
          enginePlugin.deserialize,
          injected,
          prevDecomposed,
        )

        diff.createStepsAll.map((step) => {
          return buildPrimitiveNode(`${step.id}`, {
            name: step.title,
            description: step.description,
            actionInstances: [],
            // actionInstances: step.actions.map((ai) =>
            //   parseDecomposedActionToActionInstance(
            //     ai,
            //     decomposed.page,
            //     pathRouteIdMap,
            //     udaPathMap,
            //     context,
            //   ),
            // ),
            config: {
              condition: step.condition,
              loop: step.loop,
            },
          })
        })

        diff.updateStepsAll.map((step) => {
          const prev = store.get(primitiveNodeAtom(toNodeId(`${step.id}`)))
          store.set(primitiveNodeAtom(toNodeId(`${step.id}`)), {
            update: {
              ...prev,
              name: step.title,
              description: step.description,
              config: {
                condition: step.condition,
                loop: step.loop,
              },
            },
          })
        })

        diff.createRoute.map((route) => {
          store.set(primitiveRouteAtom(route.id), {
            create: {
              id: route.id,
              name: route.title,
              description: route.description ?? "",
              page: route.page,
              variables: route.variables.map(({ variable, value }) => ({
                id: variable.id,
                value: value as unknown as Expression,
              })),
              path: route.steps.map((step) => `${step.id}`),
            },
          })
        })

        diff.updateRoute.map((route) => {
          store.set(primitiveRouteAtom(route.id), {
            update: {
              name: route.title,
              color: route.color,
              description: route.description ?? "",
              page: route.page,
              variables: route.variables.map(({ variable, value }) => ({
                id: variable.id,
                value: value as unknown as Expression,
              })),
              path: route.steps.map((step) => `${step.id}`),
            },
          })
        })
      }
    },
    [],
  )

  const reload = useCallback(async () => {
    const { entry } = context
    initialized.set(entry, null)
    setInitialized(new Map(initialized))

    // const prevDecomposed = store.get(decomposedAtom)

    // clear all nodes
    const pages = store.get(pagesAtom)

    store
      .get(routeIdsAtom)
      .values()
      .forEach((routeId) => store.set(primitiveRouteAtom.removeAtom, routeId))
    store
      .get(nodeIdsAtom)
      .values()
      .forEach((nodeId) => store.set(primitiveNodeAtom.removeAtom, nodeId))

    // clear all family
    atomWithIdMap.clear()
    primitiveRouteAtom.clearAll()
    primitiveNodeAtom.clearAll()
    variableAtom.clearAll()
    userDefinedActionAtom.clearAll()
    pages.map((page) => {
      routeIdsInPageAtom.remove(page)
      routesInPageAtom.remove(page)
    })

    // clear store
    store.clear()
    store.set(nodeNameUniqCache, new Set())
    store.set(actionIdCountCache, new Map())
    store.set(routeNamesCache, new Set())
    store.set(nodeIdRouteIdCache, new Map())
    store.set(nodeIdCountCache, new Map())
    store.set(routePageCache, new Map())

    await initializeFn(store /*prevDecomposed*/)
    initialized.set(entry, true)
    setInitialized(new Map(initialized))
  }, [initializeFn, store])

  return {
    initialized: initialized.get(context.entry) != null,
    reload,
  }
}

const ReloadContext = createContext<{ reload: () => void } | null>(null)

export const Initializer = ({ children }: { children: React.ReactNode }) => {
  const { initialized, reload } = useInitializer()
  const value = useMemo(() => ({ reload }), [reload])
  if (!initialized) {
    return null
  }
  return (
    <ReloadContext.Provider value={value}>{children}</ReloadContext.Provider>
  )
}

export const useReloader = () => {
  const context = useContext(ReloadContext)
  if (context == null) {
    throw new Error()
  }
  return context.reload
}
