import { run } from "@stepci/runner"

import type { Workflow } from "@stepci/runner"
import type { InjectedContent } from "@scenario-flow/core"

export const runStepCi: NonNullable<
  InjectedContent["exec"]["libs"]
>["stepci"]["run"] = async (paths) => {
  const results = await Promise.all(
    paths
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .map(({ content }) => content as unknown as Workflow)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      .map((workflow) => run(workflow)),
  )

  // TODO: todo
  console.log(results)
}
