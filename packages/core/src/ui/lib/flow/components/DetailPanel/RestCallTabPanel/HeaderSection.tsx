import React, { useCallback } from "react"

import { RestCallActionBadge } from "../RestCallActionBadge"
import { Section } from "../Section"

import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"

import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { updateActionInstance } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"

type Props = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const HeaderSection = ({ nodeId, ai }: Props) => {
  // description
  const handleUpdateDescription = useCallback(
    (update: string) => {
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        description: applyUpdate(update, ai.description),
        instanceParameter: {
          ...ai.instanceParameter,
        },
      })
    },
    [ai, nodeId],
  )

  return (
    <Section>
      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center">
          <div className="flex grow items-center gap-3">
            <MethodChip size="lg">{ai.instanceParameter.method!}</MethodChip>{" "}
            <div className="text flex grow items-baseline gap-4 leading-none">
              {ai.instanceParameter.path!}
            </div>
          </div>
          {ai.action.type === "rest_call" && (
            <div className="shrink-0">
              <RestCallActionBadge action={ai.action} />
            </div>
          )}
        </div>
        <div>
          {ai.action.resourceType === "resource" && (
            <div className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-2 text-sm leading-none text-slate-800">
              <span className="opacity-50">OpID:</span>
              {ai.action.resourceIdentifier.identifier.operationId}
            </div>
          )}
        </div>
        <div className="relative">
          <TextareaAutosize
            className="w-[calc(100%+16px)] -translate-x-2 resize-none rounded border border-transparent px-[7px] py-1 text-sm transition hover:border-slate-200 focus:border-slate-200 focus:outline-none"
            value={
              0 < ai.description.length ? ai.description : ai.action.description
            }
            onChange={(e) => handleUpdateDescription(e.target.value)}
            placeholder="説明を追加"
          />
        </div>
      </div>
    </Section>
  )
}
