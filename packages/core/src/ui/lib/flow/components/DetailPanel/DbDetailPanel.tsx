import { useCallback } from "react"

import { Section } from "./Section"

import { RichInput, TextareaAutosize } from "@scenario-flow/ui"
import { applyUpdate, associateWithList } from "@scenario-flow/util"

import { updateActionInstance } from "../../../../adapter/command"
import { useStore } from "../../../provider"
import {
  NodeId,
  ResolvedDbActionInstance,
  Expression,
  getBoundIn,
  getVariableName,
} from "../../../../../domain/entity"
import { useNodeEnvironment } from "../../../../adapter/query"

type Props = {
  nodeId: NodeId
  ai: ResolvedDbActionInstance
}

export const DbDetailPanel = ({ nodeId, ai }: Props) => {
  const store = useStore()
  const handleUpdateQuery = useCallback(
    (update: string) => {
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          query: applyUpdate(update, ai.instanceParameter.query) as Expression,
        },
      })
    },
    [ai, nodeId],
  )

  const environment = useNodeEnvironment(nodeId)
  const environmentMap = associateWithList(
    environment,
    ({ variable: { boundIn } }) =>
      boundIn === "global"
        ? "global"
        : boundIn.type === "node"
          ? boundIn.node.name
          : boundIn.route.name,
  )

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Section title="クエリ">
        <RichInput
          minRows={4}
          value={ai.instanceParameter.query}
          onChange={handleUpdateQuery}
          lang="template"
          suggests={environmentMap
            .entries()
            .map(([boundInName, binds]) => {
              const { variable } = binds[0]
              const boundIn = getBoundIn(variable)
              const isThisNode = boundIn?.nodeId === nodeId
              return {
                title: isThisNode
                  ? "このブロックで定義された変数"
                  : boundInName,
                variables: binds.map(({ variable }) => ({
                  name: getVariableName(variable),
                  value: variable.name,
                })),
              }
            })
            .toArray()}
        />
      </Section>
    </div>
  )
}
