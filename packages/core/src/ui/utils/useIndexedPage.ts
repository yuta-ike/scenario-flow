import { useCallback, useMemo, useState } from "react"

export const useIndexedPage = (maxPage: number) => {
  const [page, setPage] = useState(0)

  const nextPage = useCallback(() => {
    setPage((prev) => {
      if (prev + 1 === maxPage) {
        return 0
      } else {
        return prev + 1
      }
    })
  }, [maxPage])

  const prevPage = useCallback(() => {
    setPage((prev) => {
      if (prev === 0) {
        return maxPage - 1
      } else {
        return prev - 1
      }
    })
  }, [maxPage])

  return useMemo(
    () => ({ page, nextPage, prevPage }),
    [nextPage, page, prevPage],
  )
}
