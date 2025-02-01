import { error, Id, Result, success } from "@scenario-flow/util"
import { Decomposed } from "../domain/entity/decompose/decomposed"
import { NodeId } from "../domain/entity/node/node"
import { RouteId } from "../domain/entity/route/route"
import { RunResultWithNodeId } from "../domain/workflow/nodeStates"
import { DirHandle, InjectedContentExecRunner } from "../injector"
import { LibMetaFormat, EnginePlugin } from "../plugins/type"

export const runScenario = async (
  runId: Id,
  dirHandle: DirHandle,
  routeIds: RouteId[],
  run: InjectedContentExecRunner,
  {
    decomposed,
    decomposedForLib,
    enginePlugin,
  }: {
    decomposed: Decomposed[]
    decomposedForLib: LibMetaFormat<any>[]
    enginePlugin: EnginePlugin
  },
): Promise<Result<{ runId: Id; results: RunResultWithNodeId }, string>> => {
  const runner = enginePlugin.runner

  const nodeTitleIdMap = new Map(
    decomposed.flatMap((d) => d.steps.map((step) => [step.title, step.id])),
  )

  const targetScenarios = decomposedForLib
    .filter((scenario) => (routeIds as string[]).includes(scenario.meta.id))
    .map((scenario) => ({
      ...scenario,
      path: `${dirHandle.path}/${scenario.meta.title}.yaml`,
    }))

  const result = await runner({
    scenarios: targetScenarios,
    command: run,
  })

  if (result.result === "error") {
    console.error(result.error)
    return error("実行に失敗しました")
  }

  console.log(result)

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
