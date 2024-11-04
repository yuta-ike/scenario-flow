import { RunScenarioError } from "@scenario-flow/core"
import { Command } from "@tauri-apps/plugin-shell"

import type { InjectedContent } from "@scenario-flow/core"

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

export const runRunn: NonNullable<
  InjectedContent["exec"]["libs"]
>["runn"]["run"] = async (paths: { id: string; path: string }[]) => {
  const result = await Command.create("runn", [
    "run",
    "--scopes",
    "read:parent",
    "--format",
    "json",
    ...paths.map(({ path }) => path),
  ]).execute()
  if (0 < result.stdout.length) {
    const runnResult: RunnResult = JSON.parse(result.stdout)

    return {
      result: "success" as const,
      value: runnResult.results.map(({ steps, result }, index) => ({
        id: paths[index]!.id,
        result,
        steps: steps.map(({ key, result }) => ({
          key,
          result,
        })),
      })),
      error: undefined,
    }
  } else {
    return {
      result: "error" as const,
      value: undefined,
      error: new RunScenarioError(result.stdout),
    }
  }
}
