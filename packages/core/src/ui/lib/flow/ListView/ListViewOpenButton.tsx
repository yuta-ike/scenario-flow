import { FiChevronsRight } from "react-icons/fi"
import { TbFlag2 } from "react-icons/tb"
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
      className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm transition hover:bg-slate-50"
      onClick={() => setShow(true)}
    >
      <TbFlag2
        style={{ color: focusedRoute.color }}
        className="fill-current stroke-current"
      />
      リスト表示
      <FiChevronsRight />
    </button>
  )
}
