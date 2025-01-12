import type { PrimitiveRoute, RouteId } from "../route/route"
import type { Receiver, Transition } from "../type"

const HISTORY_SIZE = 10

export type NodeStates = { results: RunResultItem[] }

export type RunResultItem =
  | {
      runId: string
      status: "done"
      results: StepResultItem[]
    }
  | {
      runId: string
      status: "loading"
      results?: undefined
    }
  | {
      runId: string
      status: "notExecuted"
      results?: undefined
    }

export type StepResultItem = {
  routeId: RouteId
} & (
  | {
      result: "success"
    }
  | {
      result: "failure"
      message: string
    }
  | {
      result: "skipped"
    }
)

export const addResult: Transition<NodeStates, [RunResultItem]> = (
  entity,
  result: RunResultItem,
) => {
  return {
    ...entity,
    results: [...entity.results, result].slice(-HISTORY_SIZE),
  }
}

export const replaceResultToDone: Transition<
  NodeStates,
  [runId: string, runResult: RunResultItem]
> = (entity, runId, runResult) => {
  return {
    ...entity,
    results: entity.results.map((result) =>
      result.runId === runId ? runResult : result,
    ),
  }
}

export const getRecentlyResult: Receiver<
  NodeStates,
  [],
  RunResultItem | null
> = (entity) => {
  return entity.results.at(-1) ?? null
}

export type ResolvedNodeStates = { results: ResolvedStepResultItem[] }

export type ResolvedStepResultItem = {
  runId: string
  results: ({
    routeId: RouteId
    route: PrimitiveRoute
  } & (
    | {
        result: "success"
      }
    | {
        result: "failure"
        message: string
      }
    | {
        result: "skipped"
      }
  ))[]
}
export const getRecentlyResolvedResult: Receiver<
  ResolvedNodeStates,
  [],
  ResolvedStepResultItem | null
> = (entity) => {
  return entity.results.at(-1) ?? null
}
