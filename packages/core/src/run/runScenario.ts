import type { RouteId } from "@/domain/entity/route/route"
import type { ProjectEntry } from "@/injector"
import type { Id } from "@/utils/idType"
import type { Result } from "@/utils/result"
import type { RunResultWithNodeId } from "@/domain/workflow/nodeStates"

import { exportPluginIdAtom } from "@/domain/datasource/plugin"
import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { store } from "@/ui/adapter/store"
import { getInjectedContent } from "@/injector"
import { error, success } from "@/utils/result"
import { routeAtom } from "@/domain/datasource/route"
import { associateBy } from "@/utils/set"

export const runScenario = async (
  runId: Id,
  projectEntry: ProjectEntry,
  routeIds: RouteId[],
): Promise<Result<{ runId: Id; results: RunResultWithNodeId }, string>> => {
  const exportPluginId = store.get(exportPluginIdAtom)
  const run = getInjectedContent().exec.libs?.[exportPluginId]?.run
  if (run == null) {
    // TODO: エラークラス
    return error("ブラウザでは実行できません")
  }

  const scenarios = store.get(decomposedForLibAtom)
  const targetScenarios = scenarios.filter((scenario) =>
    routeIds.includes(scenario.meta.id),
  )

  // 結果から逆引きできるように
  const routes = routeIds.map((routeId) => store.get(routeAtom(routeId)))
  const nodeNameMap = associateBy(
    routes.flatMap((route) => route.path),
    "name",
  )

  const result = await run(
    targetScenarios.map((scenario) => ({
      id: scenario.meta.id,
      path: `${projectEntry.path}/${scenario.meta.title}.yaml`,
    })),
  )

  if (result.result === "error") {
    // TODO: エラークラス
    return error("実行に失敗しました")
  }

  return success({
    runId,
    results: result.value.map((runResult) => ({
      ...runResult,
      steps: runResult.steps.map((stepResult) => ({
        ...stepResult,
        nodeId: nodeNameMap.get(stepResult.key)!.id,
      })),
    })),
  })
}
