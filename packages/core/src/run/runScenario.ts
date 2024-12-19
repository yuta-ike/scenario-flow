import type { RouteId } from "@/domain/entity/route/route"
import type { Id } from "@/utils/idType"
import type { Result } from "@/utils/result"
import type { RunResultWithNodeId } from "@/domain/workflow/nodeStates"
import type { EnginePlugin } from "@/plugins/type"
import type { NodeId } from "@/domain/entity/node/node"
import type { InjectedContentExecRunner } from "@/injector/parts/exec"
import type { DirHandle } from "@/injector/parts/io"

import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { store } from "@/ui/adapter/store"
import { error, success } from "@/utils/result"
import { decomposedAtom } from "@/domain/selector/decomposed"

export const runScenario = async (
  runId: Id,
  dirHandle: DirHandle,
  routeIds: RouteId[],
  enginePlugin: EnginePlugin,
  exec: InjectedContentExecRunner,
): Promise<Result<{ runId: Id; results: RunResultWithNodeId }, string>> => {
  const runner = enginePlugin.runner

  const scenarios = store.get(decomposedAtom)

  const nodeTitleIdMap = new Map(
    scenarios.flatMap((scenario) =>
      scenario.steps.map((step) => [step.title, step.id]),
    ),
  )

  const targetScenarios = store
    .get(decomposedForLibAtom)
    .filter((scenario) => (routeIds as string[]).includes(scenario.meta.id))
    .map((scenario) => ({
      ...scenario,
      path: `${dirHandle.path}/${scenario.meta.title}.yaml`,
    }))

  const result = await runner({
    scenarios: targetScenarios,
    command: exec,
  })

  if (result.result === "error") {
    console.error(result.error)
    return error("実行に失敗しました")
  }

  return success({
    runId,
    results: result.value.map((runResult) => ({
      ...runResult,
      steps: runResult.steps.map((stepResult) => ({
        ...stepResult,
        id: nodeTitleIdMap.get(stepResult.id) as NodeId,
      })),
    })),
  })
}
