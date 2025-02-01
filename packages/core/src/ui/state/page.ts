import { atom, useAtom, useAtomValue } from "jotai"
import { useCallback, useMemo } from "react"
import { atomFamily, useAtomCallback } from "jotai/utils"

import { useRoutes } from "../adapter/query"
import {
  routePageCache,
  routesAtom,
  primitiveRouteAtom,
} from "../../domain/datasource/route"
import { useStore } from "../lib/provider"

export const currentPageAtom = atom("")

export const pagesAtom = atom((get) => get(routePageCache).keys().toArray())

export const usePage = () => {
  const store = useStore()
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom, {
    store: store.store,
  })
  const pages = useAtomValue(pagesAtom, { store: store.store })

  const select = useCallback(
    (page: string) => {
      setCurrentPage(page)
    },
    [setCurrentPage],
  )

  return useMemo(
    () => ({
      currentPage,
      pages,
      select,
    }),
    [currentPage, pages, select],
  )
}

export const useSetCurrentPage = () =>
  useAtomCallback(
    useCallback((_, set, page: string) => {
      set(currentPageAtom, page)
    }, []),
    { store: useStore().store },
  )

export const usePages = () => {
  const routes = useRoutes()

  const pages = useMemo(
    () => new Set(routes.map((route) => route.page)).values().toArray(),
    [routes],
  )

  return pages
}

export const routesInPageAtom = atomFamily((page: string) => {
  return atom((get) => {
    const routes = get(routesAtom)
    return routes.filter((route) => route.page === page)
  })
})

export const useRoutesInPage = (page: string) =>
  useAtomValue(routesInPageAtom(page), { store: useStore().store })

export const routeIdsInPageAtom = atomFamily((page: string) => {
  return atom((get) => get(routePageCache).get(page)?.values().toArray() ?? [])
})

export const useRouteIdsInPage = (page: string) =>
  useAtomValue(routeIdsInPageAtom(page), { store: useStore().store })

export const primitiveRoutesInPageAtom = atomFamily((page: string) =>
  atom((get) => {
    const routeIds = get(routeIdsInPageAtom(page))
    return routeIds.map((routeId) => get(primitiveRouteAtom(routeId)))
  }),
)

export const usePrimitiveRoutesInPage = (page: string) =>
  useAtomValue(primitiveRoutesInPageAtom(page), { store: useStore().store })
