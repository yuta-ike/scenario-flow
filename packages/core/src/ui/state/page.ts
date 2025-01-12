import { atom, useAtom, useAtomValue } from "jotai"
import { useCallback, useMemo } from "react"
import { atomFamily, useAtomCallback } from "jotai/utils"

import { useRoutes } from "../adapter/query"

import {
  primitiveRouteAtom,
  routePageCache,
  routesAtom,
} from "@/domain/datasource/route"

export const currentPageAtom = atom("")

export const pagesAtom = atom((get) => get(routePageCache).keys().toArray())

export const usePage = () => {
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom)
  const pages = useAtomValue(pagesAtom)

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
  )

export const usePages = () => {
  const routes = useRoutes()

  const pages = useMemo(
    () => new Set(routes.map((route) => route.page)).values().toArray(),
    [routes],
  )

  return pages
}

const routesInPageAtom = atomFamily((page: string) => {
  return atom((get) => {
    const routes = get(routesAtom)
    return routes.filter((route) => route.page === page)
  })
})

export const useRoutesInPage = (page: string) =>
  useAtomValue(routesInPageAtom(page))

export const routeIdsInPageAtom = atomFamily((page: string) => {
  return atom((get) => get(routePageCache).get(page)?.values().toArray() ?? [])
})

export const useRouteIdsInPage = (page: string) =>
  useAtomValue(routeIdsInPageAtom(page))

export const primitiveRoutesInPageAtom = atomFamily((page: string) =>
  atom((get) => {
    const routeIds = get(routeIdsInPageAtom(page))
    return routeIds.map((routeId) => get(primitiveRouteAtom(routeId)))
  }),
)

export const usePrimitiveRoutesInPage = (page: string) =>
  useAtomValue(primitiveRoutesInPageAtom(page))
