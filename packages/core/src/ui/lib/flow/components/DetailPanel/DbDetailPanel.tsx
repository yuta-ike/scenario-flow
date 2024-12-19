import React, { useCallback } from "react"

import { Section } from "./Section"

import type { ResolvedDbActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"
import type { Expression } from "@/domain/entity/value/expression"

import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import { updateActionInstance } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"

type Props = {
  nodeId: NodeId
  ai: ResolvedDbActionInstance
}

export const DbDetailPanel = ({ nodeId, ai }: Props) => {
  const handleUpdateQuery = useCallback(
    (update: string) => {
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          query: applyUpdate(update, ai.instanceParameter.query) as Expression,
        },
      })
    },
    [ai, nodeId],
  )

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Section title="クエリ">
        <TextareaAutosize
          className="resize-none rounded-lg border border-slate-200 p-3 font-mono text-xs focus:outline-none"
          rows={4}
          value={ai.instanceParameter.query}
          onChange={(e) => handleUpdateQuery(e.target.value)}
        />
      </Section>
    </div>
  )
}
