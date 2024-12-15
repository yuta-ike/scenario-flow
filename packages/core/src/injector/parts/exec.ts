import type { Result } from "@/utils/result"

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
