import { atom, useAtom, useAtomValue } from "jotai"
import { useCallback, useMemo } from "react"
import { atomFamily, useAtomCallback } from "jotai/utils"

import { useRoutes } from "../adapter/query"

import { primitiveRoutesAtom, routesAtom } from "@/domain/datasource/route"

export const currentPageAtom = atom("")

export const pagesAtom = atom((get) =>
  new Set(get(primitiveRoutesAtom).map((route) => route.page))
    .values()
    .toArray(),
)

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
