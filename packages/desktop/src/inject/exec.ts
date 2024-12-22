import { Command } from "@tauri-apps/plugin-shell"
import { error, success } from "@scenario-flow/core"

import type { InjectedContentExecRunner } from "@scenario-flow/core"

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
  } else {
    return error(result.stderr)
  }
}
