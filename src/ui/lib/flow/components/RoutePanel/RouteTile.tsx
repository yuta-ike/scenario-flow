import React from "react"
import { TbFlag2 } from "react-icons/tb"

import type { FormEvent } from "react"
import type { RouteId } from "@/domain/entity/route/route"
import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"

import { useRoute } from "@/ui/adapter/query"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { AccordionItem } from "@/ui/components/common/Accordion"
import { updteRoute } from "@/ui/adapter/command"

type Props = {
  routeId: RouteId
}

export const RouteTile = ({ routeId }: Props) => {
  const route = useRoute(routeId)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // @ts-expect-error
    const name: string = e.currentTarget.name.value
    handleUpdate(name)
  }

  const handleUpdate = (name: string) => {
    updteRoute(routeId, { name })
  }

  return (
    <AccordionItem
      key={route.id}
      value={route.id}
      title={
        <div className="flex items-center gap-1">
          <div
            className="shrink-0"
            style={{
              color: route.color,
            }}
          >
            <TbFlag2 size={20} fill={route.color} />
          </div>
          <div className="grow">
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                defaultValue={route.name}
                type="text"
                className="w-full rounded border border-transparent px-0 py-1 text-sm transition-[padding] hover:border-slate-200 hover:px-1 focus:px-1 focus:outline-none focus-visible:border-slate-400"
                placeholder="シナリオ名"
                onBlur={(e) => handleUpdate(e.target.value)}
              />
            </form>
          </div>
        </div>
      }
      gap={4}
    >
      {/* ノード一覧 */}
      <ol className="flex flex-col gap-2 pl-6">
        {route.path.map((node) => (
          <li key={node.id}>
            {node.actionInstances
              .filter(
                (instance): instance is ResolvedRestCallActionInstance =>
                  instance.type === "rest_call",
              )
              .map((instance) => {
                const parameter = instance.action.parameter
                return (
                  <div key={instance.actionInstanceId}>
                    <div className="flex items-center gap-2 text-sm">
                      <MethodChip truncate={3}>{parameter.method}</MethodChip>
                      <div className="grow truncate">{parameter.path}</div>
                    </div>
                  </div>
                )
              })}
          </li>
        ))}
      </ol>
    </AccordionItem>
  )
}
