import { atom, useAtomValue } from "jotai"

import { RouteTile } from "./RouteTile"

import { AccordionRoot } from "@scenario-flow/ui"
import { routePageCache } from "../../../../../domain/datasource/route"
import { currentPageAtom, usePage } from "../../../../state/page"
import { useStore } from "../../../provider"

const currentPageRouteIds = atom((get) =>
  (get(routePageCache).get(get(currentPageAtom)) ?? new Set())
    .values()
    .toArray(),
)

export const RoutePanel = () => {
  const store = useStore()
  const { currentPage } = usePage()
  const routeIds = useAtomValue(currentPageRouteIds, {
    store: store.store,
  })

  return (
    <div className="h-max min-h-[40%] border-t border-t-slate-200">
      <div className="w-full p-2">
        <div className="text-xs text-slate-600">
          {currentPage.length === 0 ? "シナリオ" : currentPage}
        </div>
      </div>
      {routeIds.length === 0 && (
        <div className="grid w-full place-items-center p-4 text-sm text-slate-400">
          シナリオは定義されていません
        </div>
      )}
      <AccordionRoot>
        <ol className="flex h-max w-full flex-col gap-1">
          {routeIds.map((routeId) => (
            <li key={routeId} className="h-max w-full">
              <RouteTile routeId={routeId} />
            </li>
          ))}
        </ol>
      </AccordionRoot>
    </div>
  )
}
