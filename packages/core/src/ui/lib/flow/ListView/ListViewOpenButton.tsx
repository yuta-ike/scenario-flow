import { TbFlag2, TbList } from "react-icons/tb"
import { useSetAtom } from "jotai"

import { showListViewAtom } from "./ListView"

import { useFocusedRoute } from "@/ui/state/focusedRouteId"

export const ListViewOpenButton = () => {
  const focusedRoute = useFocusedRoute()
  const setShow = useSetAtom(showListViewAtom)

  if (focusedRoute == null) {
    return null
  }
  return (
    <button
      type="button"
      className="flex w-full flex-col rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm transition hover:bg-slate-50"
      onClick={() => setShow(true)}
    >
      <div className="flex w-full items-center gap-1">
        <TbFlag2
          size={16}
          style={{ color: focusedRoute.color }}
          className="fill-current stroke-current"
        />
        <div>{focusedRoute.name}</div>
        <TbList className="ml-auto" size={18} />
      </div>
      <div />
    </button>
  )
}
