import { TbCheck, TbFlag2 } from "react-icons/tb"

import { useSetState } from "@scenario-flow/util"
import { useAtomCallback } from "jotai/utils"
import { useCallback } from "react"
import {
  useCustomModal,
  CustomModalContent,
  ErrorDisplay,
} from "@scenario-flow/ui"
import {
  currentEnginePluginIdAtom,
  enginePluginAtom,
} from "../../../../../domain/datasource/plugin"
import { RouteId } from "../../../../../domain/entity"
import { decomposedAtom } from "../../../../../domain/selector/decomposed"
import { decomposedForLibAtom } from "../../../../../domain/selector/decomposedForPlugin"
import { runAndUpdateNodeStates } from "../../../../../domain/workflow/nodeStates"
import { runScenario } from "../../../../../run/runScenario"
import { useRoutes } from "../../../../adapter/query"
import { runAsync } from "../../../effect/run"
import { useProjectContext, useInjected, useStore } from "../../../provider"

type Props = {
  initialSelected?: RouteId[]
}
export const RunModalContent = ({ initialSelected }: Props) => {
  const store = useStore()

  const routes = useRoutes()
  const { entry } = useProjectContext()
  const { onClose } = useCustomModal()

  const [selected, { toggle }] = useSetState(
    initialSelected ?? routes.map((route) => route.id),
  )

  const injected = useInjected()

  const handleSubmit = useAtomCallback(
    useCallback(
      async (get) => {
        onClose()

        const enginePluginId = get(currentEnginePluginIdAtom)

        if (enginePluginId == null) {
          window.alert("実行可能なライブラリが見つかりません")
          return
        }
        const run = injected.exec.libs?.[enginePluginId]?.run
        if (run == null) {
          window.alert("実行可能なライブラリが見つかりません")
          return
        }

        const result = await runAsync(
          store,
          runAndUpdateNodeStates(
            (runId, routeIds) =>
              runScenario(runId, entry, routeIds, run, {
                decomposed: get(decomposedAtom),
                decomposedForLib: get(decomposedForLibAtom),
                enginePlugin: get(enginePluginAtom),
              }),
            selected,
          ),
        )

        if (result.result === "error") {
          window.alert(result.error)
        }
      },
      [entry, injected.exec.libs, onClose, selected],
    ),
    { store: store.store },
  )
  return (
    <CustomModalContent
      title="実行するシナリオを選択"
      okLabel="実行する"
      onSubmit={handleSubmit}
      disabled={selected.length === 0}
    >
      <div className="flex flex-col items-center">
        <div className="flex w-full flex-col items-center gap-4 overflow-y-auto border-b border-b-slate-200 bg-slate-50 p-4">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => toggle(route.id)}
              aria-pressed={selected.includes(route.id)}
              className="group flex w-[320px] items-center rounded-xl border-2 border-slate-300 bg-slate-100 px-3 py-2 text-start transition aria-pressed:border-[#66C94D] aria-pressed:bg-white"
            >
              <div className="flex grow flex-col">
                <TbFlag2 size={24} fill={route.color} stroke={route.color} />
                <div>{route.name}</div>
              </div>
              <div>
                <div className="rounded-full bg-[#66C94D] p-1 text-white opacity-0 group-aria-pressed:opacity-100">
                  <TbCheck size={14} strokeWidth={3} />
                </div>
              </div>
            </button>
          ))}
          {routes.length === 0 && (
            <ErrorDisplay>実行可能なシナリオがありません</ErrorDisplay>
          )}
        </div>
        {0 < routes.length && (
          <div className="sticky bottom-0 z-10 grid w-full place-items-center border-t border-t-slate-200 bg-white py-4">
            <div className="flex w-[240px] items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <span>実行数</span>
              <span>{selected.length}件</span>
            </div>
          </div>
        )}
      </div>
    </CustomModalContent>
  )
}
