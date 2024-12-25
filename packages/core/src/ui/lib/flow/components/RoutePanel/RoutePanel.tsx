import { atom, useAtomValue } from "jotai"

import { RouteTile } from "./RouteTile"

import { AccordionRoot } from "@/ui/components/common/Accordion"
import { routesAtom } from "@/domain/datasource/route"
import { currentPageAtom, usePage } from "@/ui/state/page"

const currentPageRouteIds = atom((get) => {
  const page = get(currentPageAtom)
  const routes = get(routesAtom)
  return routes.filter((route) => route.page === page).map((route) => route.id)
})

export const RoutePanel = () => {
  const { currentPage } = usePage()
  const routeIds = useAtomValue(currentPageRouteIds)

  return (
    <div className="h-max min-h-[40%] border-t border-t-slate-200">
      <div className="w-full p-2">
        <div className="text-xs text-slate-600">
          {currentPage.length === 0 ? "ルート" : currentPage}
        </div>
      </div>
      {routeIds.length === 0 && (
        <div className="grid w-full place-items-center p-4 text-sm text-slate-400">
          シナリオは定義されていません
        </div>
      )}
      <AccordionRoot>
        <ol className="h-max w-full">
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
