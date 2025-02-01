import { NodeId, ResolvedActionInstance } from "../../../../../domain/entity"

export type SectionComponentInterface = (props: {
  actionInstance: ResolvedActionInstance
  nodeId: NodeId
  onChangePage: (page: string) => void
}) => React.ReactNode
