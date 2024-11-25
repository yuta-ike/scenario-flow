import type { RouteId } from "@/domain/entity/route/route"
import type { ProjectEntry } from "@/injector"
import type { Id } from "@/utils/idType"
import type { Result } from "@/utils/result"
import type { RunResultWithNodeId } from "@/domain/workflow/nodeStates"
import type { EnginePlugin } from "@/plugins/type"
import type { NodeId } from "@/domain/entity/node/node"

import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { store } from "@/ui/adapter/store"
import { error, success } from "@/utils/result"

export const runScenario = async (
  runId: Id,
  projectEntry: ProjectEntry,
  routeIds: RouteId[],
  enginePlugin: EnginePlugin,
): Promise<Result<{ runId: Id; results: RunResultWithNodeId }, string>> => {
  const runner = enginePlugin.runner

  const scenarios = store.get(decomposedForLibAtom)
  const targetScenarios = scenarios.filter((scenario) =>
    (routeIds as string[]).includes(scenario.meta.id),
  )

  const scenarioWithPath = targetScenarios.map((scenario) => ({
    ...scenario,
    path: `${projectEntry.path}/${scenario.meta.title}.yaml`,
  }))

  const result = await runner({
    scenarios: scenarioWithPath,
    // @ts-expect-error
    command: () => {}, // Injectorから取得
  })

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
        id: stepResult.id as NodeId,
      })),
    })),
  })
}
