import { atom, useAtomValue } from "jotai"

import { RouteTile } from "./RouteTile"

import { AccordionRoot } from "@/ui/components/common/Accordion"
import { routesAtom } from "@/domain/datasource/route"
import { currentPageAtom, usePages } from "@/ui/state/page"

const currentPageRouteIds = atom((get) => {
  const page = get(currentPageAtom)
  const routes = get(routesAtom)
  return routes.filter((route) => route.page === page).map((route) => route.id)
})

export const RoutePanel = () => {
  const { currentPage } = usePages()
  const routeIds = useAtomValue(currentPageRouteIds)
  return (
    <div className="rounded-lg bg-white/60 shadow-object backdrop-blur-sm">
      <div className="w-full p-2">
        <div className="text-xs text-slate-600">
          {currentPage.length === 0 ? "ルート" : currentPage}
        </div>
      </div>
      <AccordionRoot>
        <ol className="w-full">
          {routeIds.map((routeId) => (
            <li key={routeId} className="w-full border-t border-slate-200 p-2">
              <RouteTile routeId={routeId} />
            </li>
          ))}
        </ol>
      </AccordionRoot>
    </div>
  )
}
