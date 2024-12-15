import type { ResolvedActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"

export type SectionComponentInterface = (props: {
  actionInstance: ResolvedActionInstance
  nodeId: NodeId
  onChangePage: (page: string) => void
}) => React.ReactNode
