import { TbCheck, TbFlag2 } from "react-icons/tb"

import type { RouteId } from "@/domain/entity/route/route"

import { useRoutes } from "@/ui/adapter/query"
import {
  CustomModalContent,
  useCustomModal,
} from "@/ui/components/common/CustomModal"
import { useSetState } from "@/ui/utils/useSetState"
import { ErrorDisplay } from "@/ui/components/ErrorDisplay"
import { runScenario } from "@/run/runScenario"
import { useProjectEntry } from "@/ui/lib/context/ProjectEntryProvider"
import { runAsync } from "@/ui/lib/effect/run"
import { runAndUpdateNodeStates } from "@/domain/workflow/nodeStates"

type Props = {
  initialSelected?: RouteId[]
}
export const RunModalContent = ({ initialSelected }: Props) => {
  const routes = useRoutes()
  const projectEntry = useProjectEntry()
  const { onClose } = useCustomModal()

  const [selected, { toggle }] = useSetState(
    initialSelected ?? routes.map((route) => route.id),
  )

  const handleSubmit = async () => {
    onClose()

    const result = await runAsync(
      runAndUpdateNodeStates(
        (runId, routeIds) => runScenario(runId, projectEntry, routeIds),
        selected,
      ),
    )

    if (result.result === "error") {
      window.alert(result.error)
    }
  }
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
