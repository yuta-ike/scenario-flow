import { atom, useAtom, useAtomValue } from "jotai"
import { useCallback, useMemo } from "react"

import { primitiveRoutesAtom } from "@/domain/datasource/route"

export const currentPageAtom = atom("")

export const pagesAtom = atom((get) =>
  new Set(get(primitiveRoutesAtom).map((route) => route.page))
    .values()
    .toArray(),
)

export const usePages = () => {
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
