import { useCallback } from "react"

import { Section } from "./Section"
import { useStore } from "../../../provider"
import { applyUpdate, associateWithList } from "@scenario-flow/util"
import {
  NodeId,
  ValidatorActionInstance,
  Expression,
  getBoundIn,
  getVariableName,
} from "../../../../../domain/entity"
import { updateActionInstance } from "../../../../adapter/command"
import { useNodeEnvironment } from "../../../../adapter/query"
import { RichInput } from "@scenario-flow/ui"

type ValidatorTabPanelProps = {
  nodeId: NodeId
  ai: ValidatorActionInstance
}

export const ValidatorTabPanel = ({ nodeId, ai }: ValidatorTabPanelProps) => {
  const store = useStore()

  const handleUpdateValidator = useCallback(
    (update: string) => {
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          contents: applyUpdate(
            update,
            ai.instanceParameter.contents,
          ) as Expression,
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
      <Section title="バリデーション">
        <RichInput
          value={ai.instanceParameter.contents ?? ""}
          onChange={(value) => handleUpdateValidator(value)}
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
          minRows={6}
          lang="expression"
        />
      </Section>
    </div>
  )
}
