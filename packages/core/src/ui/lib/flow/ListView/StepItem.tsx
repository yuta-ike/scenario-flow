import { TbComponents, TbExternalLink } from "react-icons/tb"

import { useStore } from "../../provider"
import { Drawer } from "@scenario-flow/ui"
import { unwrapNull } from "@scenario-flow/util"
import {
  NodeId,
  getFilledPath,
  isResourceAction,
  ResolvedAction,
  ResourceActionIdentifier,
} from "../../../../domain/entity"
import { updateNode } from "../../../adapter/command"
import { useNode, useResource } from "../../../adapter/query"
import { MethodChip } from "../../../components/common/MethodChip"
import { ResourceDetail } from "../../../page/index/Settings/ResourceDetail"
import { useFocusNode, useIsNodeFocused } from "../../../state/focusedNodeId"

type Props = {
  nodeId: NodeId
  index: number
}

export const StepItem = ({ nodeId, index }: Props) => {
  const store = useStore()
  const focus = useFocusNode()
  const isFocused = useIsNodeFocused(nodeId)

  const node = useNode(nodeId)

  const updateNodeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNode(store, nodeId, { name: e.target.value })
  }

  return (
    <div className="flex items-center gap-2">
      <div
        data-selected={isFocused}
        className="outline-transparen group relative w-full grow overflow-hidden rounded-lg border border-slate-200 bg-white outline outline-2 outline-offset-2 outline-transparent transition"
      >
        <button
          className="absolute inset-0"
          type="button"
          onClick={() => focus(nodeId)}
        />
        <div className="flex gap-2 border-b border-b-slate-200 px-2 py-1">
          <div className="my-0.5 shrink-0">
            <span className="shrink-0 text-slate-400 group-data-[selected=true]:font-bold group-data-[selected=true]:text-blue-400">
              #{index}
            </span>{" "}
          </div>
          <div className="flex w-full grow flex-col text-sm text-slate-800">
            <input
              type="text"
              className="z-10 max-w-[300px] grow rounded border border-transparent bg-transparent px-1 py-1 hover:border-slate-200 hover:bg-white focus:border-slate-200 focus:bg-white focus:outline-none"
              value={node.name}
              onChange={updateNodeName}
            />
            <div className="line-clamp-3 w-full whitespace-pre-line p-1 text-sm text-slate-500 empty:hidden">
              {node.description}
            </div>
          </div>
        </div>
        <div className="flex w-full">
          <div className="w-[32px] shrink-0" />
          <div className="flex grow flex-col">
            {node.actionInstances.map((ai) => (
              <button
                key={ai.id}
                type="button"
                className="relative border-t border-t-slate-200 p-2 text-start first:border-t-0 empty:hidden hover:bg-slate-50"
                onClick={() => focus(node.id)}
              >
                {ai.type === "rest_call" ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <MethodChip>
                        {ai.instanceParameter.method ?? "GET"}
                      </MethodChip>
                      <div className="text-start text-sm">
                        {getFilledPath(ai.instanceParameter)}
                      </div>
                    </div>
                    {isResourceAction(ai.action) && (
                      <DefinitionPanel action={ai.action} />
                    )}
                  </div>
                ) : ai.type === "validator" &&
                  0 < ai.instanceParameter.contents.length ? (
                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-bold text-blue-400">Test </div>
                    <div className="font-mono text-xs">
                      {ai.instanceParameter.contents}
                    </div>
                  </div>
                ) : ai.type === "include" ? (
                  <div className="flex items-baseline gap-2">
                    <button
                      type="button"
                      // onClick={() => onChangePage(refRoute.page)}
                      className="flex -translate-x-1 items-center gap-1 rounded px-1 py-1 text-start text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-800 hover:underline"
                    >
                      <div className="shrink-0">
                        <TbExternalLink />
                      </div>
                      <div>
                        {unwrapNull(ai.instanceParameter.ref)?.page}/
                        {unwrapNull(ai.instanceParameter.ref)?.name}
                      </div>
                    </button>
                  </div>
                ) : ai.type === "binder" &&
                  0 < ai.instanceParameter.assignments.length ? (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-blue-400">Bind </div>
                    {ai.instanceParameter.assignments.map((assign) => (
                      <div
                        key={assign.variableId}
                        className="font-mono text-xs"
                      >
                        {assign.variable.name},{" "}
                      </div>
                    ))}
                  </div>
                ) : ai.type === "db" ? (
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-blue-400">DB </div>
                    <div className="line-clamp-3 text-start font-mono text-xs">
                      {ai.instanceParameter.query}
                    </div>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const DefinitionPanel = ({
  action,
}: {
  action: ResolvedAction & ResourceActionIdentifier
}) => {
  const resource = useResource(action.resourceIdentifier.resourceId)
  if (action.type !== "rest_call") {
    return null
  }

  return (
    <div className="flex w-max gap-1 rounded border border-blue-200 bg-blue-100 px-2 py-1">
      <div className="flex items-center gap-1">
        <TbComponents />
      </div>
      <div className="text-xs">
        {action.resourceIdentifier.identifier.operationId} in{" "}
        <Drawer
          key={resource.id}
          title={resource.name}
          description=""
          modal={<ResourceDetail resourceId={resource.id} />}
        >
          <button type="button" className="text-xs underline">
            {resource.name}
          </button>
        </Drawer>
      </div>
    </div>
  )
}
