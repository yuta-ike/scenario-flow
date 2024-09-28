import { RouteTile } from "./RouteTile"

import { AccordionRoot } from "@/ui/components/common/Accordion"
import { useRouteIds } from "@/ui/adapter/query"

export const RoutePanel = () => {
  const routeIds = useRouteIds()
  return (
    <div className="rounded-lg bg-white shadow-object">
      <AccordionRoot>
        <ol className="w-full">
          {routeIds.map((routeId) => (
            <li key={routeId} className="w-full border-b border-slate-200 p-2">
              <RouteTile routeId={routeId} />
            </li>
          ))}
        </ol>
      </AccordionRoot>
    </div>
  )
}
