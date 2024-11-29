import { Command } from "@tauri-apps/plugin-shell"

import type { InjectedContentExecRunner } from "@scenario-flow/core"

import { error, success } from "@/utils/result"

// type RunnResult = {
//   failure: number
//   skipped: number
//   success: number
//   total: number
//   results: {
//     id: string
//     path: string
//     result: "success" | "failure" | "skipped"
//     steps: {
//       id: string
//       key: string
//       result: "success" | "failure" | "skipped"
//     }[]
//   }[]
// }

export const runRunn: InjectedContentExecRunner = async (paths: string[]) => {
  const result = await Command.create("runn", [
    "run",
    "--scopes",
    "read:parent",
    "--format",
    "json",
    ...paths,
  ]).execute()
  if (0 < result.stdout.length) {
    return success(result.stdout)
    // const runnResult: RunnResult = JSON.parse(result.stdout)

    // return {
    //   result: "success" as const,
    //   value: runnResult.results.map(({ steps, result }, index) => ({
    //     id: paths[index]!.id,
    //     result,
    //     steps: steps.map(({ key, result }) => ({
    //       key,
    //       result,
    //     })),
    //   })),
    //   error: undefined,
    // }
  } else {
    return error(result.stderr)
    // return {
    //   result: "error" as const,
    //   value: undefined,
    //   error: new RunScenarioError(result.stdout),
    // }
  }
}
