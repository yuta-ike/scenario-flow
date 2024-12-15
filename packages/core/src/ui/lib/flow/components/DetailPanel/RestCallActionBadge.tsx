import React from "react"
import { TbTag } from "react-icons/tb"

import type { ResolvedAction } from "@/domain/entity/action/action"
import type { ResourceActionIdentifier } from "@/domain/entity/action/identifier"

import { useResource } from "@/ui/adapter/query"

type Props = {
  action: ResolvedAction<"rest_call">
}

export const RestCallActionBadge = ({ action }: Props) => {
  if (action.resourceType === "resource") {
    return (
      <ResourceActionBadge
        identifier={action.resourceIdentifier}
        action={action}
      />
    )
  }

  return null
}

const ResourceActionBadge = ({
  identifier,
  action,
}: {
  identifier: ResourceActionIdentifier
  action: ResolvedAction<"rest_call">
}) => {
  const resource = useResource(identifier.resourceId)
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <div className="rounded border border-slate-200 px-2 py-1 leading-none">
        {resource.name}
      </div>
      {action.schema.jsonSchema?.tags?.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1 leading-none text-slate-600"
        >
          <TbTag />
          {tag}
        </div>
      ))}
    </div>
  )
}
