import { error, success } from "@scenario-flow/util"
import type { EnginePluginRunner } from "../type"

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
  const paths = scenarios.map((scenario) => scenario.path)

  try {
    const result = await command(paths)

    if (result.result === "error" || result.value.length === 0) {
      return error(`${result.error as any}`)
    }

    const runnResult: RunnResult = JSON.parse(result.value)

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
