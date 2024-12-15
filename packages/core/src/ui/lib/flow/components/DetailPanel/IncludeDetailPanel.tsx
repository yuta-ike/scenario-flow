import { useCallback, useState } from "react"
import { TbFlag2, TbFolder, TbViewfinder } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"

import { Section } from "./Section"

import type { NodeId } from "@/domain/entity/node/node"
import type { ResolvedIncludeActionInstance } from "@/domain/entity/node/actionInstance"
import type { RouteId } from "@/domain/entity/route/route"

import { useRoutes } from "@/ui/adapter/query"
import { Select } from "@/ui/components/common/Select"
import { IconButton } from "@/ui/components/common/IconButton"
import { useFocusNode } from "@/ui/state/focusedNodeId"
import { currentPageAtom, usePages, useSetCurrentPage } from "@/ui/state/page"
import { updateActionInstance } from "@/ui/adapter/command"
import { unwrapNull } from "@/utils/result"
import { fill } from "@/utils/placeholder"

type Props = {
  nodeId: NodeId
  ai: ResolvedIncludeActionInstance
}

export const IncludeDetailPanel = ({ nodeId, ai }: Props) => {
  const routes = useRoutes()
  const refRoute = unwrapNull(ai.instanceParameter.ref)

  const [selectedPage, setSelectedPage] = useState(
    useAtomCallback(
      useCallback(
        (get) => {
          return refRoute?.page ?? get(currentPageAtom)
        },
        [refRoute?.page],
      ),
    ),
  )

  const focus = useFocusNode()
  const setPage = useSetCurrentPage()

  const pages = usePages()

  const routesInPage = routes
    .filter((route) => route.page === selectedPage)
    .map((route) => ({
      id: route.id,
      label: route.name,
    }))

  const handleUpdate = (routeId: RouteId) => {
    updateActionInstance(nodeId, ai.id, {
      ...ai,
      instanceParameter: {
        ...ai.instanceParameter,
        ref: routeId,
      },
    })
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Section title="インポート">
        <div>
          <div className="flex items-center gap-2">
            <div className="max-w-[160px] grow">
              <Select
                prefix={TbFolder}
                value={selectedPage}
                items={pages.map((page) => ({
                  id: fill(page, "/"),
                  label: fill(page, "/"),
                }))}
                onChange={(value) =>
                  setSelectedPage(value === "/" ? "" : value)
                }
              />
            </div>
            <div className="max-w-[320px] grow">
              <Select
                prefix={TbFlag2}
                value={refRoute?.id ?? null}
                items={routesInPage}
                onChange={(value) => {
                  if (value == null) {
                    return
                  }
                  handleUpdate(value)
                }}
                placeholder="シナリオを選択"
              />
            </div>
            {refRoute != null && (
              <div>
                <IconButton
                  variant="segmented"
                  size="sm"
                  label="フォーカス"
                  icon={TbViewfinder}
                  onClick={() => {
                    setPage(refRoute.page)
                    const firstNodeId = refRoute.path[0]
                    if (firstNodeId != null) {
                      focus(firstNodeId)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}
