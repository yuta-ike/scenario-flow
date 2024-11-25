import type { EnginePluginRunner } from "../type"

import { error, success } from "@/utils/result"

type RunnResult = {
  failure: number
  skipped: number
  success: number
  total: number
  results: {
    id: string
    path: string
    result: "success" | "failure" | "skipped"
    steps: {
      id: string
      key: string
      result: "success" | "failure" | "skipped"
    }[]
  }[]
}

export const runnRunner: EnginePluginRunner<string[]> = async ({
  command,
  scenarios,
}) => {
  // node.titleとnode.idの対応
  const nodeNameMap = new Map(
    scenarios.flatMap((scenario) =>
      scenario.contents.steps.map((step) => [step.id, step.title] as const),
    ),
  )

  // pathとscenario.idの対応
  const pathIdMap = new Map(
    scenarios.map((scenario) => [scenario.path, scenario.meta.id]),
  )
  const result = await command(scenarios.map((scenario) => scenario.path))

  if (result.result === "error" || result.value.length === 0) {
    return error(`${result.error as any}`)
  }

  const runnResult: RunnResult = JSON.parse(result.value)

  return success(
    runnResult.results.map(({ steps, result, path }) => ({
      id: pathIdMap.get(path)!,
      result,
      steps: steps.map((stepResult) => ({
        id: nodeNameMap.get(stepResult.key)!,
        result: stepResult.result,
      })),
    })),
  )
}
