import { Context, Effect, Match, pipe } from "effect"

import { addResult, replaceResultToDone } from "../entity/nodeStates/nodeStates"

import { _getNodeIds, _getRoutes } from "./node"
import { _genId } from "./common"

import type {
  NodeStates,
  RunResultItem,
  StepResultItem,
} from "../entity/nodeStates/nodeStates"
import type { RouteId } from "../entity/route/route"
import type { Id } from "@/utils/idType"
import type { NodeId } from "../entity/node/node"

import { error, success, type Result } from "@/utils/result"

export type GetNodeStates = (nodeId: NodeId) => NodeStates
export const GetNodeStates = Context.GenericTag<GetNodeStates>("GetNodeStates")
export const _getNodeStates = (nodeId: NodeId) =>
  GetNodeStates.pipe(Effect.map((getNodeStates) => getNodeStates(nodeId)))

export type SetNodeStates = (nodeId: NodeId, nodeStates: NodeStates) => void
export const SetNodeStates = Context.GenericTag<SetNodeStates>("SetNodeStates")
export const _setNodeStates = (nodeId: NodeId, nodeStates: NodeStates) =>
  SetNodeStates.pipe(
    Effect.map((setNodeStates) => setNodeStates(nodeId, nodeStates)),
  )

export type RunResultWithNodeId = {
  id: string
  result: "success" | "failure" | "skipped"
  steps: {
    nodeId: NodeId
    result: "success" | "failure" | "skipped"
  }[]
}[]

// ノードに状態を追加する
const _appendNodeStates = (nodeId: NodeId, result: RunResultItem) =>
  pipe(
    _getNodeStates(nodeId),
    Effect.map((_) => addResult(_, result)),
    Effect.tap((_) => _setNodeStates(nodeId, _)),
  )

// ノードの状態を変更する
const _changeNodeStates = (
  nodeId: NodeId,
  runId: string,
  result: RunResultItem,
) =>
  pipe(
    _getNodeStates(nodeId),
    Effect.map((_) => replaceResultToDone(_, runId, result)),
    Effect.tap((_) => _setNodeStates(nodeId, _)),
  )

// 特定のrunIdのステートを無かったことにする
const _popNodeStates = (nodeId: NodeId, runId: string) =>
  pipe(
    _getNodeStates(nodeId),
    Effect.map((_) => ({
      ..._,
      results: _.results.filter((result) => result.runId !== runId),
    })),
    Effect.tap((_) => _setNodeStates(nodeId, _)),
  )

// ローディング状態にする
export const makeNodeStatesLoading = (runId: string, routeIds: RouteId[]) =>
  pipe(
    Effect.succeed(routeIds),
    Effect.flatMap((_) => _getRoutes(routeIds)),
    Effect.map((routes) => new Set(routes.flatMap((route) => route.path))),
    // 実行されるノード
    Effect.tap(
      Effect.forEach((_) => _appendNodeStates(_, { runId, status: "loading" })),
    ),
    // 実行されないノード
    Effect.tap((_) =>
      pipe(
        _getNodeIds(),
        Effect.map((ids) => new Set(ids).difference(_)),
        Effect.tap(
          Effect.forEach((_) =>
            _appendNodeStates(_, { runId, status: "notExecuted" }),
          ),
        ),
      ),
    ),
  )

// 実行失敗時にキャンセル状態にする
export const deleteNodeStates = (runId: string, routeIds: RouteId[]) =>
  pipe(
    Effect.succeed(routeIds),
    Effect.flatMap((_) => _getRoutes(_)),
    Effect.map((routes) => new Set(routes.flatMap((route) => route.path))),
    Effect.tap(Effect.forEach((_) => _popNodeStates(_, runId))),
  )

export const addNodeResults = ({
  runId,
  results,
}: {
  runId: Id
  results: RunResultWithNodeId | undefined
}): Effect.Effect<void, never, GetNodeStates | SetNodeStates> =>
  Effect.Do.pipe(
    // 実行されたノードの処理
    Effect.let("resultMap", () => {
      const map = new Map<NodeId, StepResultItem[]>()
      results?.forEach((routeResult) => {
        const routeId = routeResult.id as RouteId
        routeResult.steps.forEach((stepResult) => {
          const newStatus =
            stepResult.result === "failure"
              ? {
                  routeId,
                  result: stepResult.result,
                  message: "失敗しました",
                }
              : {
                  routeId,
                  result: stepResult.result,
                }

          map.set(stepResult.nodeId, [
            ...(map.get(stepResult.nodeId) ?? []),
            newStatus,
          ])
        })
      })
      return map
    }),
    Effect.tap(({ resultMap }) =>
      Effect.forEach(resultMap, ([nodeId, results]) =>
        _changeNodeStates(nodeId, runId, { runId, status: "done", results }),
      ),
    ),
  )

// 実行して結果をnodeStatesに反映する
export const runAndUpdateNodeStates = (
  run: (
    runId: Id,
    routeIds: RouteId[],
  ) => Promise<
    Result<
      {
        runId: Id
        results: RunResultWithNodeId
      },
      string
    >
  >,
  routeIds: RouteId[],
) =>
  Effect.Do.pipe(
    Effect.bind("runId", () => _genId()),
    Effect.tap(({ runId }) => makeNodeStatesLoading(runId, routeIds)),
    Effect.bind("result", ({ runId }) =>
      Effect.promise(() => run(runId, routeIds)),
    ),
    Effect.flatMap(({ result, runId }) =>
      Match.value(result).pipe(
        Match.when({ result: "success" }, ({ value }) =>
          pipe(addNodeResults(value), Effect.as(success(null))),
        ),
        Match.orElse(({ error: errorValue }) =>
          pipe(deleteNodeStates(runId, routeIds), Effect.as(error(errorValue))),
        ),
      ),
    ),
  )
