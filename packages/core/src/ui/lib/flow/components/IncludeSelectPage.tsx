import { useAtomCallback } from "jotai/utils"
import React, { useCallback, useState } from "react"
import { TbFlag2, TbFolder } from "react-icons/tb"

import type { RouteId } from "@/domain/entity/route/route"

import { currentPageAtom, usePages } from "@/ui/state/page"
import { Select } from "@/ui/components/common/Select"
import { useRoutes } from "@/ui/adapter/query"
import { fill } from "@/utils/placeholder"

type Props = {
  onCreate: (routeId: RouteId) => void
}

export const IncludeSelectPage = ({ onCreate }: Props) => {
  const [selectedPage, setSelectedPage] = useState(
    useAtomCallback(useCallback((get) => get(currentPageAtom), [])),
  )

  const pages = usePages()
  const routes = useRoutes()

  const routesInPage = routes
    .filter((route) => route.page === selectedPage)
    .map((route) => ({
      id: route.id,
      label: route.name,
    }))

  const handleUpdatePage = (page: string) => {
    // Routeが一つに確定する場合は即座に確定
    if (routes.filter((route) => route.page === page).length === 1) {
      onCreate(routesInPage[0]!.id)
      return
    }
    setSelectedPage(page)
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Select
          prefix={TbFolder}
          value={selectedPage}
          items={pages.map((page) => ({
            id: fill(page, "/"),
            label: page,
          }))}
          onChange={(value) => handleUpdatePage(value === "/" ? "" : value)}
          placeholder="ページを選択"
        />
      </div>
      <div>
        <Select
          prefix={TbFlag2}
          value={null}
          items={routesInPage}
          onChange={(value) => {
            if (value != null) {
              onCreate(value)
            }
          }}
          placeholder="シナリオを選択"
        />
      </div>
    </div>
  )
}
