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
  console.log(scenarios)
  // node.titleとnode.idの対応
  const nodeNameMap = new Map(
    scenarios.flatMap((scenario) =>
      Object.entries(scenario.contents.steps).map(
        ([id, step]) => [id, step.title] as const,
      ),
    ),
  )

  // pathとscenario.idの対応
  const pathIdMap = new Map(
    scenarios.map((scenario) => [scenario.path, scenario.meta.id]),
  )
  const paths = scenarios.map((scenario) => scenario.path)

  try {
    const result = await command(paths)

    if (result.result === "error" || result.value.length === 0) {
      return error(`${result.error as any}`)
    }

    const runnResult: RunnResult = JSON.parse(result.value)
    console.log(nodeNameMap)
    console.log(runnResult)

    return success(
      runnResult.results.map(({ steps, result }, index) => ({
        id: scenarios[index]!.meta.id,
        result,
        steps: steps.map((stepResult) => ({
          id: stepResult.key,
          result: stepResult.result,
        })),
      })),
    )
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return error(`${e}`)
  }
}
