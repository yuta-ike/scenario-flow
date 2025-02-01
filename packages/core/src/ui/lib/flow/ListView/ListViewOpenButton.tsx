import { TbFlag2, TbPlayerPlay } from "react-icons/tb"
import { Resizable } from "re-resizable"

import { RunModalContent } from "../components/RunButton/RunModalContent"

import { useSetShowListView, useShowListView } from "./showListViewAtom"
import { ListView } from "./ListView"

import { CustomModal } from "@scenario-flow/ui"
import { useFocusedRoute } from "../../../state/focusedRouteId"

export const ListViewOpenButton = () => {
  const focusedRoute = useFocusedRoute()
  const show = useShowListView()
  const setShow = useSetShowListView()

  if (focusedRoute == null) {
    return null
  }
  return (
    <Resizable
      defaultSize={{ width: 400, height: "100%" }}
      minWidth={300}
      maxWidth={show ? undefined : 300}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {!show ? (
          <div className="relative flex w-full flex-col p-3 text-start text-xs shadow-sm transition">
            <button
              type="button"
              onClick={() => setShow(true)}
              aria-label="シナリオパネルを開く"
              className="absolute inset-0 hover:bg-slate-50"
            />
            <div className="pointer-events-none z-10 flex w-full items-center gap-1">
              <TbFlag2
                size={16}
                style={{ color: focusedRoute.color }}
                className="shrink-0 fill-current stroke-current"
              />
              <div className="grow">{focusedRoute.name}</div>
              <CustomModal
                modal={<RunModalContent initialSelected={[focusedRoute.id]} />}
              >
                <button
                  title="テストを実行する"
                  type="button"
                  className="pointer-events-auto flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-white transition hover:bg-slate-600 hover:shadow-sm active:translate-y-0.5"
                >
                  <TbPlayerPlay size={14} />
                  <div>実行</div>
                </button>
              </CustomModal>
            </div>
          </div>
        ) : (
          <ListView />
        )}
      </div>
    </Resizable>
  )
}
