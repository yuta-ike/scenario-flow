import type { NodeId } from "../entity/node/node"
import type { RouteId } from "../entity/route/route"

export class NodeDoesNotExistInRoute extends Error {
  constructor(
    private routeId: RouteId,
    private nodeId: NodeId,
  ) {
    super(`Node with id ${nodeId} does not exist in route`)
  }
  readonly _tag = "NodeDoesNotExistInRoute"
}
