import { Result } from "@scenario-flow/util"

export type InjectedContentExecRunner = (
  paths: string[],
) => Promise<Result<string, string>>

export type InjectedContentExec = {
  libs?: Record<
    string,
    {
      run?: InjectedContentExecRunner
    }
  >
}
