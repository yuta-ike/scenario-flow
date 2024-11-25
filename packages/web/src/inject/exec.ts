import { run } from "@stepci/runner"

import type { Workflow } from "@stepci/runner"
import type { InjectedContent } from "@scenario-flow/core"

// @ts-expect-error
export const runStepCi: NonNullable<
  InjectedContent["exec"]["libs"]
>["stepci"]["run"] = async (paths) => {
  const results = await Promise.all(
    paths
      // @ts-expect-error
      .map(({ content }) => content as unknown as Workflow)
      .map((workflow) => run(workflow)),
  )

  return results
}
