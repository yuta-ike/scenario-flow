import { useCallback, useMemo, useState } from "react"
import { TbFlag2, TbFolder, TbViewfinder } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"

import { Section } from "./Section"

import type { SetStateAction } from "react"
import { IconButton, Select } from "@scenario-flow/ui"
import {
  unwrapNull,
  associateBy,
  fill,
  applyUpdate,
  KVItem,
} from "@scenario-flow/util"
import { useStore } from "../../../provider"
import { useRoutes } from "../../../../adapter/query"
import {
  currentPageAtom,
  usePages,
  useSetCurrentPage,
} from "../../../../state/page"
import {
  NodeId,
  ResolvedIncludeActionInstance,
  RouteId,
  toLocalVariableId,
  buildLocalVariable,
  Expression,
  emptyEnvironment,
} from "../../../../../domain/entity"
import { updateActionInstance } from "../../../../adapter/command"
import { useFocusNode } from "../../../../state/focusedNodeId"
import { ParameterTable } from "../../../ParameterTable"

type Props = {
  nodeId: NodeId
  ai: ResolvedIncludeActionInstance
}

export const IncludeDetailPanel = ({ nodeId, ai }: Props) => {
  const store = useStore()

  const routes = useRoutes()
  const refRoute = unwrapNull(ai.instanceParameter.ref)

  const [selectedPage, setSelectedPage] = useState(
    useAtomCallback(
      useCallback(
        (get) => {
          return refRoute?.page ?? get(currentPageAtom)
        },
        [refRoute?.page],
      ),
      { store: store.store },
    ),
  )

  const focus = useFocusNode()
  const setPage = useSetCurrentPage()

  const pages = usePages()

  const routesInPage = routes
    .filter((route) => route.page === selectedPage)
    .map((route) => ({
      id: route.id,
      label: route.name,
    }))

  const handleUpdate = (routeId: RouteId) => {
    updateActionInstance(store, nodeId, ai.id, {
      ...ai,
      instanceParameter: {
        ...ai.instanceParameter,
        ref: routeId,
      },
    })
  }

  const handleUpdateParameter = useCallback(
    (update: SetStateAction<KVItem[]>) => {
      if (ai.instanceParameter.ref.value == null) {
        return
      }

      const variablesMap = associateBy(
        ai.instanceParameter.parameters.map((parameter) => parameter.variable),
        "id",
      )
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ref: ai.instanceParameter.ref.value.id,
          parameters: applyUpdate(
            update,
            ai.instanceParameter.parameters.map((parameter) => ({
              id: parameter.variable.id,
              key: parameter.variable.name,
              value: parameter.value,
            })),
          ).map((kv) => {
            const variable =
              variablesMap.get(toLocalVariableId(kv.id)) ??
              buildLocalVariable(kv.id, {
                namespace: "vars",
                boundIn: nodeId,
                name: kv.key,
                description: "",
                schema: "any",
              })
            return {
              variable:
                variable.name === kv.key
                  ? variable
                  : {
                      ...variablesMap.get(toLocalVariableId(kv.id))!,
                      name: kv.key,
                    },
              value: kv.value as Expression,
            }
          }),
        },
      })
    },
    [ai, nodeId],
  )

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <Section title="シナリオ呼び出し">
        <div>
          <div className="flex items-center gap-2">
            {1 < pages.length && (
              <div className="max-w-[160px] grow">
                <Select
                  prefix={TbFolder}
                  value={selectedPage}
                  items={pages.map((page) => ({
                    id: fill(page, "/"),
                    label: fill(page, "/"),
                  }))}
                  onChange={(value) =>
                    setSelectedPage(value === "/" ? "" : value)
                  }
                />
              </div>
            )}
            <div className="max-w-[320px] grow">
              <Select
                prefix={TbFlag2}
                value={refRoute?.id ?? null}
                items={routesInPage}
                onChange={(value) => {
                  if (value == null) {
                    return
                  }
                  handleUpdate(value)
                }}
                placeholder="シナリオを選択"
              />
            </div>
            {refRoute != null && (
              <div>
                <IconButton
                  variant="segmented"
                  size="sm"
                  label="フォーカス"
                  icon={TbViewfinder}
                  onClick={() => {
                    setPage(refRoute.page)
                    const firstNodeId = refRoute.path[0]
                    if (firstNodeId != null) {
                      focus(firstNodeId)
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </Section>
      <Section title="パラメーター">
        <ParameterTable
          rows={useMemo(
            () =>
              ai.instanceParameter.parameters.map((parameter) => ({
                id: parameter.variable.id,
                key: parameter.variable.name,
                value: parameter.value,
              })),
            [ai.instanceParameter.parameters],
          )}
          setRows={handleUpdateParameter}
          placeholderKey="limit"
          placeholderValue="100"
          environment={emptyEnvironment}
          currentNodeId={nodeId}
        />
      </Section>
    </div>
  )
}
